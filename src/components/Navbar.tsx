import { useEffect, useState } from "react";
import type { Theme } from "../hooks/useTheme";
import { SunIcon, MoonIcon } from "./Icons";
import { getLenis } from "../hooks/useLenis";

const links = [
  { label: "Work", id: "work" },
  { label: "Live 3D", id: "live3d" },
  { label: "About", id: "about" },
  { label: "Reviews", id: "reviews" },
  { label: "Order", id: "order" },
  { label: "Contact", id: "contact" },
];

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(el, { offset: -10 });
  else el.scrollIntoView({ behavior: "smooth" });
}

export default function Navbar({
  theme,
  onToggleTheme,
}: {
  theme: Theme;
  onToggleTheme: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>(links[0].id);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // the whole header hides on scroll; make sure the mobile menu goes with it
  useEffect(() => {
    if (scrolled) setOpen(false);
  }, [scrolled]);

  // scroll spy: highlight the dot for the section currently in view
  useEffect(() => {
    const sections = links
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const renderDot = (l: (typeof links)[number]) => {
    const isActive = active === l.id;
    return (
      <button
        key={l.id}
        onClick={() => scrollToId(l.id)}
        data-cursor="hover"
        aria-label={l.label}
        className="relative flex items-center rounded-full px-2 py-1.5 text-sm transition-colors"
      >
        <span
          className={`h-2 w-2 shrink-0 rounded-full transition-all duration-300 ${
            isActive
              ? "scale-125 bg-accent-glow shadow-[0_0_10px_rgba(var(--accent),0.8)]"
              : "bg-[color:var(--fg)] opacity-30 group-hover:opacity-50"
          }`}
        />
        <span
          className={`max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-500 group-hover:max-w-[120px] group-hover:pl-2 ${
            isActive
              ? "text-accent-glow group-hover:opacity-100"
              : "group-hover:opacity-70"
          }`}
        >
          {l.label}
        </span>
      </button>
    );
  };

  return (
    <>
      {/* header disappears on scroll (all sizes) so nothing blocks the view;
          scroll back to the top and it returns */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? "py-3" : "py-5"
        } ${
          scrolled ? "pointer-events-none -translate-y-full opacity-0" : ""
        }`}
      >
        <nav
          className={`container-px mx-auto flex max-w-7xl items-center justify-between rounded-2xl transition-all duration-500 ${
            scrolled ? "glass mx-3 px-4 py-2 md:mx-6" : ""
          }`}
        >
          <button
            onClick={() => scrollToId("top")}
            data-cursor="hover"
            className="group flex items-center gap-3"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/15 font-mono text-sm font-semibold text-accent-glow ring-1 ring-accent/30">
              MK
            </span>
            <span className="hidden text-sm font-medium tracking-wide opacity-80 sm:block">
              Muhtasim&nbsp;Khan
            </span>
          </button>

          {/* horizontal dots: only before the first scroll (desktop) */}
          <div
            className={`group hidden items-center gap-1 rounded-full px-1 py-1 transition-all duration-500 hover:gap-1.5 hover:bg-[color:var(--card-bg)] hover:px-2 md:flex ${
              scrolled
                ? "pointer-events-none -translate-y-2 opacity-0"
                : "opacity-100"
            }`}
          >
            {links.map((l) => renderDot(l))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              data-cursor="hover"
              aria-label="Toggle theme"
              className="grid h-9 w-9 place-items-center rounded-full ring-1 ring-[color:var(--card-border)] transition hover:bg-[color:var(--card-bg-hover)]"
            >
              {theme === "dark" ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
              className="grid h-9 w-9 place-items-center rounded-full ring-1 ring-[color:var(--card-border)] md:hidden"
            >
              <span className="text-lg leading-none">{open ? "×" : "≡"}</span>
            </button>
          </div>
        </nav>

        {open && (
          <div className="container-px mx-3 mt-2 grid gap-1 rounded-2xl glass p-3 md:hidden">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  scrollToId(l.id);
                  setOpen(false);
                }}
                className="rounded-xl px-4 py-3 text-left text-sm opacity-80 transition hover:bg-white/5"
              >
                {l.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* upper-left theme toggle: appears after the first scroll (desktop) */}
      <button
        onClick={onToggleTheme}
        data-cursor="hover"
        aria-label="Toggle theme"
        className={`fixed left-4 top-4 z-50 hidden h-9 w-9 place-items-center rounded-full ring-1 ring-[color:var(--card-border)] backdrop-blur-md transition-all duration-500 hover:bg-[color:var(--card-bg-hover)] md:grid ${
          scrolled
            ? "translate-x-0 opacity-100"
            : "pointer-events-none -translate-x-6 opacity-0"
        }`}
      >
        {theme === "dark" ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
      </button>

      {/* left-docked vertical dots: appears after the first scroll (desktop) */}
      <nav
        className={`fixed left-3 top-1/2 z-50 hidden -translate-y-1/2 md:flex ${
          scrolled
            ? "translate-x-0 opacity-100"
            : "pointer-events-none -translate-x-6 opacity-0"
        } transition-all duration-500`}
        aria-label="Section navigation"
      >
        <div className="group flex flex-col items-start gap-1 rounded-2xl p-2 transition-all duration-500 hover:gap-1.5 hover:bg-[color:var(--card-bg)] hover:backdrop-blur-md">
          {links.map((l) => renderDot(l))}
        </div>
      </nav>
    </>
  );
}
