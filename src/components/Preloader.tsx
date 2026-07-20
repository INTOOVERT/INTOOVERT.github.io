import { useEffect, useState } from "react";

const BOOT_LINES = [
  "mkOS BIOS v1.0",
  "memory check ........ ok",
  "loading portfolio.sys",
  "mounting /work /about /order",
  "starting crt driver",
];

/**
 * CRT-style boot preloader: types a few BIOS lines while the heavy 3D assets
 * warm up, then fades away. Never blocks longer than ~2.2s.
 */
export default function Preloader() {
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setGone(true);
      return;
    }
    const lineTimer = setInterval(() => {
      setShown((n) => {
        if (n >= BOOT_LINES.length) {
          clearInterval(lineTimer);
          return n;
        }
        return n + 1;
      });
    }, 260);
    const doneTimer = setTimeout(() => setDone(true), 1700);
    const goneTimer = setTimeout(() => setGone(true), 2300);
    return () => {
      clearInterval(lineTimer);
      clearTimeout(doneTimer);
      clearTimeout(goneTimer);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[80] grid place-items-center bg-[#0f0c0a] transition-opacity duration-500 ${
        done ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="w-72 font-mono text-xs leading-6 text-[#bfa688]">
        {BOOT_LINES.slice(0, shown).map((l) => (
          <p key={l}>&gt; {l}</p>
        ))}
        <span className="mt-1 inline-block h-4 w-2.5 animate-pulse bg-[#c1685c]" />
      </div>
      {/* faint scanlines for the CRT feel */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_3px] opacity-40" />
    </div>
  );
}
