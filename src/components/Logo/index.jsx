import React from 'react';
import "./styles.scss";
import {NavLink} from "react-router-dom";

const Logo = () => (
    <NavLink to="/"><span className="logo"/></NavLink>
);

export default Logo;