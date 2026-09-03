import { useEffect, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";

const BOOT_LINES = [
  "mkOS BIOS v1.0",
  "memory check ........ ok",
  "loading portfolio.sys",
  "mounting /work /about /order",
  "starting crt driver",
];

/** CRT boot screen that stays up until the hero model has rendered. */
export default function Preloader({ ready }: { ready: boolean }) {
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);
  const startedAt = useRef(performance.now());
  const { progress } = useProgress();

  useEffect(() => {
    const lineTimer = setInterval(() => {
      setShown((n) => {
        if (n >= BOOT_LINES.length) {
          clearInterval(lineTimer);
          return n;
        }
        return n + 1;
      });
    }, 260);
    return () => clearInterval(lineTimer);
  }, []);

  useEffect(() => {
    const next = ready ? 100 : Math.min(progress, 95);
    setDisplayProgress((current) => Math.max(current, next));
  }, [progress, ready]);

  useEffect(() => {
    if (!ready) return;
    const minimumBootTime = 900;
    const delay = Math.max(0, minimumBootTime - (performance.now() - startedAt.current));
    const timer = window.setTimeout(() => setDone(true), delay);
    return () => window.clearTimeout(timer);
  }, [ready]);

  useEffect(() => {
    if (!done) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setGone(true), reduceMotion ? 0 : 550);
    return () => window.clearTimeout(timer);
  }, [done]);

  // Prevent scrolling or interacting with the page before the hero is usable.
  useEffect(() => {
    if (gone) return;
    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, [gone]);

  if (gone) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Loading portfolio: ${Math.round(displayProgress)}%`}
      className={`fixed inset-0 z-[80] grid place-items-center bg-[#0f0c0a] transition-opacity duration-500 ${
        done ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="w-72 font-mono text-xs leading-6 text-[#bfa688] sm:w-80">
        {BOOT_LINES.slice(0, shown).map((l) => (
          <p key={l}>&gt; {l}</p>
        ))}
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-[0.18em]">
            <span>{ready ? "system ready" : "loading 3d assets"}</span>
            <span>{Math.round(displayProgress)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden border border-[#bfa688]/45">
            <div
              className="h-full bg-[#c1685c] transition-[width] duration-300 ease-out"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
        </div>
        {!ready && <span className="mt-4 inline-block h-4 w-2.5 animate-pulse bg-[#c1685c]" />}
      </div>
      {/* faint scanlines for the CRT feel */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_3px] opacity-40" />
    </div>
  );
}
