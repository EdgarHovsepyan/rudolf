import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Image, PerformanceMonitor, Preload } from '@react-three/drei';
import BackgroundText from '../BackgroundText';
import Effects from '../Effects';
import Rain from '../Rain';
import ProgressReporter from './ProgressReporter';
import { asset } from '../../lib/asset';
import './style.scss';

const ENV = asset('models/sky-1k.hdr'); // 1k HDR: 1.6 МБ вместо 5 МБ, фон всё равно размыт
const PHOTO = asset('models/photo.webp');

const useMedia = (query) => {
    const [match, setMatch] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false));
    useEffect(() => {
        const mq = window.matchMedia(query);
        const onChange = (e) => setMatch(e.matches);
        mq.addEventListener('change', onChange);
        setMatch(mq.matches);
        return () => mq.removeEventListener('change', onChange);
    }, [query]);
    return match;
};

/**
 * Грубая оценка устройства до первого кадра: по ней выбираем стартовый DPR,
 * размер RenderTexture, число частиц и количество bloom-проходов.
 * Дальше PerformanceMonitor подстраивает DPR по реальному FPS.
 */
const detectTier = (isMobile) => {
    if (typeof navigator === 'undefined') return 'mid';
    const cores = navigator.hardwareConcurrency || 4;
    const mem = navigator.deviceMemory || 4;
    const saveData = navigator.connection?.saveData;
    if (saveData) return 'low';
    if (isMobile) return cores >= 6 && mem >= 4 ? 'mid' : 'low';
    return cores >= 8 && mem >= 8 ? 'high' : 'mid';
};

const TIERS = {
    low: { dpr: 1, dprMax: 1.25, rt: 256, rain: 260, stars: 700, bloomPasses: 1, msaa: 0 },
    mid: { dpr: 1.25, dprMax: 1.5, rt: 384, rain: 480, stars: 1100, bloomPasses: 2, msaa: 2 },
    high: { dpr: 1.5, dprMax: 2, rt: 512, rain: 700, stars: 1500, bloomPasses: 2, msaa: 4 },
};

const Scene = () => {
    const isMobile = useMedia('(max-width: 899px)');
    const isWide = useMedia('(min-width: 1200px)');
    const reduced = useMedia('(prefers-reduced-motion: reduce)');
    const hostRef = useRef(null);
    const mouse = useRef({ x: 0, y: 0 });
    const [inView, setInView] = useState(true);
    const tier = useMemo(() => TIERS[detectTier(isMobile)], [isMobile]);
    const [dpr, setDpr] = useState(() => Math.min(tier.dpr, typeof window !== 'undefined' ? window.devicePixelRatio : 1));

    // Сцена вне экрана или вкладка скрыта: кадры не рендерим (GPU и батарея)
    useEffect(() => {
        const el = hostRef.current;
        if (!el || typeof IntersectionObserver === 'undefined') return undefined;
        const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.02 });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    // Один слушатель мыши на всю сцену (параллакс камеры + ветер для дождя)
    useEffect(() => {
        if (reduced || isMobile) return undefined;
        const onMove = (e) => {
            mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', onMove, { passive: true });
        return () => window.removeEventListener('mousemove', onMove);
    }, [reduced, isMobile]);

    const photoX = isWide ? -0.6 : 0; // камера смотрит с -z: минус по x это вправо на экране

    return (
        <div className="scene" ref={hostRef} aria-hidden="true">
            <ProgressReporter />
            <Suspense fallback={null}>
                <Canvas
                    className="scene__canvas"
                    frameloop={inView ? 'always' : 'never'}
                    dpr={dpr}
                    camera={isMobile ? { position: [0, 0, -8], fov: 40 } : { position: [0, 0, -10], fov: 30 }}
                    gl={{ antialias: false, stencil: false, powerPreference: 'high-performance' }}
                    performance={{ min: 0.5 }}
                >
                    {/* Адаптивный DPR: падает при просадке FPS, растёт, когда запас есть */}
                    <PerformanceMonitor
                        flipflops={3}
                        onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
                        onIncline={() => setDpr((d) => Math.min(tier.dprMax, d + 0.25))}
                        onFallback={() => setDpr(1)}
                    />
                    <BackgroundText isMobile={isMobile} reduced={reduced} mouse={mouse} rtSize={tier.rt} envFile={ENV} />
                    <Image
                        scale={isMobile ? [14, 28] : [15, 30]}
                        position={isMobile ? [0, -7, -5] : [photoX, -2.5, -5]}
                        url={PHOTO}
                        transparent
                    />
                    <Environment background backgroundBlurriness={0.18} backgroundRotation={[0, Math.PI / 2, 0]} files={ENV} />
                    {!reduced && <Rain count={tier.rain} mouse={mouse} />}
                    <Effects reduced={reduced} passes={tier.bloomPasses} msaa={tier.msaa} stars={tier.stars} />
                    <Preload all />
                </Canvas>
            </Suspense>
        </div>
    );
};

export default Scene;
