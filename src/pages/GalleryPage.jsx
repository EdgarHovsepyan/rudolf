import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa6';
import { contacts, gallery, site } from '../content/site';
import useReveal from '../hooks/useReveal';
import './gallery.scss';

gsap.registerPlugin(ScrollTrigger);

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

const GalleryPage = () => {
    const rootRef = useRef(null);
    useReveal();

    useEffect(() => {
        document.title = `Галерея: ${site.name}, баритон`;
        return () => {
            document.title = site.title;
        };
    }, []);

    // Лёгкий параллакс: соседние колонки едут с разной скоростью
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
        if (window.matchMedia('(max-width: 899px)').matches) return undefined;
        const ctx = gsap.context(() => {
            gsap.utils.toArray('.mosaic__col').forEach((col, i) => {
                gsap.to(col, {
                    yPercent: i % 2 === 0 ? -4 : 4,
                    ease: 'none',
                    scrollTrigger: { trigger: '.mosaic', start: 'top bottom', end: 'bottom top', scrub: 0.6 },
                });
            });
        }, rootRef);
        return () => ctx.revert();
    }, []);

    // Три колонки, раскладываем по очереди: разные пропорции создают живой ритм
    const cols = [[], [], []];
    gallery.forEach((g, i) => cols[i % 3].push(g));

    return (
        <article className="gallery-page" ref={rootRef}>
            <header className="gallery-page__head">
                <div className="container">
                    <h1>Галерея</h1>
                    <p className="lead">Концерты с симфоническим оркестром, праздничные сцены, портреты. Все фотографии настоящие, со сцены.</p>
                </div>
            </header>

            <div className="container mosaic">
                {cols.map((col, ci) => (
                    <div className="mosaic__col" key={ci}>
                        {col.map((g, i) => (
                            <figure className="mosaic__item reveal" key={g.id} style={{ aspectRatio: g.ratio }}>
                                <img
                                    src={srcFor(g.id, 'l')}
                                    srcSet={`${srcFor(g.id, 's')} 640w, ${srcFor(g.id, 'l')} 1280w`}
                                    sizes="(min-width: 900px) 33vw, (min-width: 600px) 50vw, 100vw"
                                    alt={g.alt}
                                    loading={ci === 0 && i === 0 ? 'eager' : 'lazy'}
                                    decoding="async"
                                />
                                <figcaption>{g.caption}</figcaption>
                            </figure>
                        ))}
                    </div>
                ))}
            </div>

            <section className="section gallery-page__end">
                <div className="container gallery-page__end-inner">
                    <h2>Хотите так же на своём празднике?</h2>
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
