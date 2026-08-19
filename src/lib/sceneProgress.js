/**
 * Крошечное хранилище прогресса загрузки 3D-сцены.
 * Нужно, чтобы экран загрузки (в основном бандле) не тянул за собой three.js:
 * сцена грузится лениво и сама сообщает сюда {active, progress}.
 */
import { useSyncExternalStore } from 'react';

let state = { active: false, progress: 0, seen: false };
const listeners = new Set();

export const setSceneProgress = (next) => {
    state = { ...state, ...next, seen: state.seen || next.active === true };
    listeners.forEach((l) => l());
};

const subscribe = (l) => {
    listeners.add(l);
    return () => listeners.delete(l);
};

const getSnapshot = () => state;

export const useSceneProgress = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
