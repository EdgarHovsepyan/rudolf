import { gsap, ScrollTrigger, useGSAP, reducedMotion, splitWords } from '../lib/gsap';

/**
 * Общая хореография секций. Опт-ин через data-атрибуты внутри scope:
 *  - [data-split]      заголовок появляется по словам снизу из маски
 *  - [data-stagger]    дети (или [data-stagger-item]) приезжают с лёгким сдвигом по очереди
 *  - [data-slide]      список выезжает сбоку с проявлением (значение 'right' меняет сторону)
 *  - [data-parallax]   медленный параллакс по вертикали (scrub), сила в значении атрибута (%)
 *  - [data-drift]      горизонтальный дрейф на скролле (scrub), сила в значении атрибута (%)
 *  - [data-zoom]       лёгкое приближение 1.1 → 1 на скролле (scrub), для видео/фото во всю ширину
 *
 * Два правила, выстраданные на живой странице:
 *  1) Анимируем ТОЛЬКО то, что при загрузке ещё под сгибом. Если элемент уже на экране,
 *     он просто остаётся видимым: иначе получается «мигание» — контент показался,
 *     потом резко спрятался и поехал появляться заново.
 *  2) Прятать заранее (immediateRender) можно лишь вместе со страховкой: если триггер
 *     почему-то не сработает, контент обязан проявиться сам. Иначе он исчезает навсегда.
 * Уважает prefers-reduced-motion: тогда ничего не делаем, контент и так виден.
 */
const START = 'top 88%';
const FAILSAFE_MS = 6000;

export default function useSectionMotion(scope, deps = []) {
    useGSAP(
        () => {
            if (reducedMotion()) return undefined;
            const root = scope.current;
            if (!root) return undefined;

            const vh = window.innerHeight;
            // Уже на экране при загрузке — не анимируем совсем
            const belowFold = (el) => el.getBoundingClientRect().top > vh * 0.9;
            const pending = [];

            const track = (tween) => {
                pending.push(tween);
                return tween;
            };

            root.querySelectorAll('[data-split]').forEach((el) => {
                if (!belowFold(el)) return;
                const words = splitWords(el);
                if (!words.length) return;
                track(
                    gsap.from(words, {
                        yPercent: 110,
                        opacity: 0,
                        duration: 0.9,
                        ease: 'expo.out',
                        stagger: 0.05,
                        scrollTrigger: { trigger: el, start: START, once: true },
                    }),
                );
            });

            root.querySelectorAll('[data-stagger]').forEach((el) => {
                if (!belowFold(el)) return;
                const items = el.querySelectorAll('[data-stagger-item]').length
                    ? el.querySelectorAll('[data-stagger-item]')
                    : el.children;
                if (!items.length) return;
                track(
                    gsap.from(items, {
                        y: 28,
                        opacity: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                        stagger: 0.07,
                        scrollTrigger: { trigger: el, start: START, once: true },
                    }),
                );
            });

            /* Выезд списка сбоку: отдельный приём от data-stagger (тот поднимает снизу),
               чтобы соседние секции не выглядели одной и той же анимацией. */
            root.querySelectorAll('[data-slide]').forEach((el) => {
                if (!belowFold(el)) return;
                const items = el.querySelectorAll('[data-slide-item]').length
                    ? el.querySelectorAll('[data-slide-item]')
                    : el.children;
                if (!items.length) return;
                const dir = el.dataset.slide === 'right' ? 1 : -1;
                track(
                    gsap.from(items, {
                        x: (i) => dir * (26 + (i % 3) * 14),
                        opacity: 0,
                        filter: 'blur(5px)',
                        duration: 0.75,
                        ease: 'power3.out',
                        stagger: 0.055,
                        clearProps: 'filter',
                        scrollTrigger: { trigger: el, start: START, once: true },
                    }),
                );
            });

            /* Скролл-привязанные эффекты (scrub) ничего не прячут, поэтому им страховка не нужна */
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

            // после ленивых картинок и шрифтов позиции меняются: пересчёт
            ScrollTrigger.refresh();

            // Страховка: всё, что через 6 с так и не проигралось, доводим до конца принудительно
            const failsafe = window.setTimeout(() => {
                pending.forEach((t) => {
                    if (t && t.progress() === 0) t.progress(1).kill();
                });
            }, FAILSAFE_MS);

            return () => window.clearTimeout(failsafe);
        },
        { scope, dependencies: deps, revertOnUpdate: true },
    );
}
