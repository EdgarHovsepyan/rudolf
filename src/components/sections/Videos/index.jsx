import { useRef, useState } from 'react';
import { FiPlay } from 'react-icons/fi';
import LiteYouTube from '../../LiteYouTube';
import { videos } from '../../../content/site';
import './style.scss';

/* Концертная запись с оркестром: постер, по клику подключаем видео (25 МБ грузится только по запросу) */
const FeaturedVideo = ({ src, poster, title, meta }) => {
    const [active, setActive] = useState(false);
    const ref = useRef(null);

    const start = () => {
        setActive(true);
        requestAnimationFrame(() => ref.current?.play().catch(() => {}));
    };

    return (
        <figure className="yt videos__featured">
            <div className="yt__frame">
                {active ? (
                    <video ref={ref} src={src} poster={poster} controls playsInline preload="auto" aria-label={title} />
                ) : (
                    <button type="button" className="yt__poster" onClick={start} aria-label={`Смотреть: ${title}`}>
                        <img src={poster} alt="" width="848" height="480" />
                        <span className="yt__play" aria-hidden="true">
                            <FiPlay />
                        </span>
                    </button>
                )}
            </div>
            <figcaption>
                <strong>{title}</strong>
                {meta && <span>{meta}</span>}
            </figcaption>
        </figure>
    );
};

const Videos = () => (
    <section id="video" className="section videos" aria-labelledby="videos-title">
        <div className="container">
            <div className="section-head">
                <h2 id="videos-title" data-split>
                    {videos.title}
                </h2>
                <p className="reveal">{videos.lead}</p>
            </div>
            <div className="videos__grid">
                <div className="videos__main reveal">
                    <FeaturedVideo {...videos.featured} />
                </div>
                <div className="videos__list" data-stagger>
                    {videos.items.map((v) => (
                        <LiteYouTube key={v.id} id={v.id} title={v.title} meta={v.meta} />
                    ))}
                </div>
            </div>
        </div>
    </section>
);

export default Videos;
