import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import BackgroundText from '../BackgroundText';
import { Environment, Image } from '@react-three/drei';
import Effects from '../Effects';
import TextToParticles from '../Particles/TextToParticles';
import { useMediaQuery } from 'react-responsive';
import './style.scss';

const Scene = () => {
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

    return (
        <div className="scene-container">
            <Suspense fallback={null}>
                <Canvas
                    className="scene-canvas"
                    camera={isMobile ? { position: [0, 0, -8], fov: 40 } : { position: [0, 0, -10], fov: 30 }}
                >
                    <BackgroundText />
                    <Image
                        scale={isMobile ? [14, 28] : [15, 30]}
                        position={isMobile ? [0, -10, -5] : [0, -2.5, -5]}
                        url="/models/photo.png"
                        transparent
                    />
                    <Environment
                        background
                        backgroundBlurriness={0.18}
                        backgroundRotation={[0, Math.PI / 2, 0]}
                        files="/models/11.hdr"
                    />
                    <Effects />
                    <TextToParticles />
                </Canvas>
            </Suspense>
        </div>
    );
};

export default Scene;
