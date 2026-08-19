import { FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa6';
import { intro } from '../../../content/site';
import led from '../../../assets/photos/led-stage-white-jacket-1280.webp';
import ledS from '../../../assets/photos/led-stage-white-jacket-640.webp';
import './style.scss';

/**
 * Первая текстовая секция после чистого 3D-героя: заголовок-оффер, факты, кнопки связи
 * и фотография с праздничной сцены. Концерт с оркестром живёт ниже полосой во всю ширину.
 */
const Intro = () => (
    <section id="intro" className="section intro" aria-labelledby="intro-title">
        <div className="container intro__grid">
            <div className="intro__copy">
                <p className="intro__season reveal">
                    <span aria-hidden="true" />
                    {intro.season}
                </p>
                <h1 id="intro-title" data-split>
                    {intro.title}
                </h1>
                <p className="intro__lead reveal">{intro.lead}</p>
                <div className="intro__actions reveal">
                    <a className="btn btn--primary btn--lg" href={intro.primary.href} target="_blank" rel="noopener">
                        <FaWhatsapp aria-hidden="true" />
                        {intro.primary.label}
                    </a>
                    <a className="btn btn--ghost btn--lg" href={intro.secondary.href}>
                        <FiPhone aria-hidden="true" />
                        {intro.secondary.label}
                    </a>
                </div>
                <ul className="intro__proof" role="list" data-stagger>
                    {intro.proof.map((p) => (
                        <li key={p}>{p}</li>
                    ))}
                </ul>
            </div>

            <figure className="intro__media reveal">
                <img
                    src={led}
                    srcSet={`${ledS} 640w, ${led} 1280w`}
                    sizes="(min-width: 900px) 42vw, 100vw"
                    width="1023"
                    height="720"
                    alt="Рудольф Овсепян в белом пиджаке поёт на праздничной сцене с LED-экраном"
                    loading="lazy"
                    decoding="async"
                    data-parallax="6"
                />
                <figcaption>{intro.photoCaption}</figcaption>
            </figure>
        </div>
    </section>
);

export default Intro;
