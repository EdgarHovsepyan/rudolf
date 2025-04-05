import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function Model(props) {
    const { nodes, materials } = useGLTF('/models/diamond.glb')
    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.pCone1_DiamondOutside_0.geometry}
                material={materials.DiamondOutside}
            />
        </group>
    )
}

useGLTF.preload('/models/diamond.glb')