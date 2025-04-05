// Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from "../Header";
import Footer from "../Footer";
import AudioVisualizerComponent from "../AudioVisualizerComponent/index.jsx";

const Layout = () => {
    return (
        <div className="layout">
            <Header />
            <AudioVisualizerComponent />
            <main className="content">
                <Outlet />
            </main>
            {/*<Footer />*/}
        </div>
    );
};

export default Layout;
