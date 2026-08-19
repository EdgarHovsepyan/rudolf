import { FaWhatsapp } from 'react-icons/fa6';
import { occasions, contacts } from '../../../content/site';
import './style.scss';

const Occasions = () => (
    <section id="occasions" className="section occasions" aria-labelledby="occasions-title">
        <div className="container occasions__grid">
            <div className="occasions__intro reveal">
                <h2 id="occasions-title">{occasions.title}</h2>
                <p className="lead">{occasions.lead}</p>
                <a className="btn btn--primary" href={contacts.whatsapp} target="_blank" rel="noopener">
                    <FaWhatsapp aria-hidden="true" />
                    Узнать о свободных датах
                </a>
            </div>

            <ul className="occasions__list reveal" role="list">
                {occasions.items.map((item) => (
                    <li key={item.name} className={`occasions__item${item.featured ? ' is-featured' : ''}`}>
                        <h3>
                            {item.name}
                            {item.featured && <span className="occasions__tag">сезон</span>}
                        </h3>
                        <p>{item.note}</p>
                    </li>
                ))}
            </ul>
        </div>
    </section>
);

export default Occasions;
