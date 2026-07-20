import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "../../data/projects";
import { getLenis } from "../../hooks/useLenis";
import ProjectPanel from "./ProjectPanel";

gsap.registerPlugin(ScrollTrigger);

export default function HorizontalPortfolio() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const [enhanced, setEnhanced] = useState(false);

  const lastIndex = projects.length - 1;

  // jump straight to a given project (used by the progress dots)
  const goTo = (i: number) => {
    const st = stRef.current;
    if (!st) {
      // reduced-motion / native scroll fallback
      const panel = trackRef.current?.children[i];
      panel?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      return;
    }
    const target = st.start + (i / lastIndex) * (st.end - st.start);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target, { duration: 1 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  };

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // fall back to native horizontal swipe layout
    setEnhanced(true);

    const ctx = gsap.context(() => {
      const getScrollDistance = () => track.scrollWidth - window.innerWidth;

      const tween = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: "none",
        scrollTrigger: {
          id: "work-pin",
          trigger: section,
          start: "top top",
          end: () => `+=${getScrollDistance()}`,
          scrub: 0.5,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // gentle directional snap: settles onto the nearest project without
          // fighting the user mid-scroll
          snap: {
            snapTo: (value) => Math.round(value * lastIndex) / lastIndex,
            duration: { min: 0.15, max: 0.4 },
            delay: 0.08,
            ease: "power1.inOut",
            inertia: false,
          },
          onUpdate: (self) => {
            const idx = Math.round(self.progress * lastIndex);
            setActive((prev) => (prev === idx ? prev : idx));
          },
        },
      });

      stRef.current = tween.scrollTrigger ?? null;

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    }, section);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, [lastIndex]);

  return (
    <section id="work" ref={sectionRef} className="surface-1 relative">
      {/* section heading floats over the pinned area */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-20">
        <div className="container-px mx-auto flex max-w-7xl items-center justify-between pt-6 md:pt-8">
          <div>
            <p className="eyebrow">Selected Work</p>
            <h2 className="mt-1 hidden font-display text-xl font-medium opacity-90 md:block">
              Portfolio · click a dot to jump
            </h2>
          </div>
          <div className="pointer-events-auto flex items-center gap-1.5 font-mono text-xs opacity-70 md:gap-2 md:opacity-60">
            {projects.map((p, i) => (
              <button
                key={p.id}
                onClick={() => goTo(i)}
                data-cursor="hover"
                aria-label={`Go to project ${i + 1}: ${p.title}`}
                className="group flex h-8 items-center md:h-6"
              >
                <span
                  className={`h-1 rounded-full transition-all duration-300 group-hover:bg-accent-glow ${
                    i === active ? "w-6 bg-accent-glow md:w-8" : "hairline w-2.5 group-hover:w-5 md:w-3"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className={`flex ${
          enhanced ? "overflow-hidden" : "snap-x snap-mandatory overflow-x-auto"
        }`}
      >
        <div
          ref={trackRef}
          className={`flex flex-nowrap ${enhanced ? "will-change-transform" : "[&>*]:snap-center"}`}
        >
          {projects.map((p, i) => (
            <ProjectPanel
              key={p.id}
              project={p}
              active={i === active}
              reverse={i % 2 === 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
