import { useCallback, useEffect, useRef, useState } from 'react';
import { FiPlay, FiPause, FiLoader } from 'react-icons/fi';
import { asset } from '../../lib/asset';
import './style.scss';

const SRC = asset('audio/contest.mp3');

/**
 * Плавающий плеер «Послушать запись». Ничего не грузит и не играет, пока не нажали:
 * автозапуск музыки по движению мыши был анти-паттерном. Визуализатор подключается
 * лениво (audiomotion-analyzer весит ~100 КБ) и рисует столбики только во время игры.
 */
const AudioPlayer = () => {
    const audioRef = useRef(null);
    const analyzerRef = useRef(null);
    const vizHostRef = useRef(null);
    const [state, setState] = useState('idle'); // idle | loading | playing | paused | error

    const ensureAnalyzer = useCallback(async (audio) => {
        if (analyzerRef.current || !vizHostRef.current) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        try {
            const { default: AudioMotionAnalyzer } = await import('audiomotion-analyzer');
            analyzerRef.current = new AudioMotionAnalyzer(vizHostRef.current, {
                source: audio,
                alphaBars: true,
                gradient: 'steelblue',
                showScaleX: false,
                showBgColor: false,
                fftSize: 2048,
                bgAlpha: 0,
                overlay: true,
                mode: 2,
                smoothing: 0.7,
                maxFreq: 12000,
                minFreq: 40,
            });
        } catch {
            /* визуализация необязательна */
        }
    }, []);

    const toggle = useCallback(async () => {
        if (!audioRef.current) {
            const audio = new Audio(SRC);
            audio.preload = 'none';
            audio.loop = true;
            audio.addEventListener('playing', () => setState('playing'));
            audio.addEventListener('pause', () => setState('paused'));
            audio.addEventListener('waiting', () => setState('loading'));
            audio.addEventListener('error', () => setState('error'));
            audioRef.current = audio;
        }
        const audio = audioRef.current;
        if (!audio.paused) {
            audio.pause();
            return;
        }
        setState('loading');
        try {
            await audio.play();
            await ensureAnalyzer(audio);
        } catch {
            setState('error');
        }
    }, [ensureAnalyzer]);

    useEffect(
        () => () => {
            audioRef.current?.pause();
            analyzerRef.current?.destroy?.();
        },
        [],
    );

    const playing = state === 'playing';
    const loading = state === 'loading';
    const label = playing ? 'Пауза' : loading ? 'Загружаем' : 'Послушать запись';

    return (
        <div className={`audio-player${playing ? ' is-playing' : ''}`}>
            <div ref={vizHostRef} className="audio-player__viz" aria-hidden="true" />
            <button
                type="button"
                className="audio-player__btn"
                onClick={toggle}
                aria-pressed={playing}
                aria-label={playing ? 'Поставить запись на паузу' : 'Послушать запись выступления'}
                disabled={state === 'error'}
            >
                <span className="audio-player__icon">
                    {loading ? <FiLoader className="spin" /> : playing ? <FiPause /> : <FiPlay />}
                </span>
                <span className="audio-player__label">{state === 'error' ? 'Запись недоступна' : label}</span>
            </button>
        </div>
    );
};

export default AudioPlayer;
