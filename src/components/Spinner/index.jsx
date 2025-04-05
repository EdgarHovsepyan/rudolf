import React from 'react';
import './style.scss';

const Spinner = () => (
    <div className="loader">
        <div className="spinner">
            <div className="box">
                <div className="logo" />
            </div>
            <div className="box"></div>
            <div className="box"></div>
            <div className="box"></div>
            <div className="box"></div>
        </div>
    </div>
);

export default Spinner;
