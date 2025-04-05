import React, { useEffect, useRef, useState } from 'react'
import { Environment, Float, RenderTexture, Text } from '@react-three/drei'
import { Model } from '../Model'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useMediaQuery } from 'react-responsive'

const bloomColor = new THREE.Color('#fff').multiplyScalar(1.5)

const BackgroundText = () => {
    const [mouse, setMouse] = useState({ x: 0, y: 0 })
    const { camera } = useThree()
    const targetPosition = useRef(new THREE.Vector3(0, 0, 50))
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' })

    const handleMouseMove = (event) => {
        const x = (event.clientX / window.innerWidth) * 2 - 1
        const y = -(event.clientY / window.innerHeight) * 2 + 1
        setMouse({ x, y })
    }

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove)
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    useFrame(() => {
        if (camera) {
            targetPosition.current.x = THREE.MathUtils.lerp(
                targetPosition.current.x,
                mouse.x * 10,
                0.1
            )
            targetPosition.current.y = THREE.MathUtils.lerp(
                targetPosition.current.y,
                mouse.y * 10,
                0.1
            )

            camera.position.lerp(targetPosition.current, 0.1)
            camera.lookAt(new THREE.Vector3(0, 0, 0))
        }
    })

    const textScale = isMobile ? 1.8 : 4
    const textPosition = isMobile ? [0, 12, 0] : [0, -12, 0]
    const modelScale = isMobile ? 20 : 40
    const modelPosition = isMobile ? [0, 0, 10] : [0, 0, 10]

    return (
        <Text
            font={'fonts/Notable-Regular.ttf'}
            position={textPosition}
            textAlign='center'
            anchorY='bottom'
            lineHeight={1}
            scale={textScale}
        >
            RUDOLF{'\n'}HOVSEPYAN
            <meshBasicMaterial color={bloomColor}>
                <RenderTexture attach='map'>
                    <Environment preset='warehouse' backgroundIntensity={1.5} environmentIntensity={1.5} />
                    <Float floatIntensity={4} rotationIntensity={5}>
                        <Model
                            scale={modelScale}
                            position={modelPosition}
                            rotation={[-Math.PI / 2, 0, 0]}
                        />
                    </Float>
                </RenderTexture>
            </meshBasicMaterial>
        </Text>
    )
}

export default BackgroundText
