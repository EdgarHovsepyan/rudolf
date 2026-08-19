import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Stars } from '@react-three/drei';

/**
 * Пост-обработка. На слабых устройствах один bloom-проход вместо двух и без MSAA:
 * это самая дорогая часть сцены (полноэкранные проходы × DPR²).
 */
const Effects = ({ reduced, passes = 2, msaa = 4, stars = 1500 }) => (
    <>
        <EffectComposer multisampling={msaa}>
            {/* intensity 1 = то, что реально рендерилось раньше (опечатка intesity игнорировалась) */}
            <Bloom mipmapBlur intensity={1} />
            {passes > 1 ? <Bloom kernelSize={3} luminanceThreshold={0} luminanceSmoothing={0.4} intensity={0.6} /> : null}
        </EffectComposer>
        <Stars radius={0.5} depth={25} count={stars} factor={3} saturation={5} fade speed={reduced ? 0 : 2} />
    </>
);

export default Effects;
