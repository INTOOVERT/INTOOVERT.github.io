import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "./useLenis";

const SNAP_DURATION = 1.0;
const SETTLE_MS = 140;

/** Smooth ease-in-out for section hand-offs. */
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function heroProgress(hero: HTMLElement) {
  const vh = window.innerHeight || 1;
  const range = Math.max(1, hero.offsetHeight - vh);
  return Math.min(1, Math.max(0, (window.scrollY - hero.offsetTop) / range));
}

function heroSnapY(hero: HTMLElement) {
  const vh = window.innerHeight || 1;
  const range = Math.max(1, hero.offsetHeight - vh);
  return hero.offsetTop + range * 0.86;
}

function workAtStart() {
  const st = ScrollTrigger.getById("work-pin");
  return !st || st.progress < 0.02;
}

/**
 * Magnetic snap between the hero exit (vignette zone) and the portfolio pin.
 * Waits for scroll to settle, then glides with a short eased animation in
 * both directions: hero to work and work back to hero.
 */
export function useHeroWorkSnap() {
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let animating = false;
    let lastY = window.scrollY;
    let scrollDir = 0;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;
    let zone: "hero" | "work" | "between" = "hero";

    const smoothTo = (y: number, next: "hero" | "work") => {
      if (animating) return;
      const lenis = getLenis();
      if (!lenis) return;

      animating = true;
      lenis.scrollTo(y, {
        duration: SNAP_DURATION,
        easing: easeInOutCubic,
        onComplete: () => {
          animating = false;
          zone = next;
        },
      });
      // safety: never leave the flag stuck if lenis drops the animation
      // (e.g. the user grabs the scrollbar mid-glide)
      setTimeout(() => {
        animating = false;
      }, SNAP_DURATION * 1000 + 250);
    };

    const evaluate = () => {
      if (animating) return;

      const hero = document.getElementById("top");
      const work = document.getElementById("work");
      if (!hero || !work) return;

      const y = window.scrollY;
      const vh = window.innerHeight || 1;
      const p = heroProgress(hero);
      const wTop = work.offsetTop;
      const hSnap = heroSnapY(hero);
      const fade = p >= 0.55 ? (p - 0.55) / 0.45 : 0;

      // hero vignette zone → glide into portfolio
      if (
        zone !== "work" &&
        fade > 0.12 &&
        p < 0.995 &&
        y < wTop - vh * 0.08 &&
        scrollDir >= 0
      ) {
        smoothTo(wTop, "work");
        return;
      }

      // top of portfolio, first panel → glide back to hero exit pose
      if (
        zone !== "hero" &&
        y <= wTop + vh * 0.14 &&
        workAtStart() &&
        scrollDir < 0
      ) {
        smoothTo(hSnap, "hero");
      }
    };

    const onScroll = () => {
      const y = window.scrollY;
      scrollDir = y - lastY;
      lastY = y;

      const hero = document.getElementById("top");
      const work = document.getElementById("work");
      if (hero && work) {
        const p = heroProgress(hero);
        if (p < 0.45) zone = "hero";
        else if (window.scrollY >= work.offsetTop - 20) zone = "work";
        else zone = "between";
      }

      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(evaluate, SETTLE_MS);
    };

    const lenis = getLenis();
    if (lenis) lenis.on("scroll", onScroll);
    else window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (settleTimer) clearTimeout(settleTimer);
      if (lenis) lenis.off("scroll", onScroll);
      else window.removeEventListener("scroll", onScroll);
    };
  }, []);
}
