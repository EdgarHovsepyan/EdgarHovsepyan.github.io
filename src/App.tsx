import { Preloader } from './components/effects/Preloader.tsx';
import { Background } from './components/effects/Background.tsx';
import { CursorSpotlight } from './components/effects/CursorSpotlight.tsx';
import { Grain } from './components/effects/Grain.tsx';
import { ScrollProgress } from './components/effects/ScrollProgress.tsx';
import { CustomCursor } from './components/effects/CustomCursor.tsx';
import { SideRails } from './components/layout/SideRails.tsx';
import { Nav } from './components/layout/Nav.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { Hero } from './components/sections/Hero.tsx';
import { StatsBand } from './components/sections/StatsBand.tsx';
import { Marquee } from './components/sections/Marquee.tsx';
import { Profile } from './components/sections/Profile.tsx';
import { Awards } from './components/sections/Awards.tsx';
import { Timeline } from './components/sections/Timeline.tsx';
import { Work } from './components/sections/Work.tsx';
import { Games } from './components/sections/Games.tsx';
import { ExtraStudio } from './components/sections/ExtraStudio.tsx';
import { ShaderBand } from './components/sections/ShaderBand.tsx';
import { Expertise } from './components/sections/Expertise.tsx';
import { Resume } from './components/sections/Resume.tsx';
import { Contact } from './components/sections/Contact.tsx';

export function App() {
  return (
    <>
      <Preloader />
      <Background />
      <CursorSpotlight />
      <Grain />
      <ScrollProgress />
      <CustomCursor />
      <SideRails />
      <Nav />
      <main>
        <Hero />
        <StatsBand />
        <Marquee />
        <Profile />
        <Awards />
        <Timeline />
        <Work />
        <Games />
        <ExtraStudio />
        <ShaderBand />
        <Expertise />
        <Resume />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
