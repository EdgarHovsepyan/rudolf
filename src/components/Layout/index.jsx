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

    /* Прокруткой в SPA распоряжается приложение, а не браузер. Иначе так:
       страницы грузятся лениво, документ на миг схлопывается, а когда контент
       появился и высота выросла, браузер возвращает прежнее смещение — переход
       из подвала открывал новую страницу сразу в её конце. */
    useEffect(() => {
        if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    }, []);

    useEffect(() => {
        if (!hash) {
            const toTop = () => window.scrollTo({ top: 0, behavior: 'instant' });
            toTop();
            // Удерживаем верх, пока ленивая страница монтируется и высота скачет.
            // Предел задаём во ВРЕМЕНИ, а не в кадрах: на слабом устройстве кадры
            // идут редко, и счётчик кадров растянул бы удержание на секунды.
            // Как только человек сам тронул прокрутку — сразу отпускаем.
            const deadline = performance.now() + 700;
            let raf = 0;
            let released = false;
            const release = () => {
                released = true;
            };
            const hold = () => {
                if (released) return;
                if (window.scrollY !== 0) toTop();
                if (performance.now() < deadline) raf = requestAnimationFrame(hold);
            };
            raf = requestAnimationFrame(hold);
            const opts = { passive: true, once: true };
            window.addEventListener('wheel', release, opts);
            window.addEventListener('touchstart', release, opts);
            window.addEventListener('keydown', release, opts);
            return () => {
                cancelAnimationFrame(raf);
                window.removeEventListener('wheel', release);
                window.removeEventListener('touchstart', release);
                window.removeEventListener('keydown', release);
            };
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
