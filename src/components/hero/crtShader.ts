/**
 * CRT screen shader: frames the hand-drawn portrait, lifts its contrast so the
 * face reads on the tube, then adds barrel distortion, scanlines, an aperture
 * grille, chromatic aberration, vignette, rolling flicker, phosphor glow and a
 * power-on wipe. Tuned for a light pencil-on-paper source image.
 */
export const crtVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const crtFragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uCurvature;
  uniform float uScanline;
  uniform float uAberration;
  uniform vec3 uTint;
  uniform float uOn;        // power-on wipe 0..1
  uniform float uZoom;      // frame the face
  uniform vec2 uOffset;     // recenter the face
  uniform float uContrast;
  uniform float uBrightness;

  vec2 curve(vec2 uv) {
    uv = uv * 2.0 - 1.0;
    vec2 offset = abs(uv.yx) / uCurvature;
    uv = uv + uv * offset * offset;
    uv = uv * 0.5 + 0.5;
    return uv;
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    // frame + curve the screen space
    vec2 uv = (vUv - 0.5) / uZoom + 0.5 + uOffset;
    uv = curve(uv);

    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      gl_FragColor = vec4(0.015, 0.015, 0.02, 1.0);
      return;
    }

    // chromatic aberration sample
    float a = uAberration;
    float r = texture2D(uTexture, uv + vec2(a, 0.0)).r;
    float g = texture2D(uTexture, uv).g;
    float b = texture2D(uTexture, uv - vec2(a, 0.0)).b;
    vec3 col = vec3(r, g, b);

    // the source is a light grayscale drawing -> lift contrast so the face pops
    col = (col - 0.5) * uContrast + 0.5 + uBrightness;
    col = clamp(col, 0.0, 1.0);

    // keep most of the portrait's colour, only a light phosphor desaturation
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col, vec3(lum), 0.28);

    // horizontal scanlines
    float scan = sin(uv.y * uScanline) * 0.5 + 0.5;
    col *= 0.82 + 0.18 * scan;

    // vertical aperture grille
    float grille = 0.9 + 0.1 * sin(uv.x * uScanline * 0.8);
    col *= grille;

    // rolling brightness + mains flicker
    col += sin(uv.y * 2.0 + uTime * 1.2) * 0.01;
    col *= 0.98 + 0.02 * sin(uTime * 48.0);

    // fine grain
    col += (hash(uv * vec2(640.0, 480.0) + uTime) - 0.5) * 0.025;

    // phosphor tint + faint self-glow
    col *= uTint;
    col += uTint * lum * 0.12;

    // vignette
    vec2 vig = uv * (1.0 - uv.yx);
    float v = pow(vig.x * vig.y * 22.0, 0.22);
    col *= clamp(v, 0.0, 1.0);

    // power-on wipe: bright expanding band then settle
    float wipe = smoothstep(0.0, 1.0, uOn);
    float band = smoothstep(wipe, wipe - 0.05, abs(uv.y - 0.5) * 2.0);
    col = mix(col, vec3(0.95, 0.91, 0.85), band * (1.0 - wipe) * 0.7);
    col *= smoothstep(0.0, 0.3, uOn);

    gl_FragColor = vec4(col, 1.0);
  }
`;
