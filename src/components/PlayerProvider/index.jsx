import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { music } from '../../content/site';
import { AUDIO_STOP_EVENT, PlayerContext, trackArt, trackSrc } from '../../lib/player';

/**
 * Один <audio> на весь сайт: он переживает переходы между страницами, поэтому музыка
 * не обрывается при навигации. Здесь же живёт интеграция с navigator.mediaSession —
 * благодаря ей запись видно в системных медиа-контролах (Windows, Android, macOS)
 * с названием, автором и обложкой, а кнопки на наушниках и клавиатуре работают.
 */
const PlayerProvider = ({ children }) => {
    const audioRef = useRef(null);
    const [index, setIndex] = useState(-1); // -1 = ничего не выбрано, док скрыт
    const [playing, setPlaying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [time, setTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(1);
    const [muted, setMuted] = useState(false);

    const tracks = music.tracks;
    const track = index >= 0 ? tracks[index] : null;

    const getAudio = useCallback(() => {
        if (!audioRef.current) {
            const el = new Audio();
            el.preload = 'none';
            el.crossOrigin = 'anonymous';
            audioRef.current = el;
        }
        return audioRef.current;
    }, []);

    const play = useCallback(
        async (i) => {
            const el = getAudio();
            const next = typeof i === 'number' ? i : index >= 0 ? index : 0;
            if (next !== index) {
                setError(false);
                setTime(0);
                setDuration(tracks[next].duration || 0);
                el.src = trackSrc(tracks[next].slug);
                setIndex(next);
            }
            setLoading(true);
            try {
                await el.play();
            } catch {
                setLoading(false);
                setError(true);
            }
        },
        [getAudio, index, tracks],
    );

    const pause = useCallback(() => audioRef.current?.pause(), []);
    const toggle = useCallback(
        (i) => {
            const el = audioRef.current;
            const sameTrack = typeof i !== 'number' || i === index;
            if (el && !el.paused && sameTrack) {
                el.pause();
                return;
            }
            play(i);
        },
        [index, play],
    );

    const step = useCallback(
        (delta) => {
            if (index < 0) return;
            play((index + delta + tracks.length) % tracks.length);
        },
        [index, play, tracks.length],
    );

    const seek = useCallback((t) => {
        const el = audioRef.current;
        if (!el || !Number.isFinite(el.duration)) return;
        el.currentTime = Math.min(Math.max(t, 0), el.duration);
        setTime(el.currentTime);
    }, []);

    const setVolume = useCallback((v) => {
        const el = audioRef.current;
        setVolumeState(v);
        setMuted(v === 0);
        if (el) {
            el.volume = v;
            el.muted = v === 0;
        }
    }, []);

    const toggleMute = useCallback(() => {
        const el = audioRef.current;
        setMuted((m) => {
            const next = !m;
            if (el) el.muted = next;
            return next;
        });
    }, []);

    const close = useCallback(() => {
        audioRef.current?.pause();
        setIndex(-1);
    }, []);

    /* События элемента */
    useEffect(() => {
        const el = getAudio();
        const onPlay = () => {
            setPlaying(true);
            setLoading(false);
            setError(false);
        };
        const onPause = () => setPlaying(false);
        const onTime = () => setTime(el.currentTime);
        const onMeta = () => Number.isFinite(el.duration) && setDuration(el.duration);
        const onWait = () => setLoading(true);
        const onCanPlay = () => setLoading(false);
        const onErr = () => {
            setError(true);
            setLoading(false);
            setPlaying(false);
        };
        const onEnded = () => setIndex((i) => (i >= 0 && i < tracks.length - 1 ? i + 1 : i));
        el.addEventListener('play', onPlay);
        el.addEventListener('playing', onPlay);
        el.addEventListener('pause', onPause);
        el.addEventListener('timeupdate', onTime);
        el.addEventListener('loadedmetadata', onMeta);
        el.addEventListener('durationchange', onMeta);
        el.addEventListener('waiting', onWait);
        el.addEventListener('canplay', onCanPlay);
        el.addEventListener('error', onErr);
        el.addEventListener('ended', onEnded);
        return () => {
            el.removeEventListener('play', onPlay);
            el.removeEventListener('playing', onPlay);
            el.removeEventListener('pause', onPause);
            el.removeEventListener('timeupdate', onTime);
            el.removeEventListener('loadedmetadata', onMeta);
            el.removeEventListener('durationchange', onMeta);
            el.removeEventListener('waiting', onWait);
            el.removeEventListener('canplay', onCanPlay);
            el.removeEventListener('error', onErr);
            el.removeEventListener('ended', onEnded);
        };
    }, [getAudio, tracks.length]);

    /* Автопереход к следующему треку: index изменился по 'ended' — запускаем */
    const prevIndexRef = useRef(-1);
    useEffect(() => {
        const el = audioRef.current;
        if (!el || index < 0) return;
        if (prevIndexRef.current === index) return;
        prevIndexRef.current = index;
        const wanted = trackSrc(tracks[index].slug);
        if (!el.src.endsWith(wanted)) {
            el.src = wanted;
            el.play().catch(() => setError(true));
        }
    }, [index, tracks]);

    /* Системные медиа-контролы: название, автор, обложка и кнопки ОС/наушников */
    useEffect(() => {
        const ms = navigator.mediaSession;
        if (!ms || !track) return;
        ms.metadata = new window.MediaMetadata({
            title: track.title,
            artist: 'Рудольф Овсепян, баритон',
            album: track.note,
            artwork: [192, 512].map((size) => ({
                src: new URL(trackArt(track.slug, size), window.location.origin).href,
                sizes: `${size}x${size}`,
                type: 'image/jpeg',
            })),
        });
        const handlers = [
            ['play', () => play()],
            ['pause', () => pause()],
            ['previoustrack', () => step(-1)],
            ['nexttrack', () => step(1)],
            ['seekbackward', (d) => seek((audioRef.current?.currentTime || 0) - (d?.seekOffset || 10))],
            ['seekforward', (d) => seek((audioRef.current?.currentTime || 0) + (d?.seekOffset || 10))],
            ['seekto', (d) => d?.seekTime != null && seek(d.seekTime)],
            ['stop', () => close()],
        ];
        handlers.forEach(([name, fn]) => {
            try {
                ms.setActionHandler(name, fn);
            } catch {
                /* часть действий не поддерживается — не критично */
            }
        });
        return () => handlers.forEach(([name]) => {
            try {
                ms.setActionHandler(name, null);
            } catch {
                /* noop */
            }
        });
    }, [track, play, pause, step, seek, close]);

    useEffect(() => {
        if (navigator.mediaSession) navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    }, [playing]);

    /* Позиция для системного индикатора прогресса */
    useEffect(() => {
        const ms = navigator.mediaSession;
        if (!ms?.setPositionState || !duration || !Number.isFinite(duration)) return;
        try {
            ms.setPositionState({ duration, playbackRate: 1, position: Math.min(time, duration) });
        } catch {
            /* noop */
        }
    }, [time, duration]);

    /* Видео просит тишины: ставим запись на паузу, но док не закрываем —
       человек вернётся к треку, где остановился. */
    useEffect(() => {
        const onStop = () => audioRef.current?.pause();
        window.addEventListener(AUDIO_STOP_EVENT, onStop);
        return () => window.removeEventListener(AUDIO_STOP_EVENT, onStop);
    }, []);

    useEffect(() => () => audioRef.current?.pause(), []);

    const value = useMemo(
        () => ({
            tracks,
            index,
            track,
            playing,
            loading,
            error,
            time,
            duration,
            volume,
            muted,
            audioRef,
            play,
            pause,
            toggle,
            step,
            seek,
            setVolume,
            toggleMute,
            close,
        }),
        [tracks, index, track, playing, loading, error, time, duration, volume, muted, play, pause, toggle, step, seek, setVolume, toggleMute, close],
    );

    return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};


export default PlayerProvider;
