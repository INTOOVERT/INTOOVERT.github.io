import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ScreenQuad } from "@react-three/drei";
import * as THREE from "three";

/**
 * Flowing "shield" shader background, inspired by cortiz2894/flow-shield-effect.
 * Layered fbm noise drifts behind the content and a soft refractive shield
 * follows the pointer. Rendered to a single fullscreen quad for performance.
 */
const frag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uRes;
  uniform float uLight;

  mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i=floor(p), f=fract(p);
    float a=hash(i), b=hash(i+vec2(1.0,0.0));
    float c=hash(i+vec2(0.0,1.0)), d=hash(i+vec2(1.0,1.0));
    vec2 u=f*f*(3.0-2.0*f);
    return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;
  }
  float fbm(vec2 p){
    float v=0.0, amp=0.5;
    for(int i=0;i<5;i++){ v+=amp*noise(p); p=rot(0.5)*p*2.02; amp*=0.5; }
    return v;
  }

  void main(){
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uRes.x/uRes.y, 1.0);

    float t = uTime * 0.06;
    vec2 q = vec2(fbm(p*1.6 + t), fbm(p*1.6 - t + 5.2));
    float flow = fbm(p*2.0 + q*1.8 + t);

    // shield bulge following the mouse
    vec2 m = (uMouse - 0.5) * vec2(uRes.x/uRes.y, 1.0);
    float d = length(p - m);
    float shield = smoothstep(0.6, 0.0, d);
    flow += shield * 0.5 * sin(d*18.0 - uTime*2.0);

    vec3 c1 = vec3(0.757, 0.408, 0.361); // soft terracotta #C1685C
    vec3 c2 = vec3(0.749, 0.651, 0.533); // sand #BFA688
    vec3 c3 = vec3(0.949, 0.914, 0.847); // bone #F2E9D8
    vec3 col = mix(c1, c2, smoothstep(0.2, 0.8, flow));
    col = mix(col, c3, smoothstep(0.55, 0.95, flow) * 0.5);
    col += shield * 0.25;

    // rim ring of the shield
    float ring = smoothstep(0.02, 0.0, abs(d - 0.42)) * 0.4;
    col += ring * vec3(0.95, 0.91, 0.85);

    // semi-transparent so the flow tints the shared page backdrop
    // instead of painting an opaque dark slab (keeps sections seamless)
    float alpha = uLight > 0.5 ? 0.12 : 0.20;
    gl_FragColor = vec4(col, alpha * (0.4 + 0.6 * flow));
  }
`;

const vert = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

function Quad({ light }: { light: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const target = useRef(new THREE.Vector2(0.5, 0.5));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uRes: { value: new THREE.Vector2(1, 1) },
      uLight: { value: light ? 1 : 0 },
    }),
    [] // eslint-disable-line
  );

  useFrame((state, delta) => {
    if (!mat.current) return;
    const u = mat.current.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uRes.value.set(size.width, size.height);
    u.uLight.value = light ? 1 : 0;
    u.uMouse.value.x += (target.current.x - u.uMouse.value.x) * Math.min(1, delta * 3);
    u.uMouse.value.y += (target.current.y - u.uMouse.value.y) * Math.min(1, delta * 3);
  });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <ScreenQuad>
      <shaderMaterial
        ref={mat}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </ScreenQuad>
  );
}

export default function ShaderBackground({
  light = false,
  active = true,
}: {
  light?: boolean;
  active?: boolean;
}) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      style={{ background: "transparent" }}
      frameloop={active ? "always" : "never"}
    >
      <Quad light={light} />
    </Canvas>
  );
}
