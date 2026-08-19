import { Link } from 'react-router-dom';
import { contacts, footer, nav, site } from '../../content/site';
import './style.scss';

const year = new Date().getFullYear();

const Footer = () => (
    <footer className="site-footer">
        <div className="container site-footer__grid">
            <div className="site-footer__brand">
                <p className="site-footer__name">{site.name}</p>
                <p className="site-footer__line">{footer.line}</p>
            </div>
            <nav aria-label="Карта сайта">
                <ul role="list" className="site-footer__links">
                    {nav.map((item) => (
                        <li key={item.to}>
                            <Link to={item.to}>{item.label}</Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <ul role="list" className="site-footer__contacts">
                <li>
                    <a href={contacts.phoneHref}>{contacts.phoneDisplay}</a>
                </li>
                <li>
                    <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
                </li>
                <li>
                    <a href={contacts.whatsapp} target="_blank" rel="noopener">
                        WhatsApp
                    </a>
                    <span aria-hidden="true"> · </span>
                    <a href={contacts.telegram} target="_blank" rel="noopener">
                        Telegram
                    </a>
                </li>
                <li className="muted">{contacts.area}</li>
            </ul>
        </div>
        <div className="container site-footer__bottom">
            <p>
                © {year} {site.name}
            </p>
        </div>
    </footer>
);

export default Footer;
