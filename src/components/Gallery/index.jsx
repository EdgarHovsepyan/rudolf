import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import img_1 from '../../assets/gallery/1.jpg';
import img_2 from '../../assets/gallery/2.jpg';
import img_3 from '../../assets/gallery/3.jpg';
import img_4 from '../../assets/gallery/4.jpg';
import img_5 from '../../assets/gallery/5.jpg';
import img_6 from '../../assets/gallery/6.jpg';
import img_7 from '../../assets/gallery/7.jpg';
import img_8 from '../../assets/gallery/8.jpg';
import './style.scss';

gsap.registerPlugin(ScrollTrigger);

const ParallaxScroller = () => {
    const sectionsRef = useRef([]);
    const images = [img_1, img_2, img_3, img_4, img_5, img_6, img_7, img_8];

    useEffect(() => {
        sectionsRef.current.forEach((section, i) => {
            const bg = section.querySelector('.bg');
            bg.style.backgroundImage = `url(${images[i]})`;

            if (i === 0) {
                bg.style.backgroundPosition = '50% 0px';
                gsap.to(bg, {
                    backgroundPosition: `50% ${-window.innerHeight / 2}px`,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: true,
                    },
                });
            } else {
                bg.style.backgroundPosition = `50% ${window.innerHeight / 2}px`;
                gsap.to(bg, {
                    backgroundPosition: `50% ${-window.innerHeight / 2}px`,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: section,
                        scrub: true,
                    },
                });
            }
        });
    }, []);

    const texts = [
        "Meet Rudolf Hovsepyan",
        "An Acclaimed Armenian Baritone",
        "Proud Graduate of Tver Music College and Moscow State Pedagogical University",
        "Winner of Numerous Prestigious Competitions",
        "A Soloist at Tver Academic Philharmonic",
        "Dedicated Teacher at Tver Music College",
        "Master of Romantic and Classical Melodies",
        "Join Rudolf on His Musical Journey"
    ];

    return (
        <>
            {texts.map((text, index) => (
                <div className="section" key={index} ref={el => sectionsRef.current[index] = el}>
                    <div className="bg">
                        <h1>{text}</h1>
                    </div>
                </div>
            ))}
        </>
    );
};

export default ParallaxScroller;
