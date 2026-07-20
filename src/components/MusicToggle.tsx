/**
 * Ambient-music toggle button, currently disabled (no track chosen yet).
 * To re-enable: uncomment this file, uncomment src/audio/ambient.ts, and
 * restore <MusicToggle /> in src/App.tsx.
 */

// import { useEffect, useState } from "react";
// import { isAmbientPlaying, onAmbientChange, toggleAmbient } from "../audio/ambient";

// export default function MusicToggle() {
//   const [playing, setPlaying] = useState(isAmbientPlaying());

//   useEffect(() => onAmbientChange(setPlaying), []);

//   return (
//     <button
//       onClick={() => toggleAmbient()}
//       data-cursor="hover"
//       aria-label={playing ? "Pause ambient music" : "Play ambient music"}
//       className="fixed bottom-5 left-5 z-50 flex h-11 w-11 items-center justify-center rounded-full glass ring-1 ring-[color:var(--card-border)] transition hover:bg-[color:var(--card-bg-hover)]"
//     >
//       {playing ? (
//         <span className="flex h-4 items-end gap-[3px]" aria-hidden>
//           {[0, 1, 2].map((i) => (
//             <span
//               key={i}
//               className="w-[3px] rounded-full bg-accent-glow"
//               style={{ animation: `eq 0.9s ease-in-out ${i * 0.18}s infinite alternate` }}
//             />
//           ))}
//           <style>{`@keyframes eq { from { height: 4px } to { height: 16px } }`}</style>
//         </span>
//       ) : (
//         <svg
//           viewBox="0 0 24 24"
//           className="h-[18px] w-[18px] opacity-70"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth={1.7}
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         >
//           <path d="M9 18V5l12-2v13" />
//           <circle cx="6" cy="18" r="3" />
//           <circle cx="18" cy="16" r="3" />
//         </svg>
//       )}
//     </button>
//   );
// }

export {};
