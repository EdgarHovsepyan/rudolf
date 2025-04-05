import React from 'react';
import "./style.scss";

const Footer = () => (
    <footer>
        <div className="quick-links">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#performances">Performances</a>
            <a href="#gallery">Gallery</a>
            {/*<a href="#contact">Contact</a>*/}
        </div>
        <div className="contact-info">
            <p>Email: rudolf1994@mail.ru</p>
            <p>Phone: 8-904-007-04-54</p>
        </div>
        <div className="social-media">
            <a href="#"><i className="fa fa-instagram"></i></a>
            <a href="#"><i className="fa fa-facebook"></i></a>
            <a href="#"><i className="fa fa-youtube"></i></a>
        </div>
        <p>&copy; 2024 Rudolf Hovsepyan. All Rights Reserved.</p>
    </footer>
);

export default Footer;