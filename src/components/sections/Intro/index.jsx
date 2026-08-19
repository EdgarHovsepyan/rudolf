import { useEffect, useRef, useState } from 'react';
import { FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa6';
import { intro, videos } from '../../../content/site';
import './style.scss';

/**
 * Первая текстовая секция после чистого 3D-героя: заголовок-оффер, факты, кнопки связи
 * и немой фрагмент концерта с оркестром. Видео стартует только в зоне видимости
 * и не грузится при prefers-reduced-motion или включённом режиме экономии трафика.
 */
const useInViewVideo = () => {
    const ref = useRef(null);
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const saveData = navigator.connection?.saveData;
        if (reduced || saveData) return undefined;
        const el = ref.current;
        if (!el) return undefined;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setAllowed(true);
                    if (el.readyState > 0) el.play().catch(() => {});
                } else {
                    el.pause();
                }
            },
            { threshold: 0.25 },
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    // Источник появляется только после первого попадания в зону видимости
    useEffect(() => {
        const el = ref.current;
        if (!allowed || !el) return;
        el.load();
        el.play().catch(() => {});
    }, [allowed]);

    return { ref, allowed };
};

const Intro = () => {
    const { ref, allowed } = useInViewVideo();

    return (
        <section id="intro" className="section intro" aria-labelledby="intro-title">
            <div className="container intro__grid">
                <div className="intro__copy reveal">
                    <p className="intro__season">
                        <span aria-hidden="true" />
                        {intro.season}
                    </p>
                    <h1 id="intro-title">{intro.title}</h1>
                    <p className="intro__lead">{intro.lead}</p>
                    <div className="intro__actions">
                        <a className="btn btn--primary btn--lg" href={intro.primary.href} target="_blank" rel="noopener">
                            <FaWhatsapp aria-hidden="true" />
                            {intro.primary.label}
                        </a>
                        <a className="btn btn--ghost btn--lg" href={intro.secondary.href}>
                            <FiPhone aria-hidden="true" />
                            {intro.secondary.label}
                        </a>
                    </div>
                    <ul className="intro__proof" role="list">
                        {intro.proof.map((p) => (
                            <li key={p}>{p}</li>
                        ))}
                    </ul>
                </div>

                <figure className="intro__media reveal">
                    <video
                        ref={ref}
                        className="intro__video"
                        poster={videos.featured.poster}
                        muted
                        loop
                        playsInline
                        preload={allowed ? 'auto' : 'none'}
                        aria-label="Фрагмент концерта: Рудольф Овсепян поёт с симфоническим оркестром, без звука"
                    >
                        {allowed && <source src={videos.featured.loop} type="video/mp4" />}
                    </video>
                    <figcaption>
                        {intro.videoCaption}
                        <a href="#video" className="intro__media-link">
                            Смотреть со звуком
                        </a>
                    </figcaption>
                </figure>
            </div>
        </section>
    );
};

export default Intro;
