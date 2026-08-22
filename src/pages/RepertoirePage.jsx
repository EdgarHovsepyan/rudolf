import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa6';
import { bio, contacts, estradaSongs, magomaevSongs, repertoirePage } from '../content/site';
import useReveal from '../hooks/useReveal';
import useSectionMotion from '../hooks/useSectionMotion';
import usePageMeta from '../hooks/usePageMeta';
import './repertoire.scss';

const count = (groups) => groups.reduce((n, g) => n + g.pieces.length, 0);

const SongGroups = ({ groups, keyName }) => (
    <div className="songs">
        {groups.map((g) => (
            <section key={g[keyName]} className="songs__group reveal" aria-label={g[keyName]}>
                <h2>{g[keyName]}</h2>
                <ul role="list">
                    {g.pieces.map((p) => (
                        <li key={p}>{p}</li>
                    ))}
                </ul>
            </section>
        ))}
    </div>
);

const RepertoirePage = () => {
    const [tab, setTab] = useState('magomaev');
    const scope = useRef(null);
    useReveal([tab]);
    useSectionMotion(scope);

    usePageMeta(
        'Репертуар: эстрада, песни Магомаева, арии и романсы',
        '26 песен из репертуара Магомаева, 59 эстрадных хитов, 9 оперных арий и 30 романсов. Любую песню добавлю к программе вашего вечера.',
    );

    const counts = {
        magomaev: count(magomaevSongs),
        estrada: count(estradaSongs),
        classical: bio.arias.length + bio.romances.reduce((n, g) => n + g.pieces.length, 0),
    };
    const current = repertoirePage.groups.find((g) => g.id === tab);

    return (
        <article className="rep-page" ref={scope}>
            <header className="rep-page__head">
                <div className="container">
                    <h1 data-split>{repertoirePage.title}</h1>
                    <p className="lead">{repertoirePage.lead}</p>
                </div>
            </header>

            <div className="container">
                <div className="rep-tabs" role="tablist" aria-label="Программы">
                    {repertoirePage.groups.map((g) => (
                        <button
                            key={g.id}
                            type="button"
                            role="tab"
                            id={`tab-${g.id}`}
                            aria-selected={tab === g.id}
                            aria-controls={`panel-${g.id}`}
                            tabIndex={tab === g.id ? 0 : -1}
                            className="rep-tabs__tab"
                            onClick={() => setTab(g.id)}
                            onKeyDown={(e) => {
                                const ids = repertoirePage.groups.map((x) => x.id);
                                const i = ids.indexOf(tab);
                                if (e.key === 'ArrowRight') setTab(ids[(i + 1) % ids.length]);
                                if (e.key === 'ArrowLeft') setTab(ids[(i - 1 + ids.length) % ids.length]);
                            }}
                        >
                            <span className="rep-tabs__label">{g.label}</span>
                            <span className="rep-tabs__count">{counts[g.id]}</span>
                        </button>
                    ))}
                </div>

                <p className="rep-page__note">{current.note}</p>

                <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="rep-page__panel" key={tab}>
                    {tab === 'magomaev' && <SongGroups groups={magomaevSongs} keyName="composer" />}
                    {tab === 'estrada' && <SongGroups groups={estradaSongs} keyName="artist" />}
                    {tab === 'classical' && (
                        <div className="rep">
                            <div className="rep__col reveal">
                                <h2>Арии</h2>
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
                            <div className="rep__col reveal">
                                <h2>Романсы и песни</h2>
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
                    )}
                </div>
            </div>

            <section className="section rep-page__end">
                <div className="container rep-page__end-inner reveal">
                    <h2>Не нашли любимую песню?</h2>
                    <p className="lead">Напишите её название: подготовлю к вашему вечеру. Программа всегда собирается под гостей и площадку.</p>
                    <div className="rep-page__cta">
                        <a className="btn btn--primary btn--lg" href={contacts.whatsapp} target="_blank" rel="noopener">
                            <FaWhatsapp aria-hidden="true" />
                            Написать в WhatsApp
                        </a>
                        <a className="btn btn--ghost btn--lg" href={contacts.phoneHref}>
                            <FiPhone aria-hidden="true" />
                            Позвонить
                        </a>
                        <Link className="arrow-link" to="/#video">
                            Послушать записи
                        </Link>
                    </div>
                </div>
            </section>
        </article>
    );
};

export default RepertoirePage;
