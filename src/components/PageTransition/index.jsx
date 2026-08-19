import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import './style.scss';

/**
 * Занавес между страницами. Срабатывает только при смене пути (не якоря),
 * уважает prefers-reduced-motion и никогда не перекрывает контент дольше 1.2 с.
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
        const el = ref.current;
        if (!el) return undefined;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

        const tl = gsap.timeline({ defaults: { ease: 'power4.inOut' } });
        tl.set(el, { yPercent: -100, autoAlpha: 1 })
            .to(el, { yPercent: 0, duration: 0.45 })
            .to(el, { yPercent: 100, duration: 0.55, delay: 0.15 })
            .set(el, { autoAlpha: 0, yPercent: -100 });
        return () => tl.kill();
    }, [pathname]);

    return (
        <div ref={ref} className="page-curtain" aria-hidden="true">
            <span>Рудольф</span>
        </div>
    );
};

export default PageTransition;
