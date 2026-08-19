import { useRef } from 'react';
import { Environment, Float, GradientTexture, Lightformer, RenderTexture, Text } from '@react-three/drei';
import { Model } from '../Model';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { asset } from '../../lib/asset';

const ORIGIN = new THREE.Vector3(0, 0, 0);
const FONT = asset('fonts/RussoOne-Regular.ttf');
const SPARKLE_TINT = new THREE.Color('#ffffff').multiplyScalar(0.9);

/**
 * Имя артиста в два слоя:
 *  1) заливка: градиент whitesmoke → ледяной → электрик (холодный хром) с тёмным контуром,
 *     читается на любом фоне;
 *  2) блеск: RenderTexture с бриллиантом в аддитивном смешивании, добавляет только яркие грани,
 *     как отсветы на хроме.
 * Параллакс камеры управляется общим ref мыши из Scene.
 */
const BackgroundText = ({ isMobile, reduced, mouse, rtSize = 512 }) => {
    const { camera } = useThree();
    const target = useRef(new THREE.Vector3(0, 0, 50));

    useFrame(() => {
        if (!camera) return;
        const strength = reduced || isMobile ? 0 : 10;
        target.current.x = THREE.MathUtils.lerp(target.current.x, mouse.current.x * strength, 0.1);
        target.current.y = THREE.MathUtils.lerp(target.current.y, mouse.current.y * strength, 0.1);
        camera.position.lerp(target.current, 0.1);
        camera.lookAt(ORIGIN);
    });

    const textScale = isMobile ? 1.6 : 3.6;
    const textPosition = isMobile ? [0, 11, 0] : [0, -11, 0];
    const modelScale = isMobile ? 14 : 24;
    const common = {
        font: FONT,
        textAlign: 'center',
        anchorY: 'bottom',
        lineHeight: 0.98,
        letterSpacing: 0.02,
        scale: textScale,
        children: 'РУДОЛЬФ\nОВСЕПЯН',
    };

    return (
        <group position={textPosition}>
            {/* Слой 1: градиентная заливка + контур */}
            <Text {...common} outlineWidth="3.5%" outlineColor="#070a1f" outlineOpacity={0.9} outlineBlur="2%">
                {common.children}
                <meshBasicMaterial toneMapped={false}>
                    {/* whitesmoke → ледяной → небесный → электрик: холодный хром с синим отливом */}
                    <GradientTexture attach="map" stops={[0, 0.36, 0.68, 1]} colors={['#f5f5f7', '#dce9ff', '#8ab8ff', '#3b78f5']} size={256} />
                </meshBasicMaterial>
            </Text>

            {/* Слой 2: блеск бриллианта (аддитивно, чуть ближе к камере) */}
            <Text {...common} position={[0, 0, 0.06]}>
                {common.children}
                <meshBasicMaterial color={SPARKLE_TINT} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false}>
                    <RenderTexture attach="map" width={rtSize} height={rtSize} samples={isMobile ? 0 : 2}>
                        <Environment resolution={128}>
                            <Lightformer form="rect" intensity={5} color="#fff4dc" position={[0, 8, -6]} scale={[14, 6, 1]} target={[0, 0, 10]} />
                            <Lightformer form="ring" intensity={3.5} color="#9fc4ff" position={[-9, 3, 4]} scale={7} target={[0, 0, 10]} />
                            <Lightformer form="rect" intensity={2.5} color="#ffb38a" position={[9, -4, 4]} scale={[6, 6, 1]} target={[0, 0, 10]} />
                        </Environment>
                        <Float floatIntensity={reduced ? 0 : 3} rotationIntensity={reduced ? 0 : 2.5}>
                            <Model scale={modelScale} position={[0, 0, 10]} rotation={[-Math.PI / 2, 0, 0]} />
                        </Float>
                    </RenderTexture>
                </meshBasicMaterial>
            </Text>
        </group>
    );
};

export default BackgroundText;
