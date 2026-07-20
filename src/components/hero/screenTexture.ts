import * as THREE from "three";

/**
 * Interactive terminal rendered to a canvas texture for the CRT screen.
 *
 * Boots with a short typed intro, then drops into a real prompt where the
 * visitor can type commands (`help`, `work`, `order`, `music`, ...) that
 * navigate the site. The hand-drawn pixel portrait sits behind the text.
 */

export type TerminalAction =
  | { type: "goto"; id: string }
  | { type: "open"; url: string };

export interface TerminalScreen {
  texture: THREE.CanvasTexture;
  draw: (time: number) => void;
  /** Feed a keydown event; returns true when the key was consumed. */
  handleKey: (e: KeyboardEvent) => boolean;
  /** True once the boot intro finished and the prompt is live. */
  isReady: () => boolean;
}

interface Line {
  t: string;
  c: string;
  s?: number;
  w?: string;
}

const W = 1024;
const H = 768;
const PAD = 64;
const PROMPT = "visitor@mk:~$ ";

const C = {
  dim: "#bfa688",
  bright: "#f2e9d8",
  soft: "#e7ddc9",
  accent: "#d78b7e",
  ok: "#9ec49a",
};

const SECTIONS: Record<string, { id: string; blurb: string }> = {
  work: { id: "work", blurb: "selected projects" },
  live3d: { id: "live3d", blurb: "real-time 3D models" },
  about: { id: "about", blurb: "who I am" },
  reviews: { id: "reviews", blurb: "client words" },
  order: { id: "order", blurb: "commission me directly" },
  contact: { id: "contact", blurb: "say hi" },
};

const INTRO: { t: string; c: string; s: number; w?: string; gap: number }[] = [
  { t: "> mkOS v1.0 · boot ok", c: C.dim, s: 24, gap: 0 },
  { t: "Hi, I'm Muhtasim.", c: C.bright, s: 64, w: "600", gap: 30 },
  { t: "3D Artist · Electrical Engineering student", c: C.soft, s: 26, gap: 14 },
  { t: "Kaunas University of Technology · Lithuania", c: C.dim, s: 22, gap: 8 },
  { t: "> type `help` to explore, or just scroll", c: C.accent, s: 24, gap: 30 },
];

// kept compact so it fits the visible scrollback under the intro block
const HELP: Line[] = [
  { t: "sections: work · live3d · about · reviews · order · contact", c: C.soft },
  { t: "  → type a section name to jump there", c: C.dim },
  { t: "extras: fiverr · artstation · clear · neofetch", c: C.soft },
];

export function createScreenTexture(onAction: (a: TerminalAction) => void): TerminalScreen {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const portrait = new Image();
  portrait.src = "/media/portrait.png";

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = true;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const mono = (size: number, weight = "400") =>
    `${weight} ${size}px 'JetBrains Mono', ui-monospace, monospace`;

  // ---- state ----
  const START = 0.5; // delay before the intro starts typing
  const CPS = 30; // intro typing speed (chars/sec)
  const introChars = INTRO.reduce((n, l) => n + l.t.length, 0);
  const scrollback: Line[] = [];
  let input = "";
  let ready = false;
  let bootDone = 0; // time the intro finished (for prompt fade-in)
  const historyCmds: string[] = [];
  let historyIdx = -1;

  function print(t: string, c: string = C.soft) {
    scrollback.push({ t, c });
    // keep the buffer bounded
    if (scrollback.length > 60) scrollback.splice(0, scrollback.length - 60);
  }

  function run(raw: string) {
    const cmd = raw.trim().toLowerCase().replace(/^cd\s+/, "").replace(/\/$/, "");
    print(PROMPT + raw, C.dim);
    if (!cmd) return;
    historyCmds.push(raw);
    historyIdx = -1;

    if (cmd === "help" || cmd === "ls" || cmd === "menu" || cmd === "?") {
      if (cmd === "ls") {
        print(Object.keys(SECTIONS).map((s) => s + "/").join("  "), C.soft);
      } else {
        HELP.forEach((l) => scrollback.push(l));
      }
    } else if (cmd in SECTIONS) {
      print(`→ opening ${cmd} ...`, C.ok);
      onAction({ type: "goto", id: SECTIONS[cmd].id });
    } else if (cmd === "3d") {
      print("→ opening live3d ...", C.ok);
      onAction({ type: "goto", id: "live3d" });
    } else if (cmd === "home" || cmd === "top") {
      print("already here :)", C.soft);
    } else if (cmd === "music") {
      print("no music yet. soon!", C.soft);
    } else if (cmd === "fiverr") {
      print("→ opening fiverr.com/cgrawr", C.ok);
      onAction({ type: "open", url: "https://www.fiverr.com/cgrawr" });
    } else if (cmd === "artstation") {
      print("→ opening artstation.com/intoovert", C.ok);
      onAction({ type: "open", url: "https://www.artstation.com/intoovert" });
    } else if (cmd === "clear") {
      scrollback.length = 0;
    } else if (cmd === "whoami") {
      print("visitor (probably a future client)", C.soft);
    } else if (cmd === "pwd") {
      print("/home/muhtasim/portfolio", C.soft);
    } else if (cmd.startsWith("sudo")) {
      print("nice try. this incident will be reported to the cat.", C.accent);
    } else if (cmd === "meow" || cmd === "cat") {
      print("the cat lives in the bottom-right corner. go say hi →", C.soft);
    } else if (cmd === "neofetch") {
      print("mk@portfolio · 3D artist", C.bright);
      print("os: mkOS 1.0 · shell: crt-sh", C.soft);
      print("tools: blender · zbrush · substance", C.soft);
      print("uptime: 5+ years in 3D", C.soft);
    } else {
      print(`command not found: ${cmd} (try \`help\`)`, C.accent);
    }
  }

  function handleKey(e: KeyboardEvent): boolean {
    if (!ready || e.metaKey || e.ctrlKey || e.altKey) return false;
    if (e.key === "Enter") {
      run(input);
      input = "";
      return true;
    }
    if (e.key === "Backspace") {
      input = input.slice(0, -1);
      return true;
    }
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      if (!historyCmds.length) return false;
      historyIdx =
        e.key === "ArrowUp"
          ? historyIdx < 0
            ? historyCmds.length - 1
            : Math.max(0, historyIdx - 1)
          : historyIdx < 0
            ? -1
            : Math.min(historyCmds.length - 1, historyIdx + 1);
      input = historyIdx >= 0 ? historyCmds[historyIdx] : "";
      return true;
    }
    if (e.key.length === 1 && input.length < 42) {
      input += e.key;
      return true;
    }
    return false;
  }

  function drawBackground(time: number) {
    ctx.fillStyle = "#0d0d0d";
    ctx.fillRect(0, 0, W, H);

    // pixel portrait fills the screen background (object-cover), clearly visible
    if (portrait.complete && portrait.naturalWidth) {
      const iw = portrait.naturalWidth;
      const ih = portrait.naturalHeight;
      const scale = Math.max(W / iw, H / ih);
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.drawImage(portrait, (W - iw * scale) / 2, (H - ih * scale) / 2, iw * scale, ih * scale);
      ctx.restore();
    }

    // light left-side gradient just enough to keep text readable
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, "rgba(13,13,13,0.78)");
    grad.addColorStop(0.55, "rgba(13,13,13,0.38)");
    grad.addColorStop(1, "rgba(13,13,13,0.05)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // header bar
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillStyle = C.dim;
    ctx.font = mono(20, "600");
    ctx.fillText("MK-OS  v1.0", PAD, 60);
    ctx.textAlign = "right";
    const blink = Math.floor(time * 2) % 2 === 0;
    ctx.fillStyle = blink ? "#c1685c" : "#5e332c";
    ctx.fillText("● ONLINE", W - PAD, 60);
    ctx.textAlign = "left";
    ctx.strokeStyle = "rgba(191,166,136,0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PAD, 82);
    ctx.lineTo(W - PAD, 82);
    ctx.stroke();

    return blink;
  }

  function drawIntro(time: number, blink: boolean) {
    let revealed = Math.max(0, Math.floor((time - START) * CPS));
    revealed = Math.min(revealed, introChars);
    if (revealed >= introChars && !ready) {
      ready = true;
      bootDone = time;
    }

    let used = 0;
    let y = 150;
    for (const l of INTRO) {
      y += l.gap + l.s;
      const shown = Math.max(0, Math.min(l.t.length, revealed - used));
      const isTyping = revealed - used > 0 && revealed - used < l.t.length;
      used += l.t.length;
      if (shown <= 0 && !ready) continue;

      const str = ready ? l.t : l.t.slice(0, shown);
      ctx.font = mono(l.s, l.w ?? "400");
      ctx.fillStyle = l.c;
      ctx.fillText(str, PAD, y);

      if (isTyping && blink) {
        const w = ctx.measureText(str).width;
        ctx.fillStyle = "#c1685c";
        ctx.fillRect(PAD + w + 6, y - l.s * 0.8, l.s * 0.55, l.s * 0.9);
      }
    }
    return y;
  }

  function drawPrompt(time: number, topY: number, blink: boolean) {
    const alpha = Math.min(1, (time - bootDone) / 0.6);
    ctx.save();
    ctx.globalAlpha = alpha;

    const lineH = 32;
    const promptY = H - 56;
    // scrollback grows upward from the prompt, clipped under the intro block
    const maxLines = Math.floor((promptY - topY - 40) / lineH);
    const visible = scrollback.slice(-Math.max(0, maxLines));
    ctx.font = mono(22);
    visible.forEach((l, i) => {
      ctx.fillStyle = l.c;
      ctx.fillText(l.t, PAD, promptY - (visible.length - i) * lineH);
    });

    // prompt + input + caret
    ctx.font = mono(22, "500");
    ctx.fillStyle = C.ok;
    ctx.fillText(PROMPT, PAD, promptY);
    const pw = ctx.measureText(PROMPT).width;
    ctx.fillStyle = C.bright;
    ctx.fillText(input, PAD + pw, promptY);
    if (blink) {
      const iw = ctx.measureText(input).width;
      ctx.fillStyle = "#c1685c";
      ctx.fillRect(PAD + pw + iw + 4, promptY - 18, 12, 22);
    }
    ctx.restore();
  }

  function draw(time: number) {
    const blink = drawBackground(time);
    const introBottom = drawIntro(time, blink);
    if (ready) drawPrompt(time, introBottom, blink);
    texture.needsUpdate = true;
  }

  return { texture, draw, handleKey, isReady: () => ready };
}
