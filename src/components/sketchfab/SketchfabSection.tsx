import { useEffect, useRef, useState } from "react";
import { sketchfabProjects } from "../../data/projects";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import ShaderBackground from "./ShaderBackground";
import LazySketchfab from "./LazySketchfab";

export default function SketchfabSection() {
  const ref = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), {
      rootMargin: "200px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="live3d"
      ref={ref}
      className="relative overflow-hidden py-28 md:py-36"
    >
      <div className="absolute inset-0 -z-10 opacity-90">
        <ShaderBackground active={near} />
      </div>
      {/* soften the shader edges into the shared page backdrop */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[color:var(--bg)] via-transparent to-[color:var(--bg)]" />

      <div className="container-px mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Interactive · Real-time"
          title="Inspect the models live"
          description="A few pieces are shared as real-time Sketchfab embeds. Orbit, zoom and inspect topology and PBR materials right in the browser. Loaded on demand to keep things fast."
        />

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {sketchfabProjects.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
              <LazySketchfab project={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
