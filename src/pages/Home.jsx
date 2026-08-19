import { useRef } from 'react';
import Hero from '../components/Hero';
import Intro from '../components/sections/Intro';
import Occasions from '../components/sections/Occasions';
import VideoBand from '../components/sections/VideoBand';
import Repertoire from '../components/sections/Repertoire';
import Videos from '../components/sections/Videos';
import AboutShort from '../components/sections/AboutShort';
import GalleryPreview from '../components/sections/GalleryPreview';
import Contact from '../components/sections/Contact';
import useReveal from '../hooks/useReveal';
import useSectionMotion from '../hooks/useSectionMotion';

const Home = () => {
    const scope = useRef(null);
    useReveal();
    useSectionMotion(scope);
    return (
        <div ref={scope}>
            <Hero />
            <Intro />
            <Occasions />
            <VideoBand />
            <Repertoire />
            <Videos />
            <AboutShort />
            <GalleryPreview />
            <Contact />
        </div>
    );
};

export default Home;
