import { useCallback, useState } from "react";
import { useTheme } from "./hooks/useTheme";
import { useLenis } from "./hooks/useLenis";
import { useHeroWorkSnap } from "./hooks/useHeroWorkSnap";
import Cursor from "./components/Cursor";
import Navbar from "./components/Navbar";
import Hero from "./components/hero/Hero";
import HorizontalPortfolio from "./components/portfolio/HorizontalPortfolio";
import SketchfabSection from "./components/sketchfab/SketchfabSection";
import About from "./components/about/About";
import Reviews from "./components/reviews/Reviews";
import Commission from "./components/commission/Commission";
import Contact from "./components/contact/Contact";
import Footer from "./components/Footer";
import ScrollProgress from "./components/ScrollProgress";
// import MusicToggle from "./components/MusicToggle"; // music disabled for now
import Mascot from "./components/mascot/Mascot";
import Preloader from "./components/Preloader";
import ToolsMarquee from "./components/ToolsMarquee";

export default function App() {
  const { theme, toggle } = useTheme();
  const [heroReady, setHeroReady] = useState(false);
  const [heroProgress, setHeroProgress] = useState(0);
  const handleHeroReady = useCallback(() => setHeroReady(true), []);
  const handleHeroProgress = useCallback((value: number) => {
    setHeroProgress((current) => Math.max(current, value));
  }, []);
  useLenis();
  useHeroWorkSnap();

  return (
    <div className="grain relative min-h-screen overflow-clip">
      {/* single fixed backdrop shared by every section (seamless scrolling) */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-50">
        <div className="absolute inset-0" style={{ background: "var(--bg)" }} />
        <div className="absolute left-[6%] top-[18%] h-[42vmax] w-[42vmax] rounded-full bg-[radial-gradient(circle,rgba(193,104,92,0.07),transparent_60%)] blur-3xl" />
        <div className="absolute right-[4%] top-[58%] h-[38vmax] w-[38vmax] rounded-full bg-[radial-gradient(circle,rgba(191,166,136,0.06),transparent_60%)] blur-3xl" />
      </div>

      <Preloader ready={heroReady} progress={heroProgress} />
      <Cursor />
      <ScrollProgress />
      <Navbar theme={theme} onToggleTheme={toggle} />

      <main>
        <Hero onReady={handleHeroReady} onProgress={handleHeroProgress} />
        <HorizontalPortfolio />
        <ToolsMarquee />
        <SketchfabSection />
        <About />
        <Reviews />
        <Commission />
        <Contact />
      </main>

      <Footer />
      {/* <MusicToggle /> */}
      <Mascot />
    </div>
  );
}
