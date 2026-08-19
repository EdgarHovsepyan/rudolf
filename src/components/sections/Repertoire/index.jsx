import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { repertoire } from '../../../content/site';
import './style.scss';

const Repertoire = () => (
    <section id="repertoire" className="section repertoire" aria-labelledby="repertoire-title">
        <div className="container">
            <div className="section-head reveal">
                <h2 id="repertoire-title">{repertoire.title}</h2>
                <p>{repertoire.lead}</p>
            </div>

            <p className="repertoire__label reveal">В моём исполнении прозвучат хиты:</p>
            <ul className="repertoire__lineup reveal" role="list" aria-label="Артисты, чьи песни звучат в программе">
                {repertoire.artists.map((name) => (
                    <li key={name}>{name}</li>
                ))}
                <li className="repertoire__more">{repertoire.moreLabel}</li>
            </ul>

            <div className="repertoire__foot reveal">
                <div className="repertoire__classical">
                    <h3>{repertoire.classical.title}</h3>
                    <p>{repertoire.classical.text}</p>
                    <Link className="arrow-link" to="/about#repertoire">
                        {repertoire.classical.linkLabel}
                        <FiArrowRight aria-hidden="true" />
                    </Link>
                </div>
                <div className="repertoire__custom">
                    <h3>Песни под ваши пожелания</h3>
                    <p>
                        Пришлите список любимых песен или просто опишите настроение вечера: соберу программу под ваших гостей и
                        площадку.
                    </p>
                </div>
            </div>
        </div>
    </section>
);

export default Repertoire;
