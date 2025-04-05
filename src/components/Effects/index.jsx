import React from "react";
import {
    Bloom,
    EffectComposer
} from "@react-three/postprocessing";
import {Stars} from "@react-three/drei";
const Effects = () => (
    <>
        <EffectComposer>
            <Bloom mipmapBlur intesity={0.5}/>
            <Bloom kernelSize={3} luminanceThreshold={0} luminanceSmoothing={0.4} intensity={0.6} />
        </EffectComposer>
        <Stars radius={0.5} depth={25} count={1500} factor={3} saturation={5} fade speed={2}/>
    </>
)

export default Effects;
