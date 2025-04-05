import React from 'react';
import './style.scss';

const PerformanceCard = ({ data }) => (
    <div className="card">
        <div className="card__border"></div>
        <div className="card_title__container">
            <span className="card_title">{data.title}</span>
            <p className="card_paragraph">{data.paragraph}</p>
        </div>
        <hr className="line" />
        <ul className="card__list">
            {data.items.map((item, index) => (
                <li key={index} className="card__list_item">
          <span className="check">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="check_svg">
              <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
            </svg>
          </span>
                    <span className="list_text">{item}</span>
                </li>
            ))}
        </ul>
        <button className="button">{data.buttonText}</button>
    </div>
);

export default PerformanceCard;
