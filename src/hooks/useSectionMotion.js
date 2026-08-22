import { gsap, ScrollTrigger, useGSAP, reducedMotion, splitWords } from '../lib/gsap';

/**
 * Общая хореография секций. Опт-ин через data-атрибуты внутри scope:
 *  - [data-split]      заголовок появляется по словам снизу из маски
 *  - [data-stagger]    дети (или [data-stagger-item]) приезжают с лёгким сдвигом по очереди
 *  - [data-parallax]   медленный параллакс по вертикали (scrub), сила в значении атрибута (%)
 *  - [data-drift]      горизонтальный дрейф на скролле (scrub), сила в значении атрибута (%)
 *  - [data-zoom]       лёгкое приближение 1.1 → 1 на скролле (scrub), для видео/фото во всю ширину
 * Уважает prefers-reduced-motion: тогда ничего не делаем, контент и так виден.
 */
export default function useSectionMotion(scope, deps = []) {
    useGSAP(
        () => {
            if (reducedMotion()) return;
            const root = scope.current;
            if (!root) return;

            root.querySelectorAll('[data-split]').forEach((el) => {
                const words = splitWords(el);
                if (!words.length) return;
                // fromTo + immediateRender: false — стартовое состояние выставляется ТОЛЬКО
                // когда триггер сработал. У gsap.from() контент прячется сразу и остаётся
                // невидимым навсегда, если ScrollTrigger почему-то не выстрелил.
                gsap.fromTo(
                    words,
                    { yPercent: 110, opacity: 0 },
                    {
                        yPercent: 0,
                        opacity: 1,
                        duration: 0.9,
                        ease: 'expo.out',
                        stagger: 0.05,
                        immediateRender: false,
                        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
                    },
                );
            });

            root.querySelectorAll('[data-stagger]').forEach((el) => {
                const items = el.querySelectorAll('[data-stagger-item]').length
                    ? el.querySelectorAll('[data-stagger-item]')
                    : el.children;
                gsap.fromTo(
                    items,
                    { y: 28, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.8,
                        ease: 'power3.out',
                        stagger: 0.07,
                        immediateRender: false,
                        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
                    },
                );
            });

            /* Выезд списка сбоку: каждый пункт въезжает по очереди из-за края с проявлением.
               Отдельный приём от data-stagger (тот поднимает снизу) — так соседние секции
               двигаются по-разному и не выглядят одной и той же анимацией. */
            root.querySelectorAll('[data-slide]').forEach((el) => {
                const dir = el.dataset.slide === 'right' ? 1 : -1;
                const items = el.querySelectorAll('[data-slide-item]').length
                    ? el.querySelectorAll('[data-slide-item]')
                    : el.children;
                if (!items.length) return;
                // ScrollTrigger вешаем на таймлайн, а не на вложенные твины
                const tl = gsap.timeline({
                    defaults: { duration: 0.75, ease: 'power3.out' },
                    scrollTrigger: { trigger: el, start: 'top 85%', once: true },
                });
                tl.fromTo(
                    items,
                    { x: () => dir * (28 + Math.random() * 26), opacity: 0, filter: 'blur(6px)' },
                    { x: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.055, immediateRender: false, clearProps: 'filter' },
                );
            });

            root.querySelectorAll('[data-parallax]').forEach((el) => {
                const amount = parseFloat(el.dataset.parallax) || 8;
                gsap.fromTo(
                    el,
                    { yPercent: -amount },
                    {
                        yPercent: amount,
                        ease: 'none',
                        scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
                    },
                );
            });

            root.querySelectorAll('[data-drift]').forEach((el) => {
                const amount = parseFloat(el.dataset.drift) || 4;
                gsap.fromTo(
                    el,
                    { xPercent: amount },
                    { xPercent: -amount, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.8 } },
                );
            });

            root.querySelectorAll('[data-zoom]').forEach((el) => {
                gsap.fromTo(
                    el,
                    { scale: 1.12 },
                    { scale: 1, ease: 'none', scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'center center', scrub: 0.6 } },
                );
            });

            // после ленивых картинок/шрифтов позиции меняются: пересчёт
            ScrollTrigger.refresh();
        },
        { scope, dependencies: deps, revertOnUpdate: true },
    );
}
