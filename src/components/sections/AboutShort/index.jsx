import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { aboutShort } from '../../../content/site';
import portrait1600 from '../../../assets/photos/orchestra-mic-portrait-1280.webp';
import portrait800 from '../../../assets/photos/orchestra-mic-portrait-640.webp';
import './style.scss';

const AboutShort = () => (
    <section id="about" className="section about-short" aria-labelledby="about-title">
        <div className="container about-short__grid">
            <figure className="about-short__photo reveal">
                <img
                    src={portrait1600}
                    srcSet={`${portrait800} 640w, ${portrait1600} 1280w`}
                    sizes="(min-width: 900px) 44vw, 100vw"
                    width="853"
                    height="1280"
                    alt="Рудольф Овсепян поёт с микрофоном на фоне симфонического оркестра"
                    loading="lazy"
                    decoding="async"
                    data-parallax="7"
                />
            </figure>

            <div className="about-short__text reveal">
                <h2 id="about-title" data-split>
                    {aboutShort.title}
                </h2>
                {aboutShort.paragraphs.map((p) => (
                    <p key={p} className="lead">
                        {p}
                    </p>
                ))}
                <dl className="about-short__facts">
                    {aboutShort.facts.map((f) => (
                        <div key={f.k}>
                            <dt>{f.k}</dt>
                            <dd>{f.v}</dd>
                        </div>
                    ))}
                </dl>
                <Link className="arrow-link" to="/about">
                    {aboutShort.linkLabel}
                    <FiArrowRight aria-hidden="true" />
                </Link>
            </div>
        </div>
    </section>
);

export default AboutShort;
