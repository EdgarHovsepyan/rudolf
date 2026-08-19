import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

/* Регистрируем один раз; компоненты импортируют отсюда, а не из gsap напрямую */
gsap.registerPlugin(ScrollTrigger, useGSAP);

gsap.defaults({ ease: 'power3.out', duration: 0.9 });

export const reducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Разбивает текст заголовка на слова-маски для пословного появления.
 * Работает только с чистым текстом (без вложенной разметки), иначе оставляет как есть.
 * Возвращает массив внутренних <span>, которые нужно анимировать.
 */
export const splitWords = (el) => {
    if (!el || el.dataset.split === 'done') return [];
    if (el.children.length > 0) return [];
    const words = el.textContent.split(/\s+/).filter(Boolean);
    el.setAttribute('aria-label', el.textContent.trim());
    el.textContent = '';
    const inner = [];
    words.forEach((w, i) => {
        const mask = document.createElement('span');
        mask.className = 'w-mask';
        mask.setAttribute('aria-hidden', 'true');
        const word = document.createElement('span');
        word.className = 'w';
        word.textContent = w;
        mask.appendChild(word);
        el.appendChild(mask);
        if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
        inner.push(word);
    });
    el.dataset.split = 'done';
    return inner;
};

export { gsap, ScrollTrigger, useGSAP };
