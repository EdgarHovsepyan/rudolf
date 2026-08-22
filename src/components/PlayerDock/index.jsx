import { useEffect, useRef, useState } from 'react';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2, FiVolumeX, FiX, FiLoader } from 'react-icons/fi';
import { formatTime, trackArt, usePlayer } from '../../lib/player';
import './style.scss';

/**
 * Док-плеер: появляется только когда трек выбран, поэтому на пустой странице
 * нет лишней панели. На телефоне встаёт над полосой контактов и сжимается в одну строку.
 * Полоса прокрутки — настоящий <input type="range">: даёт клавиатуру, шаг стрелками
 * и корректное озвучивание в скринридере без ручных ARIA-костылей.
 */
const PlayerDock = () => {
    const { track, index, playing, loading, error, time, duration, volume, muted, toggle, step, seek, setVolume, toggleMute, close, audioRef } =
        usePlayer();
    const [scrubbing, setScrubbing] = useState(null);
    const vizHostRef = useRef(null);
    const analyzerRef = useRef(null);

    /* Визуализатор подключаем лениво и только когда реально играет */
    useEffect(() => {
        if (!playing || analyzerRef.current || !vizHostRef.current || !audioRef.current) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        let cancelled = false;
        import('audiomotion-analyzer')
            .then(({ default: AudioMotionAnalyzer }) => {
                if (cancelled || !vizHostRef.current) return;
                analyzerRef.current = new AudioMotionAnalyzer(vizHostRef.current, {
                    source: audioRef.current,
                    alphaBars: true,
                    gradient: 'steelblue',
                    showScaleX: false,
                    showBgColor: false,
                    overlay: true,
                    bgAlpha: 0,
                    mode: 6,
                    smoothing: 0.75,
                    minFreq: 40,
                    maxFreq: 12000,
                    linearAmplitude: true,
                    linearBoost: 1.6,
                });
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [playing, audioRef]);

    useEffect(() => () => analyzerRef.current?.destroy?.(), []);

    if (!track) return null;

    const total = duration || track.duration || 0;
    const shown = scrubbing ?? time;
    const pct = total ? (shown / total) * 100 : 0;

    return (
        <div className={`dock${playing ? ' is-playing' : ''}`} role="region" aria-label="Плеер">
            <div ref={vizHostRef} className="dock__viz" aria-hidden="true" />
            <div className="dock__inner">
                <div className="dock__now">
                    <img className="dock__art" src={trackArt(track.slug, 192)} alt="" width="48" height="48" />
                    <div className="dock__meta">
                        <p className="dock__title">{track.title}</p>
                        <p className="dock__sub">
                            {track.author}
                            <span className="dock__kind"> · {track.kind}</span>
                        </p>
                    </div>
                </div>

                <div className="dock__transport">
                    <button type="button" className="dock__btn" onClick={() => step(-1)} aria-label="Предыдущий трек">
                        <FiSkipBack aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        className="dock__btn dock__btn--play"
                        onClick={() => toggle(index)}
                        aria-label={playing ? `Пауза: ${track.title}` : `Слушать: ${track.title}`}
                    >
                        {loading ? <FiLoader className="dock__spin" aria-hidden="true" /> : playing ? <FiPause aria-hidden="true" /> : <FiPlay aria-hidden="true" />}
                    </button>
                    <button type="button" className="dock__btn" onClick={() => step(1)} aria-label="Следующий трек">
                        <FiSkipForward aria-hidden="true" />
                    </button>
                </div>

                <div className="dock__seek">
                    <span className="dock__time">{formatTime(shown)}</span>
                    <span className="dock__rail" style={{ '--pct': `${pct}%` }}>
                        <input
                            type="range"
                            min="0"
                            max={Math.max(total, 1)}
                            step="0.5"
                            value={shown}
                            onChange={(e) => setScrubbing(Number(e.target.value))}
                            onPointerUp={(e) => {
                                seek(Number(e.currentTarget.value));
                                setScrubbing(null);
                            }}
                            onKeyUp={(e) => {
                                seek(Number(e.currentTarget.value));
                                setScrubbing(null);
                            }}
                            aria-label="Перемотка"
                            aria-valuetext={`${formatTime(shown)} из ${formatTime(total)}`}
                        />
                    </span>
                    <span className="dock__time dock__time--total">{formatTime(total)}</span>
                </div>

                <div className="dock__side">
                    <button type="button" className="dock__btn dock__btn--sm" onClick={toggleMute} aria-label={muted ? 'Включить звук' : 'Выключить звук'}>
                        {muted ? <FiVolumeX aria-hidden="true" /> : <FiVolume2 aria-hidden="true" />}
                    </button>
                    <span className="dock__volume" style={{ '--pct': `${(muted ? 0 : volume) * 100}%` }}>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={muted ? 0 : volume}
                            onChange={(e) => setVolume(Number(e.target.value))}
                            aria-label="Громкость"
                            aria-valuetext={`${Math.round((muted ? 0 : volume) * 100)}%`}
                        />
                    </span>
                    <button type="button" className="dock__btn dock__btn--sm" onClick={close} aria-label="Закрыть плеер">
                        <FiX aria-hidden="true" />
                    </button>
                </div>
            </div>
            {error && (
                <p className="dock__error" role="alert">
                    Не удалось загрузить запись. Проверьте соединение и попробуйте ещё раз.
                </p>
            )}
        </div>
    );
};

export default PlayerDock;
