import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import HolographicCard from "./HolographicCard";

const stats = [
  { value: "4.7★", label: "Fiverr rating" },
  { value: "50+", label: "Client projects" },
  { value: "5+ yrs", label: "In 3D" },
];

export default function About() {
  return (
    <section id="about" className="surface-2 relative py-28 md:py-36">
      <div className="container-px mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        {/* portrait panel */}
        <Reveal>
          <HolographicCard />
        </Reveal>

        <div>
          <SectionHeading
            eyebrow="About"
            title="3D artist & electrical engineering student"
          />
          <Reveal delay={0.1}>
            <div className="mt-6 space-y-4 text-sm leading-relaxed opacity-80 sm:text-base">
              <p>
                I'm Muhtasim Khan, a 3D artist based in{" "}
                <span className="text-accent-glow">Lithuania</span>, studying Electrical
                Engineering at <span className="text-accent-glow">Kaunas University of Technology</span>.
                I model, sculpt and render for clients and personal work.
              </p>
              <p>
          
              </p>
              <p>
              
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-8 flex flex-wrap gap-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-3xl font-semibold text-accent-glow">
                    {s.value}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-wider opacity-55">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
