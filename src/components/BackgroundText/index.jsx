import { useRef } from 'react';
import { Environment, Float, RenderTexture, Text } from '@react-three/drei';
import { Model } from '../Model';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { asset } from '../../lib/asset';

const bloomColor = new THREE.Color('#fff').multiplyScalar(1.5);
const ORIGIN = new THREE.Vector3(0, 0, 0);
const FONT = asset('fonts/RussoOne-Regular.ttf');

/**
 * Имя артиста в хроме: внутри букв через RenderTexture «плавает» бриллиант.
 * Оптимизации: RT уменьшен до 256–512 px (буквы всё равно размывает bloom),
 * окружение для бриллианта берётся из того же HDR, что и фон (один файл,
 * одна загрузка, без внешних CDN), параллакс камеры управляется общим ref мыши.
 */
const BackgroundText = ({ isMobile, reduced, mouse, rtSize = 512, envFile }) => {
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
    const modelScale = isMobile ? 20 : 40;

    return (
        <Text
            font={FONT}
            position={textPosition}
            textAlign="center"
            anchorY="bottom"
            lineHeight={0.98}
            letterSpacing={0.02}
            scale={textScale}
        >
            {'РУДОЛЬФ\nОВСЕПЯН'}
            <meshBasicMaterial color={bloomColor}>
                <RenderTexture attach="map" width={rtSize} height={rtSize} samples={isMobile ? 0 : 2}>
                    <Environment files={envFile} backgroundIntensity={1.5} environmentIntensity={1.5} />
                    <Float floatIntensity={reduced ? 0 : 4} rotationIntensity={reduced ? 0 : 5}>
                        <Model scale={modelScale} position={[0, 0, 10]} rotation={[-Math.PI / 2, 0, 0]} />
                    </Float>
                </RenderTexture>
            </meshBasicMaterial>
        </Text>
    );
};

export default BackgroundText;
