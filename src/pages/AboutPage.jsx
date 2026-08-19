import { useEffect } from 'react';
import { FiPhone, FiPrinter, FiMail } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa6';
import { bio, contacts, site } from '../content/site';
import useReveal from '../hooks/useReveal';
import portrait1600 from '../assets/gallery/webp/1-1600.webp';
import portrait800 from '../assets/gallery/webp/1-800.webp';
import stage1600 from '../assets/gallery/webp/5-1600.webp';
import stage800 from '../assets/gallery/webp/5-800.webp';
import './about.scss';

/* Работа и образование одной хронологией: «сегодня» сверху, дальше по годам вниз */
const yearKey = (y) => (/\d{4}/.test(y) ? Number(y.match(/\d{4}/)[0]) : 9999);
const timeline = [...bio.work, ...bio.education].sort((a, b) => yearKey(b.year) - yearKey(a.year));

const AboutPage = () => {
    useReveal();
    useEffect(() => {
        document.title = `Обо мне: ${bio.title}, баритон`;
        return () => {
            document.title = site.title;
        };
    }, []);

    return (
        <article className="about-page">
            <header className="about-page__hero">
                <div className="container about-page__hero-grid">
                    <div className="about-page__hero-text">
                        <h1>{bio.title}</h1>
                        <p className="lead">{bio.subtitle}</p>

                        {/* Резюме одним взглядом: факты без рекламы */}
                        <dl className="cv-facts" aria-label="Кратко">
                            {bio.facts.map((f) => (
                                <div key={f.k}>
                                    <dt>{f.k}</dt>
                                    <dd>{f.v}</dd>
                                </div>
                            ))}
                            <div>
                                <dt>Контакты</dt>
                                <dd className="cv-facts__contacts">
                                    <a href={contacts.phoneHref}>
                                        <FiPhone aria-hidden="true" />
                                        {contacts.phoneDisplay}
                                    </a>
                                    <a href={`mailto:${contacts.email}`}>
                                        <FiMail aria-hidden="true" />
                                        {contacts.email}
                                    </a>
                                </dd>
                            </div>
                        </dl>

                        <div className="about-page__cta">
                            <a className="btn btn--primary" href={contacts.whatsapp} target="_blank" rel="noopener">
                                <FaWhatsapp aria-hidden="true" />
                                Написать в WhatsApp
                            </a>
                            <button type="button" className="btn btn--ghost" onClick={() => window.print()}>
                                <FiPrinter aria-hidden="true" />
                                Сохранить резюме в PDF
                            </button>
                        </div>
                    </div>
                    <figure className="about-page__portrait">
                        <img
                            src={portrait1600}
                            srcSet={`${portrait800} 800w, ${portrait1600} 1600w`}
                            sizes="(min-width: 900px) 38vw, 100vw"
                            width="1600"
                            height="1631"
                            alt="Рудольф Овсепян во фраке на сцене"
                            // React 18 знает только lowercase-вариант атрибута
                            // eslint-disable-next-line react/no-unknown-property
                            fetchpriority="high"
                            decoding="async"
                        />
                    </figure>
                </div>
            </header>

            <section className="section about-page__story" aria-labelledby="story-title">
                <div className="container about-page__two">
                    <h2 id="story-title" className="reveal">
                        На сцене с 2015 года
                    </h2>
                    <div className="about-page__prose reveal">
                        {bio.intro.map((p) => (
                            <p key={p.slice(0, 24)}>{p}</p>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section about-page__timeline" aria-labelledby="awards-title">
                <div className="container about-page__two">
                    <div className="about-page__sticky reveal">
                        <h2 id="awards-title">Конкурсы и награды</h2>
                        <p className="muted">Лауреат международных и всероссийских конкурсов с 2017 года.</p>
                    </div>
                    <ol className="timeline reveal" role="list">
                        {bio.awards.map((row) => (
                            <li key={row.year} className="timeline__row">
                                <span className="timeline__year">{row.year}</span>
                                <ul role="list" className="timeline__items">
                                    {row.items.map((it) => (
                                        <li key={it}>{it}</li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <section className="section about-page__edu" aria-labelledby="edu-title">
                <div className="container about-page__two">
                    <div className="about-page__sticky reveal">
                        <h2 id="edu-title">Образование и работа</h2>
                    </div>
                    <div className="reveal">
                        <ul role="list" className="facts">
                            {timeline.map((e) => (
                                <li key={e.what} className="facts__row">
                                    <span className="facts__year">{e.year}</span>
                                    <div>
                                        <h3>{e.what}</h3>
                                        <p>{e.detail}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <figure className="about-page__band reveal">
                <img
                    src={stage1600}
                    srcSet={`${stage800} 800w, ${stage1600} 1600w`}
                    sizes="100vw"
                    width="1600"
                    height="1067"
                    alt="Рудольф Овсепян у рояля на сцене, на экране портрет Пушкина"
                    loading="lazy"
                    decoding="async"
                />
            </figure>

            <section id="repertoire" className="section about-page__rep" aria-labelledby="rep-title">
                <div className="container">
                    <div className="section-head reveal">
                        <h2 id="rep-title">Академический репертуар</h2>
                        <p>Арии и романсы, которые входят в концертные программы. Эстрадную программу на праздник собираем отдельно, под ваши пожелания.</p>
                    </div>
                    <div className="rep reveal">
                        <div className="rep__col">
                            <h3>Арии</h3>
                            <ul role="list" className="rep__arias">
                                {bio.arias.map((a) => (
                                    <li key={a.piece}>
                                        <span className="rep__composer">{a.composer}</span>
                                        <span className="rep__piece">{a.piece}</span>
                                        <span className="rep__from">{a.from}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="rep__col">
                            <h3>Романсы и песни</h3>
                            <ul role="list" className="rep__romances">
                                {bio.romances.map((group) => (
                                    <li key={group.composer}>
                                        <span className="rep__composer">{group.composer}</span>
                                        <ul role="list">
                                            {group.pieces.map((p) => (
                                                <li key={p}>{p}</li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section about-page__end">
                <div className="container about-page__end-inner reveal">
                    <h2>Нужен голос на ваш вечер?</h2>
                    <p className="lead">Напишите дату и формат события: подберу программу от романса до эстрады.</p>
                    <div className="about-page__cta">
                        <a className="btn btn--primary btn--lg" href={contacts.whatsapp} target="_blank" rel="noopener">
                            <FaWhatsapp aria-hidden="true" />
                            Написать в WhatsApp
                        </a>
                        <a className="btn btn--ghost btn--lg" href={contacts.phoneHref}>
                            <FiPhone aria-hidden="true" />
                            Позвонить
                        </a>
                    </div>
                </div>
            </section>
        </article>
    );
};

export default AboutPage;
