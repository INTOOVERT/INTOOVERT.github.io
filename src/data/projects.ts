export type ProjectMediaType = "video" | "sketchfab";

export interface Project {
  id: string;
  title: string;
  /** index label shown on the card, e.g. "01" */
  index: string;
  category: string;
  tools: string[];
  description: string;
  type: ProjectMediaType;
  /** local video path (type === "video") */
  src?: string;
  /** poster frame for video (optional) */
  poster?: string;
  /** sketchfab embed url (type === "sketchfab") */
  embedUrl?: string;
  accent: string;
  year: string;
}

/**
 * Portfolio pieces. Most are 360° turntable / render videos exported from
 * Blender (used intentionally instead of shipping raw downloadable 3D files).
 * Descriptions are short, active-verb summaries of what was actually done.
 */
export const projects: Project[] = [
  {
    id: "hyperion",
    title: "Hyperion",
    index: "01",
    category: "Character Modeling",
    tools: ["Blender", "ZBrush", "Substance Painter"],
    description:
      "Sculpted, retopologised and textured a full-body superhero character, then rendered a cinematic 360° turntable.",
    type: "video",
    src: "/media/hyperion.mp4",
    accent: "#c1685c",
    year: "2024",
  },
  {
    id: "captain-cold",
    title: "Captain Cold",
    index: "02",
    category: "Character Modeling",
    tools: ["Blender", "Marvelous Designer", "Substance Painter"],
    description:
      "Modeled a stylised comic character, simulated the cloth and hard-surface gear, and lit a full rotation render.",
    type: "video",
    src: "/media/captain-cold.mp4",
    accent: "#bfa688",
    year: "2024",
  },
  {
    id: "sketchfab-caretaker",
    title: "Caretaker Bot",
    index: "03",
    category: "Game Asset · Interactive 3D",
    tools: ["Blender", "Substance Painter", "Sketchfab"],
    description:
      "Built a game-ready support droid with clean topology and PBR materials. Orbit and inspect it live in the browser.",
    type: "sketchfab",
    embedUrl: "https://sketchfab.com/models/4ecd2d8ef2384ccfaee913dd07d8fcbc/embed?dnt=1&ui_infos=0&ui_watermark=0",
    accent: "#d78b7e",
    year: "2023",
  },
  {
    id: "grendizer",
    title: "UFO Grendizer Modernized",
    index: "04",
    category: "Hard-Surface · 3D Print",
    tools: ["Blender", "Substance Painter", "Cycles"],
    description:
      "Modernized the classic Grendizer mech with articulated print-ready joints, then rendered a full 360° turntable and breakdown of the assembled parts.",
    type: "video",
    src: "/media/turntable-360.mp4",
    accent: "#bfa688",
    year: "2023",
  },
  {
    id: "sketchfab-miniboss",
    title: "Mini Boss Robot",
    index: "05",
    category: "Collaboration · Game Asset",
    tools: ["Blender", "Substance Painter", "Sketchfab"],
    description:
      "Co-built a chunky mini-boss mech optimised for real-time. Spin it around and dig into the details.",
    type: "sketchfab",
    embedUrl: "https://sketchfab.com/models/da5b63444f764deab75b7edf4da09113/embed?ui_infos=0&dnt=1&ui_watermark=0",
    accent: "#c1685c",
    year: "2023",
  },
  {
    id: "gundam",
    title: "Wing Gundam Zero Head Bust",
    index: "06",
    category: "Character Modeling · 3D Print",
    tools: ["ZBrush", "Blender", "Substance Painter"],
    description:
      "Sculpted a custom Wing Gundam Zero head bust through two design iterations in ZBrush, then exported a print-ready mesh and rendered the final turntable.",
    type: "video",
    src: "/media/alat.mp4",
    accent: "#bfa688",
    year: "2023",
  },
];

export const sketchfabProjects = projects.filter((p) => p.type === "sketchfab");
