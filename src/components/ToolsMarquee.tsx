const items = [
  "Blender",
  "ZBrush",
  "Substance Painter",
  "Marvelous Designer",
  "Character Modeling",
  "Digital Sculpting",
  "Game Assets",
  "3D Printing",
  "Rigging",
  "Video Rendering",
  "Interactive 3D",
];

/**
 * Slow infinite marquee of tools and skills; a light divider that adds motion
 * between the heavy sections. The list is doubled so the -50% translation
 * loops seamlessly.
 */
export default function ToolsMarquee() {
  return (
    <div aria-hidden className="relative overflow-hidden border-y border-hairline py-12">
      <div className="flex w-max animate-marquee gap-[7.5rem] whitespace-nowrap font-mono text-4xl uppercase tracking-[0.3em] opacity-45 [animation-duration:56s]">
        {[...items, ...items].map((it, i) => (
          <span key={i} className="flex items-center gap-[7.5rem]">
            {it}
            <span className="text-accent-glow">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
