import { Component } from 'react';
import { setSceneProgress } from '../../lib/sceneProgress';
import { asset } from '../../lib/asset';

/**
 * Если WebGL недоступен (старый браузер, отключённое ускорение, CSP),
 * сцена не должна ронять страницу: показываем статичный портрет на фоне,
 * а экран загрузки отпускаем сразу.
 */
export default class SceneBoundary extends Component {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    componentDidCatch(error) {
        setSceneProgress({ active: false, progress: 100, seen: true });
        if (import.meta.env.DEV) console.warn('3D-сцена недоступна, показываем статичный герой:', error);
    }

    render() {
        if (this.state.failed) {
            return (
                <div className="scene scene--static" aria-hidden="true">
                    <img src={asset('models/photo.webp')} alt="" />
                </div>
            );
        }
        return this.props.children;
    }
}
