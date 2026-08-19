import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * «Дождь света»: тонкие светящиеся штрихи медленно падают сквозь сцену.
 * Один draw call, вся анимация в вершинном шейдере (CPU не трогаем),
 * аддитивное смешивание дружит с bloom. Лёгкий «ветер» от курсора.
 */
const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uWind;
  uniform float uHeight;
  uniform float uPixelRatio;
  attribute float aSpeed;
  attribute float aSize;
  attribute float aPhase;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    float fall = mod(p.y - uTime * aSpeed + aPhase * uHeight, uHeight) - uHeight * 0.5;
    p.y = fall;
    p.x += sin(uTime * 0.35 + aPhase * 6.2831) * 0.35 + uWind * (0.6 + aSpeed * 0.25);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (28.0 / -mv.z);
    // мягче у краёв падения, чтобы штрихи не «рождались» резко
    float edge = 1.0 - smoothstep(0.35, 0.5, abs(fall) / uHeight);
    vAlpha = edge * (0.35 + 0.65 * aSpeed);
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float core = smoothstep(0.5, 0.0, abs(uv.x) * 3.2);   // тонкая вертикаль
    float len = smoothstep(0.5, 0.05, abs(uv.y));         // длина штриха
    float glow = smoothstep(0.5, 0.0, length(uv)) * 0.25; // мягкое гало
    float a = (core * len + glow) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

const Rain = ({ count = 700, area = [26, 18, 10], color = '#bcd4ff', mouse }) => {
    const matRef = useRef(null);
    const wind = useRef(0);

    const { positions, speeds, sizes, phases } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const speeds = new Float32Array(count);
        const sizes = new Float32Array(count);
        const phases = new Float32Array(count);
        const [w, h, d] = area;
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * w;
            positions[i * 3 + 1] = (Math.random() - 0.5) * h;
            positions[i * 3 + 2] = (Math.random() - 0.5) * d - 2;
            speeds[i] = 0.6 + Math.random() * 1.6; // units/sec
            sizes[i] = 0.6 + Math.random() * 1.4;
            phases[i] = Math.random();
        }
        return { positions, speeds, sizes, phases };
    }, [count, area]);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uWind: { value: 0 },
            uHeight: { value: area[1] },
            uPixelRatio: { value: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2) },
            uColor: { value: new THREE.Color(color) },
        }),
        [area, color],
    );

    useFrame((state, delta) => {
        const m = matRef.current;
        if (!m) return;
        m.uniforms.uTime.value += delta;
        const target = mouse ? mouse.current.x * 1.2 : 0;
        wind.current += (target - wind.current) * Math.min(1, delta * 2);
        m.uniforms.uWind.value = wind.current;
    });

    return (
        <points frustumCulled={false}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
                <bufferAttribute attach="attributes-aSpeed" array={speeds} count={count} itemSize={1} />
                <bufferAttribute attach="attributes-aSize" array={sizes} count={count} itemSize={1} />
                <bufferAttribute attach="attributes-aPhase" array={phases} count={count} itemSize={1} />
            </bufferGeometry>
            <shaderMaterial
                ref={matRef}
                uniforms={uniforms}
                vertexShader={vertex}
                fragmentShader={fragment}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
};

export default Rain;
