import { lazy, Suspense, useRef, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import Loader from '../Loader';
import SceneBoundary from '../Scene/SceneBoundary';
import { hero } from '../../content/site';
import { gsap, useGSAP, reducedMotion } from '../../lib/gsap';
import './style.scss';

const Scene = lazy(() => import('../Scene'));

/**
 * Герой: чистая 3D-сцена (имя в хроме, портрет, звёзды, дождь света).
 * Весь текст и кнопки живут в следующей секции (#intro), чтобы сцена дышала.
 * Связь всегда под рукой: телефон в шапке на десктопе, панель внизу на мобильном.
 */
const Hero = () => {
    const [ready, setReady] = useState(false);
    const ref = useRef(null);

    // Уход героя: при прокрутке сцена чуть приближается и гаснет, следующая секция «наезжает» на неё
    useGSAP(
        () => {
            if (reducedMotion()) return;
            gsap.to('.hero__stage', {
                scale: 1.08,
                yPercent: 12,
                opacity: 0.25,
                ease: 'none',
                scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: 0.5 },
            });
        },
        { scope: ref },
    );

    return (
        <section ref={ref} className={`hero${ready ? ' is-ready' : ''}`} aria-label={hero.ariaLabel}>
            <Loader onDone={() => setReady(true)} />
            <div className="hero__stage">
                <SceneBoundary>
                    <Suspense fallback={null}>
                        <Scene />
                    </Suspense>
                </SceneBoundary>
            </div>
            <a className="hero__scroll" href="#intro" aria-label={hero.scrollLabel}>
                <span className="hero__scroll-text" aria-hidden="true">
                    {hero.scrollLabel}
                </span>
                <FiChevronDown aria-hidden="true" />
            </a>
        </section>
    );
};

export default Hero;
