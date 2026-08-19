import React from 'react';
import ReactDOM from 'react-dom/client';
// Глобальные стили раньше компонентов: токены и базовые правила должны стоять первыми в каскаде
import './styles/global.scss';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
