import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createShieldMaterial, MAX_HITS } from "../portfolio/shieldMaterial";

/**
 * "Pix": a tiny low-poly desk cat living in the bottom-right corner.
 * Idles with a slow sway, leans and wags when you scroll, and answers
 * with a talk bubble when clicked. Deliberately small and out of the way.
 *
 * The cat is procedural geometry (no UVs), so its look is controlled entirely
 * by the three colour constants below. To replace it with a hand-painted
 * model: export a UV-unwrapped cat as glb (with the texture embedded) to
 * public/models/mascot.glb and swap CatModel for a useGLTF primitive.
 */

const QUIPS = [
  "meow.",
  "hi, i'm Pix :3",
  "type `help` on the big screen!",
  "commission a cat model?",
  "keep scrolling, human",
  "i watched him model all of these",
];

// warm site palette: sand body, cocoa details, terracotta collar
const BODY = "#b5a289";
const DARK = "#7a6a56";
const COLLAR = "#c1685c";

/**
 * A small, faint force-shield bubble around the cat. Reuses the project
 * shield shader with everything toned down; clicking the cat also pings a
 * ripple on the bubble.
 */
function CatShield({ hitRef }: { hitRef: React.MutableRefObject<() => void> }) {
  const material = useMemo(() => {
    const m = createShieldMaterial(COLLAR);
    m.uniforms.uOpacity.value = 0.3;
    m.uniforms.uHexOpacity.value = 0.07;
    m.uniforms.uFresnelStrength.value = 1.1;
    m.uniforms.uFlowIntensity.value = 1.4;
    m.uniforms.uFlashIntensity.value = 0.05;
    m.uniforms.uHitIntensity.value = 2.4;
    m.uniforms.uReveal.value = 0; // always fully revealed
    return m;
  }, []);
  const group = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const hitIdx = useRef(0);

  useEffect(() => {
    hitRef.current = () => {
      const idx = hitIdx.current % MAX_HITS;
      hitIdx.current++;
      // random spot on the front hemisphere (geometry radius is 1.8)
      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * 1.4,
        (Math.random() - 0.5) * 1.4,
        1
      ).normalize();
      (material.uniforms.uHitPos.value[idx] as THREE.Vector3)
        .copy(dir)
        .multiplyScalar(1.8);
      material.uniforms.uHitTime.value[idx] = timeRef.current;
    };
  }, [hitRef, material]);

  useFrame((state, delta) => {
    timeRef.current = state.clock.elapsedTime;
    material.uniforms.uTime.value = timeRef.current;
    if (group.current) group.current.rotation.y += delta * 0.15;
  });

  return (
    <group ref={group} scale={0.75}>
      <mesh>
        <sphereGeometry args={[1.8, 32, 32]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

function CatModel({
  scrollVel,
  hopRef,
}: {
  scrollVel: React.MutableRefObject<number>;
  hopRef: React.MutableRefObject<() => void>;
}) {
  const root = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const eyeL = useRef<THREE.Mesh>(null);
  const eyeR = useRef<THREE.Mesh>(null);
  const hop = useRef(0);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    const vel = scrollVel.current;
    const g = root.current;
    if (!g) return;

    // idle sway + scroll reaction: lean into the scroll and squash a little
    const lean = THREE.MathUtils.clamp(vel * 0.0035, -0.55, 0.55);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, Math.sin(t * 0.45) * 0.35, 2, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, lean, 6, dt);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, -lean * 0.4, 6, dt);

    const squash = THREE.MathUtils.clamp(1 - Math.abs(vel) * 0.0006, 0.86, 1);
    g.scale.y = THREE.MathUtils.damp(g.scale.y, squash, 8, dt);

    // click hop
    hop.current = Math.max(0, hop.current - dt * 3.2);
    g.position.y = Math.sin(t * 1.3) * 0.05 + Math.sin(hop.current * Math.PI) * 0.35;

    // tail wags faster the harder you scroll
    if (tail.current) {
      const wag = 2 + Math.min(14, Math.abs(vel) * 0.02);
      tail.current.rotation.z = 0.5 + Math.sin(t * wag) * 0.35;
    }

    // blink every ~3.4s
    const blink = t % 3.4 > 3.25 ? 0.12 : 1;
    if (eyeL.current) eyeL.current.scale.y = blink;
    if (eyeR.current) eyeR.current.scale.y = blink;
  });

  // let the HTML wrapper trigger the hop on click
  useEffect(() => {
    hopRef.current = () => {
      hop.current = 1;
    };
  }, [hopRef]);

  return (
    <group ref={root} name="cat-root">
      {/* body-blob (head and body in one, pusheen-style) */}
      <mesh scale={[1.12, 0.92, 1]}>
        <sphereGeometry args={[0.85, 32, 24]} />
        <meshStandardMaterial color={BODY} roughness={0.9} />
      </mesh>

      {/* ears */}
      <mesh position={[-0.5, 0.72, 0]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.2, 0.38, 4]} />
        <meshStandardMaterial color={BODY} roughness={0.9} />
      </mesh>
      <mesh position={[0.5, 0.72, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.2, 0.38, 4]} />
        <meshStandardMaterial color={BODY} roughness={0.9} />
      </mesh>

      {/* head stripes */}
      {[-0.18, 0, 0.18].map((x) => (
        <mesh key={x} position={[x, 0.74, 0.12]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[0.07, 0.02, 0.3]} />
          <meshStandardMaterial color={DARK} roughness={0.9} />
        </mesh>
      ))}

      {/* eyes */}
      <mesh ref={eyeL} position={[-0.3, 0.18, 0.78]}>
        <sphereGeometry args={[0.075, 12, 12]} />
        <meshStandardMaterial color="#1a1715" roughness={0.4} />
      </mesh>
      <mesh ref={eyeR} position={[0.3, 0.18, 0.78]}>
        <sphereGeometry args={[0.075, 12, 12]} />
        <meshStandardMaterial color="#1a1715" roughness={0.4} />
      </mesh>

      {/* nose + whiskers */}
      <mesh position={[0, 0.02, 0.84]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color={COLLAR} roughness={0.6} />
      </mesh>
      {[-1, 1].map((side) =>
        [0.06, -0.04].map((y) => (
          <mesh
            key={`${side}-${y}`}
            position={[side * 0.62, y + 0.05, 0.62]}
            rotation={[0, 0, side * (y > 0 ? -0.12 : 0.08)]}
          >
            <boxGeometry args={[0.34, 0.015, 0.015]} />
            <meshStandardMaterial color={DARK} roughness={0.9} />
          </mesh>
        ))
      )}

      {/* collar */}
      <mesh position={[0, -0.42, 0]} rotation={[0.25, 0, 0]}>
        <torusGeometry args={[0.62, 0.05, 10, 32]} />
        <meshStandardMaterial color={COLLAR} roughness={0.6} />
      </mesh>

      {/* front paws */}
      <mesh position={[-0.3, -0.72, 0.5]}>
        <sphereGeometry args={[0.16, 12, 10]} />
        <meshStandardMaterial color={BODY} roughness={0.9} />
      </mesh>
      <mesh position={[0.3, -0.72, 0.5]}>
        <sphereGeometry args={[0.16, 12, 10]} />
        <meshStandardMaterial color={BODY} roughness={0.9} />
      </mesh>

      {/* tail */}
      <group ref={tail} position={[0.78, -0.35, -0.25]}>
        <mesh position={[0.25, 0.1, 0]} rotation={[0, 0, -0.7]}>
          <capsuleGeometry args={[0.11, 0.55, 6, 10]} />
          <meshStandardMaterial color={DARK} roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

export default function Mascot() {
  const scrollVel = useRef(0);
  const lastY = useRef(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hopRef = useRef<() => void>(() => {});
  const shieldHitRef = useRef<() => void>(() => {});
  const [quip, setQuip] = useState<string | null>(null);
  const quipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quipIdx = useRef(0);

  // scroll velocity with decay, sampled cheaply from the scroll event
  useEffect(() => {
    lastY.current = window.scrollY;
    let decay: number | undefined;
    const onScroll = () => {
      const y = window.scrollY;
      scrollVel.current = THREE.MathUtils.clamp((y - lastY.current) * 12, -400, 400);
      lastY.current = y;
      if (decay) cancelAnimationFrame(decay);
      const fade = () => {
        scrollVel.current *= 0.9;
        if (Math.abs(scrollVel.current) > 1) decay = requestAnimationFrame(fade);
        else scrollVel.current = 0;
      };
      decay = requestAnimationFrame(fade);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (decay) cancelAnimationFrame(decay);
    };
  }, []);

  const talk = () => {
    setQuip(QUIPS[quipIdx.current % QUIPS.length]);
    quipIdx.current += 1;
    hopRef.current();
    shieldHitRef.current();
    if (quipTimer.current) clearTimeout(quipTimer.current);
    quipTimer.current = setTimeout(() => setQuip(null), 2600);
  };

  return (
    <div
      ref={wrapRef}
      onPointerDown={talk}
      data-cursor="hover"
      title="Pix the cat"
      className="fixed bottom-2 right-2 z-40 h-20 w-[72px] cursor-pointer select-none opacity-90 transition-opacity hover:opacity-100 md:bottom-4 md:right-4 md:h-24 md:w-[86px]"
    >
      {/* talk bubble */}
      <div
        className={`absolute -top-9 right-1 whitespace-nowrap rounded-xl rounded-br-sm glass px-3 py-1.5 font-mono text-[11px] text-[color:var(--fg)] shadow-lg transition-all duration-300 ${
          quip ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        {quip}
      </div>

      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.2, 3.8], fov: 38 }}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.9} color="#f2e9d8" />
        <directionalLight position={[2, 3, 4]} intensity={0.9} color="#f7d3b2" />
        <CatModel scrollVel={scrollVel} hopRef={hopRef} />
        <CatShield hitRef={shieldHitRef} />
      </Canvas>
    </div>
  );
}
