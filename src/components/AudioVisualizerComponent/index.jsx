import React, { useEffect, useRef, useState } from 'react';
import AudioMotionAnalyzer from 'audiomotion-analyzer';
import './style.scss';
import TogglePlay from '../TogglePlay';

const Visualizer = () => {
    const audioRef = useRef(null);
    const analyzerDOMRef = useRef(null);
    const analyzerInstance = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const isConnectedRef = useRef(false);

    useEffect(() => {
        analyzerInstance.current = new AudioMotionAnalyzer(analyzerDOMRef.current, {
            alphaBars: true,
            gradient: 'steelblue',
            showScaleX: false,
            showBgColor: false,
            fftSize: 2048,
            bgAlpha: 0,
            overlay: true,
            mode: 2,
        });
        const audio = new Audio('/audio/contest.mp3');
        audio.crossOrigin = 'anonymous';
        audio.loop = true;
        audioRef.current = audio;

        const handleAutoStart = () => {
            if (isConnectedRef.current) return;
            audio.play()
                .then(() => {
                    analyzerInstance.current.connectInput(audio);
                    isConnectedRef.current = true;
                    setIsPlaying(true);
                })
                .catch(() => {});
        };

        window.addEventListener('click', handleAutoStart);
        window.addEventListener('keydown', handleAutoStart);
        window.addEventListener('mousemove', handleAutoStart);
        window.addEventListener('touchstart', handleAutoStart);

        return () => {
            audio.pause();
            analyzerInstance.current.destroy();
            window.removeEventListener('click', handleAutoStart);
            window.removeEventListener('keydown', handleAutoStart);
            window.removeEventListener('mousemove', handleAutoStart);
            window.removeEventListener('touchstart', handleAutoStart);
        };
    }, []);

    const toggleAudio = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play()
                .then(() => {
                    if (!isConnectedRef.current) {
                        analyzerInstance.current.connectInput(audio);
                        isConnectedRef.current = true;
                    }
                    setIsPlaying(true);
                })
                .catch(console.error);
        }
    };

    return (
        <div className="visualizer-container">
            <div ref={analyzerDOMRef} className="visualizer" />
            <TogglePlay isPlaying={isPlaying} onToggle={toggleAudio} />
        </div>
    );
};

export default Visualizer;
