import React from 'react';
import "./style.scss";

const Contact = () => (
    <section id="contact" className="contact">
        <h2>Contact</h2>
        <form>
            <input type="text" name="name" placeholder="Name" required/>
            <input type="email" name="email" placeholder="Email" required/>
            <textarea name="message" placeholder="Message" required></textarea>
            <button type="submit">Send</button>
        </form>
        <div className="social-media">
            <a href="#"><i className="fa fa-instagram"></i></a>
            <a href="#"><i className="fa fa-facebook"></i></a>
            <a href="#"><i className="fa fa-youtube"></i></a>
        </div>
    </section>
);

export default Contact;