import { FiPhone } from 'react-icons/fi';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa6';
import { contacts } from '../../content/site';
import './style.scss';

/* Мобильная панель связи: всегда под большим пальцем. На десктопе скрыта (CTA в шапке). */
const StickyCta = () => (
    <nav className="sticky-cta" aria-label="Быстрая связь">
        <a className="sticky-cta__item sticky-cta__item--call" href={contacts.phoneHref}>
            <FiPhone aria-hidden="true" />
            <span>Позвонить</span>
        </a>
        <a className="sticky-cta__item sticky-cta__item--wa" href={contacts.whatsapp} target="_blank" rel="noopener">
            <FaWhatsapp aria-hidden="true" />
            <span>WhatsApp</span>
        </a>
        <a className="sticky-cta__item sticky-cta__item--tg" href={contacts.telegram} target="_blank" rel="noopener">
            <FaTelegram aria-hidden="true" />
            <span>Telegram</span>
        </a>
    </nav>
);

export default StickyCta;
