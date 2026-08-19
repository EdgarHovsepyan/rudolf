import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa6';
import { contactBlock, contacts } from '../../../content/site';
import './style.scss';

const Contact = () => (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
        <div className="stage-lights" aria-hidden="true">
            <i />
            <i />
            <i />
        </div>
        <div className="container contact__inner">
            <div className="contact__text">
                <h2 id="contact-title" data-split>
                    {contactBlock.title}
                </h2>
                <p className="lead reveal">{contactBlock.lead}</p>
                <p className="contact__area reveal">
                    <FiMapPin aria-hidden="true" />
                    {contactBlock.note}
                </p>
            </div>

            <div className="contact__actions" data-stagger>
                <a className="contact__phone" href={contacts.phoneHref}>
                    <span className="contact__phone-label">Телефон</span>
                    <span className="contact__phone-number">{contacts.phoneDisplay}</span>
                </a>
                <div className="contact__buttons">
                    <a className="btn btn--whatsapp btn--lg" href={contacts.whatsapp} target="_blank" rel="noopener">
                        <FaWhatsapp aria-hidden="true" />
                        Написать в WhatsApp
                    </a>
                    <a className="btn btn--telegram btn--lg" href={contacts.telegram} target="_blank" rel="noopener">
                        <FaTelegram aria-hidden="true" />
                        Написать в Telegram
                    </a>
                    <a className="btn btn--ghost btn--lg" href={contacts.phoneHref}>
                        <FiPhone aria-hidden="true" />
                        Позвонить
                    </a>
                </div>
                <a className="contact__mail" href={`mailto:${contacts.email}`}>
                    <FiMail aria-hidden="true" />
                    {contacts.email}
                </a>
            </div>
        </div>
    </section>
);

export default Contact;
