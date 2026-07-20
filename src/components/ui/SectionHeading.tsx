import Reveal from "./Reveal";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <Reveal>
        <p className="eyebrow">{eyebrow}</p>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={0.12}>
          <p className="mt-4 text-sm leading-relaxed opacity-70 sm:text-base">{description}</p>
        </Reveal>
      )}
    </div>
  );
}
