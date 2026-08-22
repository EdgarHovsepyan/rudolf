import { createContext, useContext } from 'react';
import { asset } from './asset';

/* Контекст и утилиты плеера держим отдельно от компонента-провайдера:
   так файл с провайдером экспортирует только компонент (требование react-refresh). */

export const PlayerContext = createContext(null);

export const trackSrc = (slug) => asset(`audio/${slug}.m4a`);
export const trackArt = (slug, size) => asset(`audio/art/${slug}-${size}.jpg`);

export const usePlayer = () => {
    const ctx = useContext(PlayerContext);
    if (!ctx) throw new Error('usePlayer вызван вне PlayerProvider');
    return ctx;
};

/**
 * Одно «место звучания» на страницу: когда запускается видео (YouTube или концертная
 * запись), аудио-плеер обязан замолчать, иначе две дорожки играют одновременно.
 * Компоненты видео зовут stopAudio(), провайдер слушает это событие.
 */
export const AUDIO_STOP_EVENT = 'rudolf:stop-audio';
export const stopAudio = () => window.dispatchEvent(new CustomEvent(AUDIO_STOP_EVENT));

export const formatTime = (s) => {
    if (!Number.isFinite(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
};
