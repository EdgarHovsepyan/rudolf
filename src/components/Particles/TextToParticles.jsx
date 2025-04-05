import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { vertexShader } from '../../shaders/vertexShader';
import { fragmentShader } from '../../shaders/fragmentShader';

const Particles = ({ font, particleTexture }) => {
    const particlesRef = useRef();
    const { scene } = useThree();
    const [mouse, setMouse] = useState(new THREE.Vector2(-200, 200));
    const raycaster = new THREE.Raycaster();
    const colorChange = new THREE.Color();

    const data = {
        text: 'FUTURE\nIS NOW',
        amount: 1500,
        particleSize: 1,
        particleColor: 0xffffff,
        textSize: 16,
        area: 250,
        ease: 0.05,
    };

    const createParticles = (font) => {
        const shapes = font.generateShapes(data.text, data.textSize);
        const geometry = new THREE.ShapeGeometry(shapes);
        geometry.computeBoundingBox();
        const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
        const yMid = (geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2.85;

        geometry.center();

        const holeShapes = [];
        for (const shape of shapes) {
            if (shape.holes && shape.holes.length > 0) {
                for (const hole of shape.holes) {
                    holeShapes.push(hole);
                }
            }
        }
        shapes.push(...holeShapes);

        const thePoints = [];
        const colors = [];
        const sizes = [];

        for (const shape of shapes) {
            const points = shape.getSpacedPoints(shape.type === 'Path' ? data.amount / 2 : data.amount);
            points.forEach((element) => {
                const a = new THREE.Vector3(element.x, element.y, 0);
                thePoints.push(a);
                colors.push(colorChange.r, colorChange.g, colorChange.b);
                sizes.push(1);
            });
        }

        const geoParticles = new THREE.BufferGeometry().setFromPoints(thePoints);
        geoParticles.translate(xMid, yMid, 0);
        geoParticles.setAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3));
        geoParticles.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(0xffffff) },
                pointTexture: { value: particleTexture },
            },
            vertexShader,
            fragmentShader,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
        });

        const particles = new THREE.Points(geoParticles, material);
        particlesRef.current = particles;
        return particles;
    };

    useEffect(() => {
        if (font && particleTexture) {
            const particles = createParticles(font);
            scene.add(particles);
        }
    }, [font, particleTexture, scene]);

    const onMouseMove = (event) => {
        setMouse(new THREE.Vector2((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1));
    };

    useEffect(() => {
        document.addEventListener('mousemove', onMouseMove);
        return () => {
            document.removeEventListener('mousemove', onMouseMove);
        };
    }, []);

    useFrame(() => {
        if (particlesRef.current) {
            const particles = particlesRef.current;
            const positions = particles.geometry.attributes.position.array;
            const colors = particles.geometry.attributes.customColor.array;
            const sizes = particles.geometry.attributes.size.array;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(particles);

            if (intersects.length > 0) {
                for (let i = 0; i < positions.length; i += 3) {
                    let dx = mouse.x - positions[i];
                    let dy = mouse.y - positions[i + 1];
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    let power = 1 - distance / 200;
                    power = power < 0 ? 0 : power;

                    sizes[i / 3] = data.particleSize * (1 + power);
                    colorChange.setHSL(0.5 + power, 1.0, 0.5);
                    colors[i] = colorChange.r;
                    colors[i + 1] = colorChange.g;
                    colors[i + 2] = colorChange.b;
                }
                particles.geometry.attributes.size.needsUpdate = true;
                particles.geometry.attributes.customColor.needsUpdate = true;
            }
        }
    });

    return null;
};

const TextToParticles = () => {
    const [font, setFont] = useState(null);
    const [particleTexture, setParticleTexture] = useState(null);

    useEffect(() => {
        const loader = new FontLoader();
        loader.load('path/to/font.json', setFont);

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load('https://res.cloudinary.com/dfvtkoboz/image/upload/v1605013866/particle_a64uzf.png', setParticleTexture);
    }, []);

    return (
        <>
            {font && particleTexture && <Particles font={font} particleTexture={particleTexture} />}
        </>
    );
};

export default TextToParticles;
