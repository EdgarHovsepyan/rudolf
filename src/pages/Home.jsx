import Hero from '../components/Hero';
import Intro from '../components/sections/Intro';
import Occasions from '../components/sections/Occasions';
import Repertoire from '../components/sections/Repertoire';
import Videos from '../components/sections/Videos';
import AboutShort from '../components/sections/AboutShort';
import GalleryPreview from '../components/sections/GalleryPreview';
import Contact from '../components/sections/Contact';
import useReveal from '../hooks/useReveal';

const Home = () => {
    useReveal();
    return (
        <>
            <Hero />
            <Intro />
            <Occasions />
            <Repertoire />
            <Videos />
            <AboutShort />
            <GalleryPreview />
            <Contact />
        </>
    );
};

export default Home;
