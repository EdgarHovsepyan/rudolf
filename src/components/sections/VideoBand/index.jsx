import { useEffect, useRef, useState } from 'react';
import { FiVolume2 } from 'react-icons/fi';
import { videos } from '../../../content/site';
import './style.scss';

/**
 * Кинематографическая полоса во всю ширину: немой фрагмент концерта с оркестром
 * (object-fit: cover), автозапуск только в зоне видимости, лёгкое приближение на скролле
 * (data-zoom обрабатывает useSectionMotion). При reduced-motion или save-data показываем постер.
 */
const VideoBand = () => {
    const videoRef = useRef(null);
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        const el = videoRef.current;
        if (!el) return undefined;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduced || navigator.connection?.saveData) return undefined;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setAllowed(true);
                    if (el.readyState > 0) el.play().catch(() => {});
                } else {
                    el.pause();
                }
            },
            { threshold: 0.2 },
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    useEffect(() => {
        const el = videoRef.current;
        if (!allowed || !el) return;
        el.load();
        el.play().catch(() => {});
    }, [allowed]);

    return (
        <section className="video-band" aria-label="Фрагмент концерта с симфоническим оркестром">
            <div className="video-band__media">
                <video
                    ref={videoRef}
                    className="video-band__video"
                    data-zoom
                    poster={videos.featured.poster}
                    muted
                    loop
                    playsInline
                    preload={allowed ? 'auto' : 'none'}
                    aria-hidden="true"
                    tabIndex={-1}
                >
                    {allowed && <source src={videos.featured.loop} type="video/mp4" />}
                </video>
            </div>
            <div className="video-band__overlay">
                <div className="container video-band__copy">
                    <p className="video-band__kicker">Концертная запись</p>
                    <h2 className="video-band__title" data-split>
                        С симфоническим оркестром
                    </h2>
                    <a className="btn btn--primary btn--lg" href="#video">
                        <FiVolume2 aria-hidden="true" />
                        Смотреть со звуком
                    </a>
                </div>
            </div>
        </section>
    );
};

export default VideoBand;
