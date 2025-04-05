import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import heroImg from '../../assets/gallery/5.jpg';
import profileImg from '../../assets/gallery/7.jpg';
import './style.scss';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
    const aboutRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.hero-text', {
                opacity: 0,
                y: 50,
                duration: 1,
                ease: 'power3.out'
            });
            gsap.from('.hero-img', {
                opacity: 0,
                x: 50,
                duration: 1,
                delay: 0.3,
                ease: 'power3.out'
            });
            gsap.from('.stats .stat', {
                opacity: 0,
                y: 30,
                stagger: 0.2,
                duration: 0.8,
                delay: 0.5,
                ease: 'power3.out'
            });
            gsap.from('.about-details', {
                opacity: 0,
                y: 30,
                duration: 1,
                delay: 0.7,
                ease: 'power3.out'
            });

            gsap.to('.hero-img img', {
                scrollTrigger: {
                    trigger: '.hero-img',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                },
                y: -50,
                ease: 'none'
            });

            gsap.to('.content-block img', {
                scrollTrigger: {
                    trigger: '.content-block img',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                },
                y: -30,
                ease: 'none'
            });
        }, aboutRef);
        return () => ctx.revert();
    }, []);

    return (
        <section id="about" className="about" ref={aboutRef}>
            <div className="about-container">
                <section className="about-hero">
                    <div className="hero-text">
                        <h1>Rudolf Vagramovich Ovsepyan</h1>
                        <p>
                            In the realm of timeless melodies, Rudolf emerges as a soulful baritone whose voice carries the weight of history and the lightness of poetic dreams. His music, like a gentle breeze on a quiet evening, whispers tales of love, longing, and eternal beauty.
                        </p>
                    </div>
                    <div className="hero-img">
                        <img src={heroImg} alt="Rudolf Ovsepyan" />
                    </div>
                </section>

                <section className="stats">
                    <div className="stat">
                        <h2>8+ Years</h2>
                        <p>Stage Experience</p>
                    </div>
                    <div className="stat">
                        <h2>15+ Awards</h2>
                        <p>National & International</p>
                    </div>
                    <div className="stat">
                        <h2>100+ Concerts</h2>
                        <p>Global Appearances</p>
                    </div>
                </section>

                <section className="about-details">
                    <div className="content-block">
                        <img src={profileImg} alt="Profile" />
                        <div className="text-p">
                            <h2>Artistic Journey</h2>
                            <p>
                                Trained at MGPi under the mentorship of Honored Artist R.P. Lisitsian and refined at Tver Music College, Rudolf’s path is a harmonious blend of passion, discipline, and artistry. Celebrated at international competitions, his accolades mark the milestones of a journey fueled by dedication and excellence.
                            </p>
                        </div>
                    </div>

                    <div className="content-block">
                        <div className="text-p">
                            <h2>Legacy & Inspiration</h2>
                            <p>
                                Since 2015, Rudolf has captivated audiences as a guest soloist, and as an educator since 2020, he inspires a new generation of vocalists, leaving an indelible mark on classical music. His repertoire weaves a tapestry of romance and drama—ranging from soulful romances to grand operatic arias—each performance a verse in his everlasting ballad.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </section>
    );
};

export default About;
