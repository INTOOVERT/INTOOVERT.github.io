import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { createShieldMaterial, MAX_HITS } from "../portfolio/shieldMaterial";

const REVEAL_SPEED = 2.8;
const DISSOLVE_SPEED = 1.6;

function ShieldSphere({
  color,
  dissolving,
  persistent,
  scale = 1.05,
  onDissolved,
  onRequestDissolve,
}: {
  color: string;
  dissolving: boolean;
  persistent?: boolean;
  scale?: number;
  onDissolved: () => void;
  onRequestDissolve: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const material = useMemo(() => createShieldMaterial(color), [color]);
  const reveal = useRef(1);
  const timeRef = useRef(0);
  const hitIdx = useRef(0);
  const dissolved = useRef(false);

  useFrame((state, delta) => {
    timeRef.current = state.clock.elapsedTime;
    material.uniforms.uTime.value = timeRef.current;

    const target = dissolving ? 1 : 0;
    const speed = dissolving ? DISSOLVE_SPEED : REVEAL_SPEED;
    reveal.current = THREE.MathUtils.lerp(
      reveal.current,
      target,
      1 - Math.exp(-speed * delta)
    );
    material.uniforms.uReveal.value = reveal.current;
    material.visible = reveal.current < 0.999;

    if (group.current) group.current.rotation.y += delta * 0.18;

    if (dissolving && !dissolved.current && reveal.current > 0.985) {
      dissolved.current = true;
      onDissolved();
    }
  });

  const onClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      const local = e.object.worldToLocal(e.point.clone());
      const idx = hitIdx.current % MAX_HITS;
      hitIdx.current++;
      material.uniforms.uHitPos.value[idx].copy(local);
      material.uniforms.uHitTime.value[idx] = timeRef.current;
      if (!persistent) onRequestDissolve();
    },
    [material, onRequestDissolve, persistent]
  );

  return (
    <group ref={group} scale={scale}>
      <mesh onClick={onClick}>
        <sphereGeometry args={[1.8, 48, 48]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

export default function ForceShield({
  color,
  persistent = false,
  active = true,
  scale = 1.05,
  cameraZ = 5.2,
  className = "absolute inset-0 overflow-hidden rounded-2xl",
}: {
  color: string;
  /** If true, clicks spawn ripples but the shield stays visible. */
  persistent?: boolean;
  active?: boolean;
  scale?: number;
  cameraZ?: number;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dissolving, setDissolving] = useState(false);
  const [gone, setGone] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (active) {
      setDissolving(false);
      setGone(false);
    }
  }, [active]);

  // Only render (and animate) while the element is near the viewport. This
  // keeps the number of live WebGL contexts low and stops offscreen shields
  // from burning GPU time. Leaving the viewport also re-arms a dissolved
  // shield, so every project greets you shielded again on the way back.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (!e.isIntersecting) {
          setDissolving(false);
          setGone(false);
        }
      },
      { rootMargin: "80px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!active) return null;

  return (
    <div ref={wrapRef} className={className}>
      {inView && !(gone && !persistent) && (
        <Canvas
          className="!absolute inset-0"
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, cameraZ], fov: 48 }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "low-power",
            premultipliedAlpha: false,
          }}
          style={{ background: "transparent" }}
        >
          <ShieldSphere
            color={color}
            dissolving={dissolving}
            persistent={persistent}
            scale={scale}
            onDissolved={() => setGone(true)}
            onRequestDissolve={() => setDissolving(true)}
          />
        </Canvas>
      )}
    </div>
  );
}
