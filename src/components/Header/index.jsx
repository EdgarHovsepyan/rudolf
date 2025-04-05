import React, { useRef, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import gsap from 'gsap';
import Logo from '../Logo';
import './style.scss';

const Header = () => {
    const menuCheckboxRef = useRef(null);
    const menuRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const tl = useRef(null);

    useEffect(() => {
        tl.current = gsap.timeline({ paused: true });
        // Animate the menu open using clipPath
        tl.current.to(menuRef.current, {
            duration: 0.4,
            clipPath: 'circle(150% at 95% 40px)',
            ease: 'power3.out'
        })
            // Animate the text items (li elements) with a fade and upward motion
            .fromTo(
                menuRef.current.querySelectorAll('li'),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, stagger: 0.1, duration: 0.13 },
                "-=0.2"
            );
    }, []);

    const handleToggle = () => {
        setIsMenuOpen(prev => {
            const newState = !prev;
            newState ? tl.current.play() : tl.current.reverse();
            return newState;
        });
    };

    return (
        <header className="main-header">
            <Logo />
            <label className="nav-toggle-btn" htmlFor="nav-toggle">
                <input
                    className="toggle-input"
                    id="nav-toggle"
                    name="toggle"
                    type="checkbox"
                    checked={isMenuOpen}
                    onChange={handleToggle}
                />
                <span />
                <span />
                <span />
            </label>
            <nav ref={menuRef} className="fullscreen-nav">
                <ul>
                    <li><NavLink to="/" onClick={handleToggle}>Home</NavLink></li>
                    <li><NavLink to="/performances" onClick={handleToggle}>Performances</NavLink></li>
                    <li><NavLink to="/gallery" onClick={handleToggle}>Gallery</NavLink></li>
                    <li><NavLink to="/about" onClick={handleToggle}>About</NavLink></li>
                    {/*<li><NavLink to="/contact" onClick={handleToggle}>Contact</NavLink></li>*/}
                </ul>
            </nav>
        </header>
    );
};

export default Header;
