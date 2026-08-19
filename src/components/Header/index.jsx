import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FiPhone } from 'react-icons/fi';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa6';
import logo from '../../assets/logo-192.png';
import { contacts, nav, site } from '../../content/site';
import './style.scss';

const Header = () => {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const menuRef = useRef(null);
    const toggleRef = useRef(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Закрываем меню при смене маршрута или якоря
    useEffect(() => {
        setOpen(false);
    }, [location.pathname, location.hash]);

    // Esc закрывает, фокус возвращается на кнопку; скролл страницы блокируется
    useEffect(() => {
        if (!open) {
            document.documentElement.style.overflow = '';
            return undefined;
        }
        document.documentElement.style.overflow = 'hidden';
        const firstLink = menuRef.current?.querySelector('a');
        firstLink?.focus({ preventScroll: true });
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setOpen(false);
                toggleRef.current?.focus();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('keydown', onKey);
            document.documentElement.style.overflow = '';
        };
    }, [open]);

    const toggle = useCallback(() => setOpen((v) => !v), []);

    const isAnchor = (to) => to.includes('#');

    return (
        <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
            <div className="site-header__bar">
                <Link to="/" className="site-header__brand" aria-label={`${site.name}, на главную`}>
                    <img src={logo} alt="" width="44" height="44" />
                    <span className="site-header__name">
                        {site.name}
                        <small>{site.role}</small>
                    </span>
                </Link>

                <nav className="site-header__nav" aria-label="Разделы сайта">
                    <ul role="list">
                        {nav.map((item) => (
                            <li key={item.to}>
                                {isAnchor(item.to) ? (
                                    <Link to={item.to}>{item.label}</Link>
                                ) : (
                                    <NavLink to={item.to}>{item.label}</NavLink>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="site-header__actions">
                    <a className="btn btn--ghost site-header__phone" href={contacts.phoneHref}>
                        <FiPhone aria-hidden="true" />
                        <span>{contacts.phoneDisplay}</span>
                    </a>
                    <a className="btn btn--icon btn--ghost site-header__phone-icon" href={contacts.phoneHref} aria-label="Позвонить">
                        <FiPhone aria-hidden="true" />
                    </a>
                    <button
                        ref={toggleRef}
                        type="button"
                        className="site-header__toggle"
                        aria-expanded={open}
                        aria-controls="site-menu"
                        aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
                        onClick={toggle}
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>
            </div>

            <div id="site-menu" ref={menuRef} className="site-menu" aria-hidden={!open} inert={open ? undefined : ''}>
                <nav aria-label="Меню">
                    <ul role="list" className="site-menu__links">
                        {nav.map((item, i) => (
                            <li key={item.to} style={{ '--i': i }}>
                                {isAnchor(item.to) ? (
                                    <Link to={item.to} tabIndex={open ? 0 : -1}>
                                        {item.label}
                                    </Link>
                                ) : (
                                    <NavLink to={item.to} tabIndex={open ? 0 : -1}>
                                        {item.label}
                                    </NavLink>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="site-menu__contacts">
                    <a className="btn btn--primary btn--lg" href={contacts.phoneHref} tabIndex={open ? 0 : -1}>
                        <FiPhone aria-hidden="true" />
                        {contacts.phoneDisplay}
                    </a>
                    <div className="site-menu__messengers">
                        <a className="btn btn--whatsapp" href={contacts.whatsapp} target="_blank" rel="noopener" tabIndex={open ? 0 : -1}>
                            <FaWhatsapp aria-hidden="true" />
                            WhatsApp
                        </a>
                        <a className="btn btn--telegram" href={contacts.telegram} target="_blank" rel="noopener" tabIndex={open ? 0 : -1}>
                            <FaTelegram aria-hidden="true" />
                            Telegram
                        </a>
                    </div>
                    <p className="muted">{contacts.area}</p>
                </div>
            </div>
        </header>
    );
};

export default Header;
