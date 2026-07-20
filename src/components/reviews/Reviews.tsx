import { reviews } from "../../data/reviews";
import { FIVERR_URL } from "../../data/socials";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";

function flag(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-accent-warm">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
          fill={i < Math.round(rating) ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path d="M12 2l3 6.5 7 .9-5 4.8 1.3 7L12 17.8 5.4 21.2 6.7 14.2 1.7 9.4l7-.9z" />
        </svg>
      ))}
      <span className="ml-1.5 font-mono text-xs opacity-60">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function Reviews() {
  return (
    <section id="reviews" className="surface-1 relative py-28 md:py-36">
      <div className="container-px mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Client Words"
            title="Trusted by clients worldwide"
            description="Real reviews, quoted word-for-word from verified Fiverr orders."
          />
          <Reveal delay={0.1}>
            <a
              href={FIVERR_URL}
              target="_blank"
              rel="noreferrer"
              data-cursor="hover"
              className="shrink-0 rounded-full px-5 py-2.5 text-sm ring-1 ring-[color:var(--card-border-hover)] transition hover:bg-[color:var(--card-bg-hover)]"
            >
              See all on Fiverr →
            </a>
          </Reveal>
        </div>

        <div className="mt-14 columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
          {reviews.map((r, i) => (
            <Reveal key={r.name} delay={(i % 3) * 0.06}>
              <figure className="card-surface break-inside-avoid rounded-2xl p-6">
                <div className="mb-3 flex items-center justify-between">
                  <Stars rating={r.rating} />
                  <span className="text-lg" title={r.country}>
                    {flag(r.countryCode)}
                  </span>
                </div>
                <blockquote className="text-sm leading-relaxed opacity-85">
                  "{r.text}"
                </blockquote>
                <figcaption className="mt-4 flex items-center justify-between border-t border-hairline pt-3">
                  <div>
                    <div className="text-sm font-medium">{r.name}</div>
                    <div className="text-xs opacity-55">
                      {r.country} · {r.when}
                    </div>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider opacity-45">
                    {r.project}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
