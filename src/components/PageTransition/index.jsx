import React, { useRef, useEffect, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import Spinner from '../Spinner/index.jsx';
import './style.scss';

const PageTransition = () => {
    const location = useLocation();
    const transitionRef = useRef();

    useEffect(() => {
        const timeline = gsap.timeline();

        // Reset the transition element to the initial state
        gsap.set(transitionRef.current, { height: '0%', top: '-100%' });

        // Animation for hiding the current page
        timeline.to(transitionRef.current, {
            duration: 0.8,
            height: '100%',
            top: 0,
            ease: 'power4.inOut',
        });

        // Animation for revealing the new page
        timeline.to(transitionRef.current, {
            duration: 0.8,
            height: '0%',
            top: '100%',
            ease: 'power4.inOut',
            delay: 0.2,
        });
    }, [location]);

    return (
        <>
            <div ref={transitionRef} className="transition">
                <h1>RUDOLF</h1>
            </div>
            <Suspense fallback={null}>
                <Outlet />
            </Suspense>
        </>
    );
};

export default PageTransition;
