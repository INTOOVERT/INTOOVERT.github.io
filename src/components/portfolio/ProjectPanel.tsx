import { useEffect, useRef, useState } from "react";
import type { Project } from "../../data/projects";
import { ArrowIcon } from "../Icons";
import { getLenis } from "../../hooks/useLenis";
import ShieldOverlay from "./ShieldOverlay";

function VideoMedia({ project, active }: { project: Project; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [hover, setHover] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active || hover) {
      const p = v.play();
      if (p) p.catch(() => {});
    } else {
      v.pause();
    }
  }, [active, hover]);

  return (
    <div
      className="group relative h-full w-full overflow-hidden rounded-2xl"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: `radial-gradient(120% 120% at 50% 0%, ${project.accent}1a, transparent 55%), color-mix(in srgb, var(--fg) 4%, transparent)`,
      }}
    >
      <video
        ref={ref}
        className={`h-full w-full object-contain transition-[opacity,transform] duration-700 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${active ? "scale-100" : "scale-[0.98]"}`}
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedData={() => setLoaded(true)}
      >
        <source src={project.src} type="video/mp4" />
      </video>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/5 to-transparent" />
      )}
      {/* scanline / sheen overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.04)_50%)] bg-[length:100%_3px] opacity-30" />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-[color:var(--card-border)]" />
    </div>
  );
}

function SketchfabPreview({ project }: { project: Project }) {
  const go = () => {
    const el = document.getElementById("live3d");
    const lenis = getLenis();
    if (el && lenis) lenis.scrollTo(el, { offset: -10 });
    else el?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <button
      onClick={go}
      data-cursor="hover"
      className="group relative h-full w-full overflow-hidden rounded-2xl text-left"
      style={{
        background: `radial-gradient(120% 120% at 30% 20%, ${project.accent}2b, transparent 60%), color-mix(in srgb, var(--fg) 4%, transparent)`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-70">
          Interactive · Real-time
        </span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs">Sketchfab embed</span>
        <span className="inline-flex items-center gap-2 text-sm font-medium opacity-90 transition group-hover:gap-3">
          Inspect live model <ArrowIcon className="h-4 w-4" />
        </span>
      </div>
      <div
        className="pointer-events-none absolute -bottom-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: project.accent, opacity: 0.4 }}
      />
    </button>
  );
}

export default function ProjectPanel({
  project,
  active,
  reverse,
}: {
  project: Project;
  active: boolean;
  reverse: boolean;
}) {
  return (
    <article
      className="flex h-[100svh] w-[100vw] shrink-0 items-center justify-center px-5 pb-6 pt-24 md:w-[88vw] md:px-12 md:pb-0 md:pt-0"
      style={{
        background:
          "radial-gradient(120% 100% at 50% 0%, rgba(191,166,136,0.07), transparent 55%)",
      }}
    >
      <div
        className={`flex w-full max-w-6xl flex-col gap-5 md:items-center md:gap-14 ${
          reverse ? "md:flex-row-reverse" : "md:flex-row"
        }`}
      >
        {/* media: fixed viewport share on mobile so the panel always fits,
            classic 4:3 on desktop */}
        <div
          className={`relative h-[42svh] w-full transition-transform duration-700 md:aspect-[4/3] md:h-auto md:w-[58%] ${
            active ? "scale-100" : "scale-[0.96]"
          }`}
        >
          <div
            className="absolute -inset-4 -z-10 rounded-3xl opacity-50 blur-2xl transition duration-700"
            style={{ background: active ? project.accent + "55" : "transparent" }}
          />
          {project.type === "video" ? (
            <VideoMedia project={project} active={active} />
          ) : (
            <SketchfabPreview project={project} />
          )}
          {/* force-shield overlay on every project; tap to disintegrate and
              reveal the media (re-arms when the panel scrolls away) */}
          <ShieldOverlay key={project.id} accent={project.accent} active />
        </div>

        {/* info: slides in as its panel becomes active */}
        <div
          className={`transition-all duration-500 md:w-[42%] ${
            active ? "translate-y-0 opacity-100" : "translate-y-3 opacity-50"
          }`}
        >
          <div className="mb-3 flex items-center gap-3 md:mb-4">
            <span
              className={`font-mono text-4xl font-light leading-none transition-transform duration-500 md:text-5xl ${
                active ? "scale-100" : "scale-90"
              }`}
              style={{ color: project.accent }}
            >
              {project.index}
            </span>
            <span className="hairline h-px flex-1" />
            <span className="font-mono text-xs opacity-50">{project.year}</span>
          </div>

          <p className="eyebrow mb-2" style={{ color: project.accent }}>
            {project.category}
          </p>
          <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-4xl">
            {project.title}
          </h3>
          <p className="mt-3 max-w-md text-sm leading-relaxed opacity-70 md:mt-4">
            {project.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2 md:mt-6">
            {project.tools.map((tool) => (
              <span
                key={tool}
                className="card-surface rounded-full px-3 py-1 text-xs opacity-85"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
