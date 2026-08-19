import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap, reducedMotion } from '../../lib/gsap';
import './style.scss';

/**
 * Театральный занавес между страницами: две половины сходятся к центру, на миг
 * загорается имя, затем расходятся, а новая страница мягко всплывает.
 * Только при смене пути (не якоря), уважает prefers-reduced-motion.
 */
const PageTransition = () => {
    const { pathname } = useLocation();
    const ref = useRef(null);
    const first = useRef(true);

    useEffect(() => {
        if (first.current) {
            first.current = false;
            return undefined;
        }
        const root = ref.current;
        if (!root || reducedMotion()) return undefined;
        const left = root.querySelector('.curtain__half--left');
        const right = root.querySelector('.curtain__half--right');
        const name = root.querySelector('.curtain__name');
        const main = document.getElementById('main');

        const tl = gsap.timeline({ defaults: { ease: 'power4.inOut' } });
        tl.set(root, { autoAlpha: 1 })
            .set([left, right], { xPercent: (i) => (i === 0 ? -100 : 100) })
            .set(name, { opacity: 0, y: 14, scale: 0.96 })
            .to([left, right], { xPercent: 0, duration: 0.5 })
            .to(name, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power2.out' }, '-=0.15')
            .to(name, { opacity: 0, y: -10, duration: 0.25, ease: 'power2.in' }, '+=0.12')
            .to([left, right], { xPercent: (i) => (i === 0 ? -100 : 100), duration: 0.6, stagger: 0.03 }, '-=0.05')
            .from(main, { opacity: 0, y: 18, duration: 0.6, ease: 'power3.out', clearProps: 'all' }, '-=0.45')
            .set(root, { autoAlpha: 0 });
        return () => tl.kill();
    }, [pathname]);

    return (
        <div ref={ref} className="curtain" aria-hidden="true">
            <div className="curtain__half curtain__half--left" />
            <div className="curtain__half curtain__half--right" />
            <span className="curtain__name">Рудольф Овсепян</span>
        </div>
    );
};

export default PageTransition;
