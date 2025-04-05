import React, {useEffect, useRef, useState} from 'react';
import gsap from 'gsap';
import {FaAngleRight} from 'react-icons/fa';
import Scene from '../Scene';
import Spinner from '../Spinner';
import './style.scss';

const Hero = () => {
    const [loading, setLoading] = useState(true);
    const headingRef = useRef(null);
    const paragraphRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!loading) {
            const config = {duration: 1, ease: 'power3.out'};
            gsap.fromTo(headingRef.current, {opacity: 0, x: -100}, {...config, opacity: 1, x: 0, delay: 1.5});
            gsap.fromTo(paragraphRef.current, {opacity: 0, x: 100}, {...config, opacity: 1, x: 0, delay: 1.6});
            gsap.fromTo(buttonRef.current, {opacity: 0, x: -100}, {...config, opacity: 1, x: 0, delay: 1.7});
        }
    }, [loading]);


    return (
        <section id="home" className="hero">
            {loading && <Spinner/>}
            <Scene/>
            <div className="hero-content">
                <div className="info-container">
                    <h1 ref={headingRef}>Experience the Passion of Baritone</h1>
                    <p ref={paragraphRef}>
                        Join <b>Rudolf Hovsepyan</b> on his musical journey.
                    </p>
                    <a href="#about" className="btn" ref={buttonRef}>
                        Learn More <FaAngleRight/>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Hero;
