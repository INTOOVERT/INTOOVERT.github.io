import { useEffect, useRef, useState } from "react";

/**
 * Custom cursor inspired by juxtopposed's playful pointer work:
 * a precise dot + a soft trailing ring that lerps behind it and swells when
 * hovering interactive elements. Disabled on touch / coarse pointers.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);
    document.body.classList.add("custom-cursor-active");

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: target.x, y: target.y };
    let hovering = false;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      const el = e.target as HTMLElement;
      const interactive = !!el.closest(
        "a, button, [data-cursor='hover'], input, textarea, .sketchfab-frame"
      );
      if (interactive !== hovering) {
        hovering = interactive;
        ringRef.current?.classList.toggle("cursor-ring--hover", hovering);
      }
    };

    const loop = () => {
      ring.x += (target.x - ring.x) * 0.18;
      ring.y += (target.y - ring.y) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onDown = () => ringRef.current?.classList.add("cursor-ring--down");
    const onUp = () => ringRef.current?.classList.remove("cursor-ring--down");

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.body.classList.remove("custom-cursor-active");
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <style>{`
        .cursor-dot, .cursor-ring {
          position: fixed; top: 0; left: 0; z-index: 9999; pointer-events: none;
          border-radius: 9999px; will-change: transform; mix-blend-mode: difference;
        }
        .cursor-dot {
          width: 6px; height: 6px; margin: -3px 0 0 -3px; background: #fff;
        }
        .cursor-ring {
          width: 38px; height: 38px; margin: -19px 0 0 -19px;
          border: 1px solid rgba(255,255,255,0.6);
          transition: width .25s ease, height .25s ease, margin .25s ease, background .25s ease, border-color .25s ease;
        }
        .cursor-ring--hover {
          width: 64px; height: 64px; margin: -32px 0 0 -32px;
          background: rgba(193,104,92,0.16); border-color: rgba(215,139,126,0.85);
        }
        .cursor-ring--down { width: 26px; height: 26px; margin: -13px 0 0 -13px; }
      `}</style>
      <div ref={ringRef} className="cursor-ring" />
      <div ref={dotRef} className="cursor-dot" />
    </>
  );
}
