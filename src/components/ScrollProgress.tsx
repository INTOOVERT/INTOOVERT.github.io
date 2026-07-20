import { useEffect, useRef } from "react";

/** Slim gradient progress bar fixed to the top of the viewport. */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? h.scrollTop / max : 0;
      if (ref.current) ref.current.style.transform = `scaleX(${p})`;
    };
    // event-driven with rAF coalescing (instead of a permanent rAF loop)
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[70] h-[2px] bg-transparent">
      <div
        ref={ref}
        className="h-full origin-left scale-x-0 bg-gradient-to-r from-accent via-accent-glow to-accent-cyan"
      />
    </div>
  );
}
