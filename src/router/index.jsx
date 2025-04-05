import React, {lazy} from 'react';
import {createBrowserRouter, Outlet} from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import Hero from '../components/Hero';
import Layout from "../components/Layout";

const About = lazy(() => import('../components/About'));
// const Contact = lazy(() => import('../components/Contact'));
const Gallery = lazy(() => import('../components/Gallery'));
const Performances = lazy(() => import('../components/Performances'));


const router = createBrowserRouter([
    {
        element: <Layout/>,
        children: [
            {
                path: '/',
                element: <Hero />,
            },
            {
                path: '/*',
                element: (
                    <PageTransition>
                        <Outlet/>
                    </PageTransition>
                ),
                children: [
                    {path: 'about', element: <About/>},
                    // {path: 'contact', element: <Contact/>},
                    {path: 'gallery', element: <Gallery/>},
                    {path: 'performances', element: <Performances/>},
                ],
            },
        ],
    },
]);

export default router;
