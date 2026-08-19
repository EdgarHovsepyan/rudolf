import { useState } from 'react';
import { FiPlay } from 'react-icons/fi';
import './style.scss';

/**
 * Лёгкий фасад для YouTube: пока не нажали, грузится только превью (~20 КБ),
 * iframe с плеером подключается по клику. Экономит мегабайты на мобильном.
 */
const LiteYouTube = ({ id, title, meta }) => {
    const [active, setActive] = useState(false);
    const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    const src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&hl=ru`;

    return (
        <figure className="yt">
            <div className="yt__frame">
                {active ? (
                    <iframe
                        src={src}
                        title={title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                    />
                ) : (
                    <button type="button" className="yt__poster" onClick={() => setActive(true)} aria-label={`Смотреть: ${title}`}>
                        <img src={thumb} alt="" loading="lazy" width="480" height="360" />
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

export default LiteYouTube;
