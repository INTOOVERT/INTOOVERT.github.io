import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, AdaptiveDpr, Preload } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import RetroComputer, { heroFocus, portraitFactor } from "./RetroComputer";
import { createScreenTexture } from "./screenTexture";
import type { TerminalAction } from "./screenTexture";
import { ArrowIcon } from "../Icons";
import { getLenis } from "../../hooks/useLenis";

function go(id: string) {
  const el = document.getElementById(id);
  const lenis = getLenis();
  if (el && lenis) lenis.scrollTo(el, { offset: -10 });
  else el?.scrollIntoView({ behavior: "smooth" });
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Screen-fill zoom -> full-model reveal, driven by scroll through the hero. */
const CLOSE_Z = 1.85; // camera distance when zoomed into the screen
const FULL_Z = 7.1; // camera distance with the whole computer revealed
const REVEAL_LOOK_UP = 0.7; // look above centre so the model sits lower in frame

function heroProgress(hero: HTMLElement | null) {
  if (!hero) return 0;
  const vh = window.innerHeight || 1;
  const range = Math.max(1, hero.offsetHeight - vh);
  return Math.min(1, Math.max(0, (window.scrollY - hero.offsetTop) / range));
}

function ScrollRig({ heroRef }: { heroRef: React.RefObject<HTMLElement | null> }) {
  const { camera } = useThree();
  const prog = useRef(0);

  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.05);
    const target = heroProgress(heroRef.current);
    prog.current = THREE.MathUtils.damp(prog.current, target, 6, dt);
    const e = smoothstep(0, 1, prog.current);

    // portrait phones need extra camera distance so the (rolled) screen and
    // later the full model fit the narrow viewport (edh.dev portraitOffset)
    const portrait = portraitFactor(_state.size.width, _state.size.height);
    const z = THREE.MathUtils.lerp(CLOSE_Z + portrait * 0.75, FULL_Z + portrait * 2.2, e);
    const lookY = THREE.MathUtils.lerp(heroFocus.screenY, heroFocus.modelY + REVEAL_LOOK_UP, e);
    // while rolled, the screen drifts off-centre on X; follow it, then let go
    const lookX = heroFocus.screenX * (1 - e);

    const px = _state.pointer.x;
    const py = _state.pointer.y;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, lookX + px * 0.4 * e, 5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, lookY - py * 0.18 * e, 6, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, z, 6, dt);
    camera.lookAt(lookX, lookY, 0);
  });

  return null;
}

function isTypingTarget(el: EventTarget | null) {
  const node = el as HTMLElement | null;
  if (!node) return false;
  return (
    node.tagName === "INPUT" ||
    node.tagName === "TEXTAREA" ||
    node.tagName === "SELECT" ||
    node.isContentEditable
  );
}

export default function Hero({ onReady }: { onReady: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLButtonElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  // interactive terminal rendered onto the CRT screen
  const screen = useMemo(
    () =>
      createScreenTexture((action: TerminalAction) => {
        if (action.type === "goto") go(action.id);
        else if (action.type === "open") window.open(action.url, "_blank", "noopener");
      }),
    []
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => setVisible(en.isIntersecting), {
      threshold: 0.01,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // route keystrokes into the terminal while the hero is on screen
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      // only capture while the screen is reasonably in view (start of hero)
      if (heroProgress(ref.current) > 0.5) return;
      if (screen.handleKey(e)) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, screen]);

  // Overlay fade + exit vignette (section snap handled by useHeroWorkSnap).
  // Runs on scroll (rAF-coalesced) instead of a permanent animation loop.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const hero = ref.current;
      const p = heroProgress(hero);
      const reveal = smoothstep(0.12, 0.6, p);
      const fade = smoothstep(0.55, 1.0, p);

      if (overlayRef.current) {
        overlayRef.current.style.opacity = `${reveal}`;
        overlayRef.current.style.transform = `translateY(${(1 - reveal) * 24}px)`;
      }
      if (cueRef.current) {
        cueRef.current.style.opacity = `${1 - smoothstep(0, 0.28, p)}`;
      }
      if (vignetteRef.current) {
        vignetteRef.current.style.opacity = `${fade}`;
      }
    };
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
    <section ref={ref} id="top" className="relative h-[220svh] text-white">
      {/* sticky stage: stays pinned while you scroll through the hero */}
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* ambient gradient + glow blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(193,104,92,0.14),transparent_60%)] blur-2xl" />
          <div className="absolute right-[10%] top-[15%] h-[28vmax] w-[28vmax] rounded-full bg-[radial-gradient(circle,rgba(191,166,136,0.11),transparent_60%)] blur-2xl" />
          <div className="absolute bottom-[5%] left-[8%] h-[26vmax] w-[26vmax] rounded-full bg-[radial-gradient(circle,rgba(242,233,216,0.06),transparent_60%)] blur-2xl" />
        </div>

        <Canvas
          className="absolute inset-0"
          dpr={[1, 1.5]}
          camera={{ position: [0, 1, CLOSE_Z], fov: 42 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          frameloop={visible ? "always" : "never"}
        >
          <color attach="background" args={["#F2D5BB"]} />
          <ambientLight intensity={1} />

          <ScrollRig heroRef={ref} />

          <Suspense fallback={null}>
            <Float speed={1.1} rotationIntensity={0.1} floatIntensity={0.3}>
              <RetroComputer screen={screen} onReady={onReady} />
            </Float>
            <Preload all />
          </Suspense>

          <EffectComposer multisampling={0}>
            <Bloom
              intensity={0.85}
              luminanceThreshold={0.7}
              luminanceSmoothing={0.3}
              mipmapBlur
              radius={0.65}
            />
            <Vignette eskil={false} offset={0.25} darkness={0.85} />
          </EffectComposer>
          <AdaptiveDpr pixelated />
        </Canvas>

        {/* overlay: CTAs only (copy lives on the CRT screen) */}
        <div className="pointer-events-none absolute inset-0 flex flex-col">
          <div
            ref={overlayRef}
            className="container-px mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end py-24"
            style={{ opacity: 0 }}
          >
            <div className="pointer-events-auto mb-4 flex">
              <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs tracking-wide">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-glow opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-glow" />
                </span>
                Available for commissions
              </span>
            </div>
            <div className="pointer-events-auto flex flex-wrap gap-3">
              <button
                onClick={() => go("work")}
                data-cursor="hover"
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white shadow-glow transition hover:bg-accent-glow"
              >
                View work
                <ArrowIcon className="h-4 w-4 transition group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => go("order")}
                data-cursor="hover"
                className="rounded-full px-6 py-3 text-sm font-medium ring-1 ring-white/20 transition hover:bg-white/5"
              >
                Commission me
              </button>
            </div>
          </div>
        </div>

        {/* scroll-out vignette: eases the beige hero into the page background */}
        <div
          ref={vignetteRef}
          className="pointer-events-none absolute inset-0 z-[5] opacity-0"
          style={{
            background: [
              "radial-gradient(ellipse 130% 90% at 50% 105%, color-mix(in srgb, var(--bg) 95%, transparent) 0%, transparent 58%)",
              "linear-gradient(to bottom, transparent 35%, color-mix(in srgb, var(--bg) 55%, transparent) 72%, color-mix(in srgb, var(--bg) 92%, transparent) 100%)",
            ].join(", "),
          }}
        />

        {/* scroll cue + terminal hint */}
        <button
          ref={cueRef}
          onClick={() => window.scrollBy({ top: window.innerHeight, behavior: "smooth" })}
          data-cursor="hover"
          className="pointer-events-auto absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] opacity-80"
        >
          <span className="hidden font-mono normal-case tracking-normal opacity-70 md:block">
            ⌨ type <span className="text-accent-glow">help</span> on the screen
          </span>
          Scroll to reveal
          <span className="relative block h-10 w-px overflow-hidden bg-white/20">
            <span className="absolute inset-x-0 top-0 h-4 animate-[float_1.6s_ease-in-out_infinite] bg-accent-glow" />
          </span>
        </button>
      </div>
    </section>
  );
}
