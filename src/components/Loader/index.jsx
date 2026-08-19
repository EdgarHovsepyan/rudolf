import { useEffect, useRef, useState } from 'react';
import { useSceneProgress } from '../../lib/sceneProgress';
import logo from '../../assets/logo-192.png';
import './style.scss';

const MIN_SHOW_MS = 700; // чтобы индикатор не мигал на быстрых сетях
const FAILSAFE_MS = 12000; // если сцена не отчиталась, пускаем на страницу всё равно

/**
 * Экран загрузки главной: честный процент из загрузчика three (через sceneProgress,
 * чтобы не тянуть three.js в основной бандл). Снимается, когда все ассеты сцены
 * загружены, или по fail-safe таймеру.
 */
const Loader = ({ onDone }) => {
    const { active, progress, seen } = useSceneProgress();
    const [phase, setPhase] = useState('loading'); // loading | leaving | gone
    const startedAt = useRef(performance.now());
    const doneRef = useRef(false);
    const onDoneRef = useRef(onDone);
    onDoneRef.current = onDone;

    useEffect(() => {
        if (doneRef.current) return undefined;
        const finished = seen && !active && progress >= 100;
        const elapsed = performance.now() - startedAt.current;

        let timer;
        let goneTimer;
        const leave = () => {
            if (doneRef.current) return;
            doneRef.current = true;
            onDoneRef.current?.();
            setPhase('leaving');
            goneTimer = setTimeout(() => setPhase('gone'), 650);
        };

        if (finished) {
            timer = setTimeout(leave, Math.max(0, MIN_SHOW_MS - elapsed));
        } else {
            timer = setTimeout(leave, Math.max(0, FAILSAFE_MS - elapsed));
        }
        return () => {
            clearTimeout(timer);
            // goneTimer намеренно не чистим: уход должен завершиться даже после ре-рендера
            void goneTimer;
        };
    }, [active, progress, seen]);

    if (phase === 'gone') return null;

    const pct = Math.round(Math.min(100, progress));

    return (
        <div className={`loader${phase === 'leaving' ? ' is-leaving' : ''}`} role="status" aria-live="polite">
            <div className="loader__inner">
                <img className="loader__logo" src={logo} alt="" width="72" height="72" />
                <p className="loader__label">
                    Готовим сцену <span className="loader__pct">{pct}%</span>
                </p>
                <div className="loader__bar" aria-hidden="true">
                    <span style={{ transform: `scaleX(${pct / 100})` }} />
                </div>
            </div>
        </div>
    );
};

export default Loader;
