import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import StickyCta from '../StickyCta';
import PlayerDock from '../PlayerDock';
import PlayerProvider from '../PlayerProvider';
import PageTransition from '../PageTransition';

/* Прокрутка: к якорю при наличии #hash (с повтором, пока секция грузится), иначе наверх. */
const ScrollManager = () => {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (!hash) {
            window.scrollTo({ top: 0, behavior: 'instant' });
            return undefined;
        }
        const id = decodeURIComponent(hash.slice(1));
        let tries = 0;
        let raf = 0;
        const attempt = () => {
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ block: 'start' });
                return;
            }
            if (tries++ < 40) raf = requestAnimationFrame(attempt);
        };
        attempt();
        return () => cancelAnimationFrame(raf);
    }, [pathname, hash]);

    return null;
};

const Layout = () => (
    // Плеер живёт над роутером: один <audio> на весь сайт, поэтому запись
    // не обрывается при переходе между страницами.
    <PlayerProvider>
        <a className="skip-link" href="#main">
            К содержанию
        </a>
        <ScrollManager />
        <Header />
        <PageTransition />
        <main id="main" className="content" tabIndex={-1}>
            <Suspense fallback={null}>
                <Outlet />
            </Suspense>
        </main>
        <Footer />
        <StickyCta />
        <PlayerDock />
    </PlayerProvider>
);

export default Layout;
