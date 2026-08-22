import { FiPlay, FiPause, FiLoader } from 'react-icons/fi';
import { music } from '../../../content/site';
import { formatTime, trackArt, usePlayer } from '../../../lib/player';
import './style.scss';

/**
 * Список записей: главная «витрина голоса». Кнопка на всю строку, поэтому по треку
 * можно попасть пальцем; текущий трек подсвечивается и озвучивается через aria-current.
 */
const Music = () => {
    const { index, playing, loading, toggle } = usePlayer();

    return (
        <section id="music" className="section music" aria-labelledby="music-title">
            <div className="container">
                <div className="section-head">
                    <h2 id="music-title" data-split>
                        {music.title}
                    </h2>
                    <p className="reveal">{music.lead}</p>
                </div>

                <ol className="tracks" role="list" data-stagger>
                    {music.tracks.map((t, i) => {
                        const current = i === index;
                        const isPlaying = current && playing;
                        return (
                            <li key={t.slug} className={`tracks__item${current ? ' is-current' : ''}`}>
                                <button
                                    type="button"
                                    className="tracks__row"
                                    onClick={() => toggle(i)}
                                    aria-current={current ? 'true' : undefined}
                                    aria-label={isPlaying ? `Пауза: ${t.title}` : `Слушать: ${t.title}, ${t.author}`}
                                >
                                    <span className="tracks__art">
                                        <img src={trackArt(t.slug, 192)} alt="" width="56" height="56" loading="lazy" decoding="async" />
                                        <span className="tracks__badge" aria-hidden="true">
                                            {current && loading ? <FiLoader className="tracks__spin" /> : isPlaying ? <FiPause /> : <FiPlay />}
                                        </span>
                                    </span>
                                    <span className="tracks__text">
                                        <span className="tracks__title">{t.title}</span>
                                        <span className="tracks__author">{t.author}</span>
                                    </span>
                                    <span className="tracks__kind">{t.kind}</span>
                                    <span className="tracks__dur">{formatTime(t.duration)}</span>
                                    {isPlaying && (
                                        <span className="tracks__eq" aria-hidden="true">
                                            <i />
                                            <i />
                                            <i />
                                        </span>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ol>

                <p className="music__note reveal">
                    Нужна песня, которой здесь нет? Пришлите название: подготовлю её к вашему вечеру.
                </p>
            </div>
        </section>
    );
};

export default Music;
