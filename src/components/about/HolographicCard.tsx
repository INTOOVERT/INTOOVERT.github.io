import { useRef } from "react";
import ForceShield from "../shared/ForceShield";

/** Max tilt in degrees; card rotates opposite to pointer movement. */
const MAX_TILT = 22.4;

/**
 * Holographic foil card with strong counter-rotation and a persistent force shield.
 */
export default function HolographicCard() {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    // normalised pointer delta from centre (-1 .. 1)
    const nx = (px - 0.5) * 2;
    const ny = (py - 0.5) * 2;

    el.style.setProperty("--mx", `${(px * 100).toFixed(2)}%`);
    el.style.setProperty("--my", `${(py * 100).toFixed(2)}%`);
    el.style.setProperty("--posx", `${(50 + (px - 0.5) * 130).toFixed(2)}%`);
    el.style.setProperty("--posy", `${(50 + (py - 0.5) * 130).toFixed(2)}%`);
    // rotate opposite to mouse: move right → card tilts left, move down → card tilts up
    el.style.setProperty("--rx", `${(-ny * MAX_TILT).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(-nx * MAX_TILT).toFixed(2)}deg`);
    el.style.setProperty("--rz", `${(-nx * ny * 4.8).toFixed(2)}deg`);
    el.style.setProperty("--o", "1");
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");
    el.style.setProperty("--posx", "50%");
    el.style.setProperty("--posy", "50%");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rz", "0deg");
    el.style.setProperty("--o", "0");
  };

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-3 -z-10 rounded-3xl bg-gradient-to-br from-accent/40 to-accent-cyan/30 opacity-50 blur-2xl" />
      <div
        ref={ref}
        className="holo-card holo-card--strong"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        <div className="relative overflow-hidden rounded-3xl glass p-2">
          <img
            src="/media/portrait.png"
            alt="Hand-drawn pixel-grid self portrait by Muhtasim Khan"
            loading="lazy"
            className="aspect-square w-full rounded-2xl object-cover"
            style={{ filter: "contrast(1.08) saturate(0.9)" }}
          />
          <div className="pointer-events-none absolute inset-2 rounded-2xl bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_4px] opacity-40" />
          <div className="holo-card__shine" />
          <div className="holo-card__glare" />
          <ForceShield
            color="#c1685c"
            persistent
            scale={1.26}
            cameraZ={4.35}
            className="pointer-events-auto absolute inset-2 z-20 overflow-hidden rounded-2xl"
          />
        </div>
      </div>
      <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.25em] opacity-50">
        Hand-drawn pixel study · 2019
      </p>
    </div>
  );
}
