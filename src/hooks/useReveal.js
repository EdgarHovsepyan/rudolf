import { useEffect } from 'react';

/**
 * Мягкое появление блоков при прокрутке. Контент виден по умолчанию;
 * атрибут data-reveal лишь добавляет движение там, где браузер его разрешает.
 * Элементы, уже попавшие в экран при загрузке, не прячем вовсе.
 */
export default function useReveal(deps = []) {
    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const nodes = Array.from(document.querySelectorAll('.reveal'));
        if (!nodes.length || reduced || typeof IntersectionObserver === 'undefined') {
            nodes.forEach((n) => n.removeAttribute('data-reveal'));
            return undefined;
        }
        const vh = window.innerHeight;
        nodes.forEach((n) => {
            const r = n.getBoundingClientRect();
            // Уже на экране: показываем сразу, без анимации
            if (r.top < vh * 0.92) n.removeAttribute('data-reveal');
            else n.setAttribute('data-reveal', 'pending');
        });
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.setAttribute('data-reveal', 'in');
                        io.unobserve(e.target);
                    }
                });
            },
            { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
        );
        nodes.filter((n) => n.getAttribute('data-reveal') === 'pending').forEach((n) => io.observe(n));
        // Страховка: что бы ни случилось, через 4 с всё видно
        const failsafe = setTimeout(() => nodes.forEach((n) => n.setAttribute('data-reveal', 'in')), 4000);
        return () => {
            io.disconnect();
            clearTimeout(failsafe);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}
