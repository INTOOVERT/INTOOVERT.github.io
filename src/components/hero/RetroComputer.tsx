import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { crtFragmentShader, crtVertexShader } from "./crtShader";
import type { TerminalScreen } from "./screenTexture";

const MODEL = "/models/Commodore710.glb";
const SPEAKER_MODEL = "/models/speaker.glb";
useGLTF.preload(MODEL);
useGLTF.preload(SPEAKER_MODEL);

/** Base yaw so the screen faces the camera straight-on (edh.dev opening pose). */
const BASE_YAW = Math.PI;
/** How far down the computer sits in the frame. */
const BASE_Y = -0.7;

/**
 * Live focus points shared with the scroll-driven camera rig: the world-space
 * position of the screen (to zoom into on load) and of the model centre.
 */
export const heroFocus = { screenX: 0, screenY: 1.0, modelY: BASE_Y };
const _tmp = new THREE.Vector3();

/** Scroll progress through the hero section (same math as Hero.tsx). */
function heroScrollProgress() {
  const hero = document.getElementById("top");
  if (!hero) return 0;
  const vh = window.innerHeight || 1;
  const range = Math.max(1, hero.offsetHeight - vh);
  return Math.min(1, Math.max(0, (window.scrollY - hero.offsetTop) / range));
}

/** 0 on landscape, 1 on clearly-portrait screens (phones held upright). */
export function portraitFactor(width: number, height: number) {
  return THREE.MathUtils.clamp((height / width - 1.05) / 0.3, 0, 1);
}

/**
 * Speaker placement, matched to the Blender reference: the speaker is used
 * unscaled in the computer's raw glb space (floor plane sits at y = -3.08,
 * speaker is 2 units tall with a centered origin). The two reference
 * transforms sit ~6.8 units apart, i.e. ±3.4 from the computer's centre,
 * with a small yaw toe-in (quaternion z 0.034 / 0.143 -> ~4° / ~16°).
 */
const SPEAKER_X = 3.4;
const SPEAKER_Y = -3.08 + 1.0; // standing on the floor plane
const SPEAKER_Z = 0.5;
const SPEAKER_TOE_IN = 0.24; // radians, rotated toward the viewer
/** +90° around Blender Z (vertical spin) → rotation on Y in Three.js Y-up space */
const SPEAKER_Z_ROT = Math.PI / 2;

/** Two desk speakers flanking the monitor, placed in the model's raw space. */
function Speakers() {
  const { scene } = useGLTF(SPEAKER_MODEL);

  const { leftScene, rightScene } = useMemo(() => {
    // the hero scene is lit for baked materials only, so swap the speaker's
    // PBR materials for unlit ones that keep the original texture
    const unlit = (root: THREE.Object3D) => {
      root.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const prev = mesh.material as THREE.MeshStandardMaterial;
        mesh.material = new THREE.MeshBasicMaterial({
          map: prev.map ?? null,
          color: prev.color ?? new THREE.Color("#888"),
          toneMapped: false,
        });
      });
      return root;
    };
    return {
      leftScene: unlit(scene.clone(true)),
      rightScene: unlit(scene.clone(true)),
    };
  }, [scene]);

  // Blender Z+ 90° is a spin around vertical; in glTF/Three that is rotation.y.
  // Toe-in still angles each speaker slightly toward the monitor centre.
  return (
    <>
      <group
        position={[-SPEAKER_X, SPEAKER_Y, SPEAKER_Z]}
        rotation={[0, Math.PI - SPEAKER_TOE_IN + SPEAKER_Z_ROT, 0]}
      >
        <primitive object={leftScene} />
      </group>
      <group
        position={[SPEAKER_X, SPEAKER_Y, SPEAKER_Z]}
        rotation={[0, Math.PI + SPEAKER_TOE_IN + SPEAKER_Z_ROT, 0]}
      >
        <primitive object={rightScene} />
      </group>
    </>
  );
}

/**
 * The retro computer from edhinrichsen/retro-computer-website (MIT, (c) 2024
 * Edward Hinrichsen). We keep his baked Commodore 710 model + texture and only
 * swap the screen contents for the interactive terminal, run through our CRT shader.
 */
export default function RetroComputer({
  screen,
  onReady,
}: {
  screen: TerminalScreen;
  onReady: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const screenObj = useRef<THREE.Object3D | null>(null);
  const renderedFrames = useRef(0);
  const readyReported = useRef(false);
  const { viewport } = useThree();

  const { scene } = useGLTF(MODEL);
  const bake = useTexture("/textures/bake.jpg");
  const bakeFloor = useTexture("/textures/bake_floor.jpg");

  const screenMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: crtVertexShader,
        fragmentShader: crtFragmentShader,
        toneMapped: false,
        uniforms: {
          uTexture: { value: screen.texture },
          uTime: { value: 0 },
          uCurvature: { value: 7.0 },
          uScanline: { value: 540.0 },
          uAberration: { value: 0.0013 },
          uTint: { value: new THREE.Color("#f2e9d8") },
          uOn: { value: 0 },
          uZoom: { value: 1.0 },
          uOffset: { value: new THREE.Vector2(0.0, 0.0) },
          uContrast: { value: 1.12 },
          uBrightness: { value: 0.0 },
        },
      }),
    [screen]
  );

  // Build the model: clone, fix textures, assign baked + screen materials, then
  // size + center on the COMPUTER mesh (ignoring the large ShadowPlane so the
  // computer doesn't get shrunk to nothing).
  const { root, fit, center } = useMemo(() => {
    for (const t of [bake, bakeFloor]) {
      t.flipY = false;
      t.colorSpace = THREE.SRGBColorSpace;
    }

    const bakeMat = new THREE.MeshBasicMaterial({ map: bake, toneMapped: false });
    const floorMat = new THREE.MeshBasicMaterial({
      map: bakeFloor,
      toneMapped: false,
      transparent: true,
      depthWrite: false,
    });
    const backdropMat = new THREE.MeshBasicMaterial({
      color: "#F2D5BB",
      toneMapped: false,
      side: THREE.DoubleSide,
    });

    const cloned = scene.clone(true);
    let computer: THREE.Object3D | null = null;
    cloned.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const meshName = mesh.name.toLowerCase();
      if (mesh.name === "Screen") {
        mesh.material = screenMaterial;
        screenObj.current = mesh;
      } else if (meshName === "plane" || meshName.includes("backdrop")) {
        mesh.material = backdropMat;
        // Blender's Z-up rotation is imported by glTF/Three as Y-up rotation.
        mesh.rotation.y = THREE.MathUtils.degToRad(5);
      } else if (mesh.name === "ShadowPlane") mesh.material = floorMat;
      else {
        mesh.material = bakeMat; // Computer, CRT, Keyboard
        if (mesh.name === "Computer" || mesh.name === "CRT") computer = mesh;
      }
    });

    cloned.updateMatrixWorld(true);
    const target: THREE.Object3D = computer ?? cloned;
    const box = new THREE.Box3().setFromObject(target);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    return { root: cloned, fit: 4.0 / maxDim, center: c };
  }, [scene, bake, bakeFloor, screenMaterial]);

  const responsive = viewport.width < 6 ? 0.8 : 1;
  const scale = fit * responsive;

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05); // clamp to avoid snaps after pauses/hitches
    screenMaterial.uniforms.uTime.value = t;
    screenMaterial.uniforms.uOn.value = THREE.MathUtils.clamp((t - 0.4) / 1.6, 0, 1);
    screen.draw(t);

    if (group.current) {
      const px = state.pointer.x;
      const py = state.pointer.y;
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        BASE_YAW + px * 0.22,
        4,
        dt
      );
      group.current.rotation.x = THREE.MathUtils.damp(
        group.current.rotation.x,
        -py * 0.1,
        4,
        dt
      );

      // edh.dev portrait intro: on phones the computer starts rolled 90° so
      // the wide screen fills the narrow viewport, then straightens as you
      // scroll and the full model is revealed.
      const portrait = portraitFactor(state.size.width, state.size.height);
      const rollTarget = -(Math.PI / 2) * (1 - heroScrollProgress()) * portrait;
      group.current.rotation.z = THREE.MathUtils.damp(
        group.current.rotation.z,
        rollTarget,
        5,
        dt
      );

      group.current.position.y = BASE_Y + Math.sin(t * 0.7) * 0.04;
      heroFocus.modelY = group.current.position.y;
    }
    if (screenObj.current) {
      screenObj.current.getWorldPosition(_tmp);
      heroFocus.screenX = _tmp.x;
      heroFocus.screenY = _tmp.y;
    }

    // Suspense only mounts this component after its models and textures load.
    // Waiting for a second frame also guarantees one complete WebGL render
    // before the page-level loader is allowed to disappear.
    renderedFrames.current += 1;
    if (!readyReported.current && renderedFrames.current >= 2) {
      readyReported.current = true;
      onReady();
    }
  });

  // start already rolled on portrait screens so there's no pop at load
  const initialRoll = useMemo(
    () => -(Math.PI / 2) * portraitFactor(window.innerWidth, window.innerHeight),
    []
  );

  return (
    <group
      ref={group}
      scale={scale}
      rotation={[0, BASE_YAW, initialRoll]}
      position={[0, BASE_Y, 0]}
    >
      <group position={[-center.x, -center.y, -center.z]}>
        <primitive object={root} />
        {/* speakers live in the same raw model space as the computer, so the
            Blender reference transforms apply directly */}
        <Speakers />
      </group>
    </group>
  );
}
