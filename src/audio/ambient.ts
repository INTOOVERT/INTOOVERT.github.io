/**
 * Ambient-music player, currently disabled. To re-enable:
 *   1. Drop your track at public/media/ambient.mp3
 *   2. Uncomment everything below
 *   3. Uncomment <MusicToggle /> in src/App.tsx
 */

// const SRC = "/media/ambient.mp3";
// const TARGET_VOLUME = 0.32;
// const FADE_MS = 900;

// let audio: HTMLAudioElement | null = null;
// let playing = false;
// let fadeTimer: ReturnType<typeof setInterval> | null = null;

// const listeners = new Set<(playing: boolean) => void>();

// function notify() {
//   listeners.forEach((fn) => fn(playing));
// }

// function fadeTo(target: number, onDone?: () => void) {
//   if (!audio) return;
//   if (fadeTimer) clearInterval(fadeTimer);
//   const el = audio;
//   const step = (TARGET_VOLUME / FADE_MS) * 50;
//   fadeTimer = setInterval(() => {
//     const next =
//       el.volume < target ? Math.min(target, el.volume + step) : Math.max(target, el.volume - step);
//     el.volume = next;
//     if (next === target) {
//       if (fadeTimer) clearInterval(fadeTimer);
//       fadeTimer = null;
//       onDone?.();
//     }
//   }, 50);
// }

// export function isAmbientPlaying() {
//   return playing;
// }

// /** Subscribe to play/pause changes. Returns an unsubscribe function. */
// export function onAmbientChange(fn: (playing: boolean) => void) {
//   listeners.add(fn);
//   return () => {
//     listeners.delete(fn);
//   };
// }

// /** Toggle the ambient track with a soft fade. Returns the new playing state. */
// export function toggleAmbient(): boolean {
//   if (!audio) {
//     audio = new Audio(SRC);
//     audio.loop = true;
//     audio.preload = "none";
//     audio.volume = 0;
//   }

//   if (playing) {
//     playing = false;
//     fadeTo(0, () => audio?.pause());
//   } else {
//     playing = true;
//     audio.play().catch(() => {
//       playing = false;
//       notify();
//     });
//     fadeTo(TARGET_VOLUME);
//   }
//   notify();
//   return playing;
// }

export {};
