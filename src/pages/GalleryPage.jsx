import { useCallback, useEffect, useRef, useState } from 'react';
import { FiPhone, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa6';
import { contacts, gallery, site } from '../content/site';
import { gsap, useGSAP, reducedMotion } from '../lib/gsap';
import useSectionMotion from '../hooks/useSectionMotion';
import './gallery.scss';

/* Все варианты картинок собираются на этапе сборки: новые фото + три старые настоящие */
const photos = import.meta.glob('../assets/photos/*.webp', { eager: true, import: 'default' });
const legacy = import.meta.glob('../assets/gallery/webp/*.webp', { eager: true, import: 'default' });

const srcFor = (id, size) => {
    if (id.startsWith('legacy-')) {
        const n = id.slice(7);
        return legacy[`../assets/gallery/webp/${n}-${size === 'l' ? 1600 : 800}.webp`];
    }
    return photos[`../assets/photos/${id}-${size === 'l' ? 1280 : 640}.webp`];
};

/* Лайтбокс на нативном <dialog>: Esc, стрелки, фокус возвращается на миниатюру */
const Lightbox = ({ index, onClose, onStep }) => {
    const ref = useRef(null);
    const item = index >= 0 ? gallery[index] : null;

    useEffect(() => {
        const d = ref.current;
        if (!d) return undefined;
        if (item && !d.open) d.showModal();
        if (!item && d.open) d.close();
        return undefined;
    }, [item]);

    useEffect(() => {
        if (!item) return undefined;
        const onKey = (e) => {
            if (e.key === 'ArrowRight') onStep(1);
            if (e.key === 'ArrowLeft') onStep(-1);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [item, onStep]);

    return (
        <dialog
            ref={ref}
            className="lightbox"
            onClose={onClose}
            onClick={(e) => {
                if (e.target === ref.current) onClose();
            }}
            aria-label={item ? `${item.caption}, фото ${index + 1} из ${gallery.length}` : 'Просмотр фотографии'}
        >
            {item && (
                <figure className="lightbox__figure">
                    <img key={item.id} src={srcFor(item.id, 'l')} alt={item.alt} />
                    <figcaption>
                        <span>{item.caption}</span>
                        <span className="lightbox__counter">
                            {index + 1} / {gallery.length}
                        </span>
                    </figcaption>
                </figure>
            )}
            <button type="button" className="lightbox__btn lightbox__btn--prev" onClick={() => onStep(-1)} aria-label="Предыдущее фото">
                <FiChevronLeft aria-hidden="true" />
            </button>
            <button type="button" className="lightbox__btn lightbox__btn--next" onClick={() => onStep(1)} aria-label="Следующее фото">
                <FiChevronRight aria-hidden="true" />
            </button>
            <button type="button" className="lightbox__btn lightbox__btn--close" onClick={onClose} aria-label="Закрыть">
                <FiX aria-hidden="true" />
            </button>
        </dialog>
    );
};

const GalleryPage = () => {
    const rootRef = useRef(null);
    const [active, setActive] = useState(-1);
    useSectionMotion(rootRef);

    useEffect(() => {
        document.title = `Галерея: ${site.name}, баритон`;
        return () => {
            document.title = site.title;
        };
    }, []);

    // Плитки: шторка снизу вверх + лёгкое приближение; колонки едут с разной скоростью
    useGSAP(
        () => {
            if (reducedMotion()) return;
            gsap.utils.toArray('.mosaic__item').forEach((item) => {
                const img = item.querySelector('img');
                gsap.fromTo(
                    item,
                    { clipPath: 'inset(12% 0 100% 0 round 12px)' },
                    { clipPath: 'inset(0% 0 0% 0 round 12px)', duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: item, start: 'top 88%', once: true } },
                );
                gsap.fromTo(img, { scale: 1.18 }, { scale: 1, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: item, start: 'top 88%', once: true } });
            });
            if (window.matchMedia('(min-width: 900px)').matches) {
                gsap.utils.toArray('.mosaic__col').forEach((col, i) => {
                    gsap.to(col, {
                        yPercent: i % 2 === 0 ? -4 : 4,
                        ease: 'none',
                        scrollTrigger: { trigger: '.mosaic', start: 'top bottom', end: 'bottom top', scrub: 0.6 },
                    });
                });
            }
        },
        { scope: rootRef },
    );

    const step = useCallback((d) => setActive((i) => (i < 0 ? i : (i + d + gallery.length) % gallery.length)), []);
    const close = useCallback(() => setActive(-1), []);

    const cols = [[], [], []];
    gallery.forEach((g, i) => cols[i % 3].push({ ...g, index: i }));

    return (
        <article className="gallery-page" ref={rootRef}>
            <header className="gallery-page__head">
                <div className="container">
                    <h1 data-split>Галерея</h1>
                    <p className="lead">Концерты с симфоническим оркестром, праздничные сцены, портреты. Все фотографии настоящие, со сцены. Нажмите, чтобы открыть крупнее.</p>
                </div>
            </header>

            <div className="container mosaic">
                {cols.map((col, ci) => (
                    <div className="mosaic__col" key={ci}>
                        {col.map((g) => (
                            <figure className="mosaic__item" key={g.id} style={{ aspectRatio: g.ratio }}>
                                <button type="button" className="mosaic__btn" onClick={() => setActive(g.index)} aria-label={`Открыть: ${g.caption}`}>
                                    <img
                                        src={srcFor(g.id, 'l')}
                                        srcSet={`${srcFor(g.id, 's')} 640w, ${srcFor(g.id, 'l')} 1280w`}
                                        sizes="(min-width: 900px) 33vw, (min-width: 600px) 50vw, 100vw"
                                        alt={g.alt}
                                        loading={g.index < 3 ? 'eager' : 'lazy'}
                                        decoding="async"
                                    />
                                </button>
                                <figcaption>{g.caption}</figcaption>
                            </figure>
                        ))}
                    </div>
                ))}
            </div>

            <Lightbox index={active} onClose={close} onStep={step} />

            <section className="section gallery-page__end">
                <div className="container gallery-page__end-inner">
                    <h2 data-split>Хотите так же на своём празднике?</h2>
                    <div className="gallery-page__cta">
                        <a className="btn btn--primary btn--lg" href={contacts.whatsapp} target="_blank" rel="noopener">
                            <FaWhatsapp aria-hidden="true" />
                            Написать в WhatsApp
                        </a>
                        <a className="btn btn--ghost btn--lg" href={contacts.phoneHref}>
                            <FiPhone aria-hidden="true" />
                            {contacts.phoneDisplay}
                        </a>
                    </div>
                </div>
            </section>
        </article>
    );
};

export default GalleryPage;
