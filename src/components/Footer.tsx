import { socials, FIVERR_URL } from "../data/socials";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="surface-1 border-t border-hairline">
      <div className="container-px mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 py-10 md:flex-row">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/15 font-mono text-xs font-semibold text-accent-glow ring-1 ring-accent/30">
            MK
          </span>
          <span className="text-sm opacity-60">
            © {year} Muhtasim Khan · 3D Artist, Lithuania
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {socials
            .filter((s) => s.icon !== "mail")
            .map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                data-cursor="hover"
                className="opacity-60 transition hover:opacity-100"
              >
                {s.label}
              </a>
            ))}
          <a
            href={FIVERR_URL}
            target="_blank"
            rel="noreferrer"
            data-cursor="hover"
            className="opacity-60 transition hover:opacity-100"
          >
            Fiverr
          </a>
        </div>
      </div>
    </footer>
  );
}
