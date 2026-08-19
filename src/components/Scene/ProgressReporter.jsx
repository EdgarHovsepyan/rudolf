import { useEffect } from 'react';
import { useProgress } from '@react-three/drei';
import { setSceneProgress } from '../../lib/sceneProgress';

/* Живёт внутри ленивого чанка сцены и транслирует прогресс drei в общий стор */
const ProgressReporter = () => {
    const { active, progress } = useProgress();
    useEffect(() => {
        setSceneProgress({ active, progress });
    }, [active, progress]);
    return null;
};

export default ProgressReporter;
