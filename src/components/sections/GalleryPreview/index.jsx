import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import led from '../../../assets/photos/led-stage-white-jacket-1280.webp';
import ledS from '../../../assets/photos/led-stage-white-jacket-640.webp';
import choir from '../../../assets/photos/orchestra-choir-mic-1280.webp';
import choirS from '../../../assets/photos/orchestra-choir-mic-640.webp';
import portrait from '../../../assets/photos/portrait-mic-warm-1280.webp';
import portraitS from '../../../assets/photos/portrait-mic-warm-640.webp';
import './style.scss';

const shots = [
    {
        src: choir,
        srcSet: `${choirS} 640w, ${choir} 1280w`,
        w: 1280,
        h: 854,
        alt: 'Рудольф Овсепян поёт с микрофоном перед хором и оркестром в красном свете',
        cls: 'gallery-preview__item--wide',
    },
    {
        src: portrait,
        srcSet: `${portraitS} 640w, ${portrait} 1280w`,
        w: 939,
        h: 1280,
        alt: 'Рудольф Овсепян с микрофоном, улыбается, тёплый свет',
        cls: 'gallery-preview__item--tall',
    },
    {
        src: led,
        srcSet: `${ledS} 640w, ${led} 1280w`,
        w: 1023,
        h: 720,
        alt: 'Рудольф Овсепян в белом пиджаке поёт на сцене с LED-экраном',
        cls: 'gallery-preview__item--wide',
    },
];

const GalleryPreview = () => (
    <section className="section gallery-preview" aria-labelledby="gallery-preview-title">
        <div className="container">
            <div className="gallery-preview__head reveal">
                <h2 id="gallery-preview-title">Со сцены</h2>
                <Link className="arrow-link" to="/gallery">
                    Смотреть все фотографии
                    <FiArrowRight aria-hidden="true" />
                </Link>
            </div>
            <div className="gallery-preview__grid reveal">
                {shots.map((s) => (
                    <Link key={s.src} to="/gallery" className={`gallery-preview__item ${s.cls}`} aria-label="Открыть галерею">
                        <img
                            src={s.src}
                            srcSet={s.srcSet}
                            sizes="(min-width: 900px) 45vw, 100vw"
                            width={s.w}
                            height={s.h}
                            alt={s.alt}
                            loading="lazy"
                            decoding="async"
                        />
                    </Link>
                ))}
            </div>
        </div>
    </section>
);

export default GalleryPreview;
