import { useGLTF } from '@react-three/drei';
import { asset } from '../../lib/asset';

const DIAMOND = asset('models/diamond.glb');

/**
 * Бриллиант, который «живёт» внутри букв имени (через RenderTexture).
 * В GLB осталась только геометрия (16 КБ вместо 338 КБ): три встроенные PNG-текстуры
 * не имели смысла в блёстках размером 512 px. Материал задаём здесь: полированный
 * хром-самоцвет ловит студийные Lightformer'ы и даёт резкие грани-искры.
 */
export function Model(props) {
    const { nodes } = useGLTF(DIAMOND);
    return (
        <group {...props} dispose={null}>
            <mesh geometry={nodes.pCone1_DiamondOutside_0.geometry}>
                <meshPhysicalMaterial
                    color="#eaf2ff"
                    metalness={0.85}
                    roughness={0.08}
                    reflectivity={1}
                    clearcoat={1}
                    clearcoatRoughness={0.05}
                    iridescence={0.6}
                    iridescenceIOR={1.6}
                    envMapIntensity={2.2}
                />
            </mesh>
        </group>
    );
}

useGLTF.preload(DIAMOND);
