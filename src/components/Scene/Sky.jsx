import { useLayoutEffect } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { asset } from '../../lib/asset';

const SKY = asset('models/sky.webp');

/**
 * Небо: вывернутая наизнанку сфера с equirect-текстурой вместо <Environment>.
 * Картинка уже размыта на этапе сборки, поэтому 5 КБ WebP вместо 1.3 МБ HDR
 * и ни одного PMREM-прохода на GPU. toneMapped={false} — чтобы тон-маппинг
 * не применился второй раз поверх запечённого.
 * Радиус 60: камера гуляет на ±10, и небо даёт лёгкий параллакс, добавляя глубины.
 */
const Sky = () => {
    const map = useTexture(SKY);

    useLayoutEffect(() => {
        map.colorSpace = THREE.SRGBColorSpace;
        map.mapping = THREE.EquirectangularReflectionMapping;
        map.minFilter = THREE.LinearFilter;
        map.magFilter = THREE.LinearFilter;
        map.generateMipmaps = false;
        map.needsUpdate = true;
    }, [map]);

    return (
        // Поворот по Y ставит светящуюся полосу облаков и луну за спину артиста
        <mesh scale={[-60, 60, 60]} rotation={[0, Math.PI / 2, 0]} renderOrder={-1}>
            <sphereGeometry args={[1, 48, 24]} />
            <meshBasicMaterial map={map} side={THREE.FrontSide} toneMapped={false} depthWrite={false} fog={false} />
        </mesh>
    );
};

useTexture.preload(SKY);

export default Sky;
