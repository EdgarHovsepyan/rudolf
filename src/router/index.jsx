/* eslint-disable react-refresh/only-export-components -- файл роутера экспортирует конфиг, не компонент */
import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home.jsx';

const AboutPage = lazy(() => import('../pages/AboutPage.jsx'));
const GalleryPage = lazy(() => import('../pages/GalleryPage.jsx'));

// На GitHub Pages сайт живёт в подпапке (/rudolf/): basename берём из BASE_URL сборки
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

const router = createBrowserRouter(
    [
        {
            element: <Layout />,
            children: [
                { path: '/', element: <Home /> },
                { path: '/about', element: <AboutPage /> },
                { path: '/gallery', element: <GalleryPage /> },
                // Старый маршрут: программа выступлений теперь живёт на главной
                { path: '/performances', element: <Navigate to="/#occasions" replace /> },
                { path: '*', element: <Navigate to="/" replace /> },
            ],
        },
    ],
    { basename },
);

export default router;
