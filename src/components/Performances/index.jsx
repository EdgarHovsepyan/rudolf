import React from 'react';
import PerformanceCard from './PerformanceCard.jsx';
import './style.scss';

const performancesData = [
    {
        id: 1,
        title: "Exclusive Concert",
        paragraph: "Experience an intimate evening with Rudolf Hovsepyan performing timeless classics.",
        items: ["Live Performance", "Acoustic Set", "Q&A Session", "VIP Seating"],
        buttonText: "Buy Tickets"
    },
    {
        id: 2,
        title: "Intimate Recital",
        paragraph: "A solo performance showcasing Rudolf's vocal mastery in a cozy setting.",
        items: ["Solo Performance", "Interactive Session", "Exclusive Insights", "Meet & Greet"],
        buttonText: "Reserve Seat"
    },
    {
        id: 3,
        title: "Masterclass",
        paragraph: "Learn the secrets of classical music from a true maestro.",
        items: ["Expert Guidance", "Q&A Session", "Personalized Feedback", "Certificate"],
        buttonText: "Register Now"
    },
    {
        id: 4,
        title: "Acoustic Evening",
        paragraph: "Unplug and unwind with a soulful, acoustic performance.",
        items: ["Unplugged Performance", "Storytelling", "Audience Interaction", "After Party"],
        buttonText: "Buy Tickets"
    },
    {
        id: 5,
        title: "Charity Concert",
        paragraph: "A special event to support community projects with Rudolf's live performance.",
        items: ["Live Performance", "Community Engagement", "Special Guests", "Exclusive Merchandise"],
        buttonText: "Donate & Attend"
    },
    {
        id: 6,
        title: "Festival Showcase",
        paragraph: "Join Rudolf at the annual music festival featuring a dynamic performance.",
        items: ["Festival Highlight", "Collaborative Performance", "Interactive Experience", "After Show Party"],
        buttonText: "Get Tickets"
    }
];

const Performances = () => (
    <section id="performances" className="performances">
        <h2>Upcoming Performances</h2>
        <div className="card-grid">
            {performancesData.map(item => (
                <PerformanceCard key={item.id} data={item} />
            ))}
        </div>
    </section>
);

export default Performances;
