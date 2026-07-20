import { useEffect, useRef, useState } from "react";
import type { Project } from "../../data/projects";

/** Renders the Sketchfab iframe only once it scrolls near the viewport. */
export default function LazySketchfab({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="sketchfab-frame group relative aspect-[4/3] w-full overflow-hidden rounded-2xl glass"
      data-cursor="hover"
    >
      <div
        className="pointer-events-none absolute -inset-px -z-10 rounded-2xl opacity-60 blur-xl"
        style={{ background: `radial-gradient(60% 60% at 50% 0%, ${project.accent}55, transparent)` }}
      />

      {inView && load ? (
        <>
          {!ready && (
            <div className="absolute inset-0 grid place-items-center">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-accent-glow" />
            </div>
          )}
          <iframe
            title={project.title}
            src={project.embedUrl}
            className="h-full w-full"
            frameBorder={0}
            allow="autoplay; fullscreen; xr-spatial-tracking"
            allowFullScreen
            loading="lazy"
            onLoad={() => setReady(true)}
          />
        </>
      ) : (
        <button
          onClick={() => setLoad(true)}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          style={{ background: `radial-gradient(120% 120% at 30% 10%, ${project.accent}22, transparent 60%), color-mix(in srgb, var(--fg) 4%, transparent)` }}
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-white/10 ring-1 ring-white/20 transition group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="h-6 w-6 translate-x-[1px]" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span className="text-sm font-medium">Load interactive model</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-50">
            Sketchfab · click to load
          </span>
        </button>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-4">
        <div>
          <p className="text-sm font-medium">{project.title}</p>
          <p className="text-xs opacity-60">{project.category}</p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest opacity-60">Live 3D</span>
      </div>
    </div>
  );
}
