import { lazy, Suspense, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import Loader from '../Loader';
import SceneBoundary from '../Scene/SceneBoundary';
import { hero } from '../../content/site';
import './style.scss';

const Scene = lazy(() => import('../Scene'));

/**
 * Герой: чистая 3D-сцена (имя в хроме, портрет, звёзды, дождь света).
 * Весь текст и кнопки живут в следующей секции (#intro), чтобы сцена дышала.
 * Связь всегда под рукой: телефон в шапке на десктопе, панель внизу на мобильном.
 */
const Hero = () => {
    const [ready, setReady] = useState(false);

    return (
        <section className={`hero${ready ? ' is-ready' : ''}`} aria-label={hero.ariaLabel}>
            <Loader onDone={() => setReady(true)} />
            <SceneBoundary>
                <Suspense fallback={null}>
                    <Scene />
                </Suspense>
            </SceneBoundary>
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
