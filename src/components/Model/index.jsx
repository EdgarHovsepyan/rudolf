import { useGLTF } from '@react-three/drei';
import { asset } from '../../lib/asset';

const DIAMOND = asset('models/diamond.glb');

/* Бриллиант, который «живёт» внутри букв имени (через RenderTexture) */
export function Model(props) {
    const { nodes, materials } = useGLTF(DIAMOND);
    return (
        <group {...props} dispose={null}>
            <mesh geometry={nodes.pCone1_DiamondOutside_0.geometry} material={materials.DiamondOutside} />
        </group>
    );
}

useGLTF.preload(DIAMOND);
