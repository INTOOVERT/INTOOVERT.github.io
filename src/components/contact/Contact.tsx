import { socials } from "../../data/socials";
import { socialIconMap, ArrowIcon } from "../Icons";
import Reveal from "../ui/Reveal";

export default function Contact() {
  return (
    <section id="contact" className="surface-2 relative overflow-hidden py-28 md:py-40">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[50vmax] w-[50vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(193,104,92,0.12),transparent_60%)] blur-2xl" />

      <div className="container-px mx-auto max-w-5xl text-center">
        <Reveal>
          <p className="eyebrow">Contact</p>
        </Reveal>
        {/* <Reveal delay={0.06}>
          <h2 className="mx-auto mt-4 max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Let's build something
            <span className="text-accent-glow"> worth rendering.</span>
          </h2>
        </Reveal> */}

        {/* <Reveal delay={0.18}>
          <a
            href={email?.href}
            data-cursor="hover"
            className="group mt-9 inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 text-sm font-medium text-white shadow-glow transition hover:bg-accent-glow"
          >
            Start a project
            <ArrowIcon className="h-4 w-4 transition group-hover:translate-x-1" />
          </a>
        </Reveal> */}

        <div className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {socials.map((s, i) => {
            const Icon = socialIconMap[s.icon];
            return (
              <Reveal key={s.label} delay={(i % 3) * 0.05}>
                <a
                  href={s.href}
                  target={s.icon === "mail" ? undefined : "_blank"}
                  rel="noreferrer"
                  data-cursor="hover"
                  className="card-surface group flex items-center gap-4 rounded-2xl p-5 text-left"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent-glow ring-1 ring-accent/25 transition group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{s.label}</span>
                    <span className="block truncate text-xs opacity-55">{s.handle}</span>
                  </span>
                  <ArrowIcon className="ml-auto h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-60" />
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
