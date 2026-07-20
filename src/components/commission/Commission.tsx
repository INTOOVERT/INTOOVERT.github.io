import { useMemo, useState } from "react";
import { socials } from "../../data/socials";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import { ArrowIcon } from "../Icons";

/**
 * Direct order / contact form. Composes an email to the site owner; a small
 * math captcha plus a hidden honeypot field keeps bots and spam out.
 */

const topics = [
  "Order a commission",
  "Work / collaboration",
  "General question",
] as const;

function makeCaptcha() {
  const a = 2 + Math.floor(Math.random() * 7);
  const b = 2 + Math.floor(Math.random() * 7);
  return { a, b, answer: a + b };
}

export default function Commission() {
  const email = socials.find((s) => s.icon === "mail")?.handle ?? "";
  const [topic, setTopic] = useState<(typeof topics)[number]>(topics[0]);
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");
  const [captcha, setCaptcha] = useState(makeCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mailto = useMemo(() => {
    const subject = `${topic} · from ${name || "website visitor"}`;
    const body = [
      `Hi Muhtasim,`,
      ``,
      `Topic:   ${topic}`,
      `Name:    ${name || "-"}`,
      `Contact: ${from || "-"}`,
      ``,
      message || "-",
    ].join("\n");
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [email, topic, name, from, message]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // bot filled the hidden field
    if (Number(captchaInput.trim()) !== captcha.answer) {
      setError("Captcha answer is wrong, try again.");
      setCaptcha(makeCaptcha());
      setCaptchaInput("");
      return;
    }
    if (!message.trim()) {
      setError("Tell me a little about what you need first.");
      return;
    }
    setError(null);
    window.location.href = mailto;
  };

  return (
    <section id="order" className="relative py-28 md:py-36">
      <div className="pointer-events-none absolute right-[5%] top-[10%] -z-10 h-[36vmax] w-[36vmax] rounded-full bg-[radial-gradient(circle,rgba(193,104,92,0.08),transparent_60%)] blur-2xl" />

      <div className="container-px mx-auto max-w-4xl">
        <SectionHeading
          eyebrow="Order · Commission"
          title="Order or just say hi"
          description="Want to commission a model, talk about work, or ask something? Write below and it lands straight in my inbox. We'll figure out scope, timing and price together."
        />

        <Reveal delay={0.14}>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed opacity-70 sm:text-base">
            Open to commissions, collaborations and freelance 3D work: characters, game
            assets, prints and interactive visuals. Ready to order? Use the form below or just
            say hi.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <form
            className="card-surface mt-10 grid gap-4 rounded-2xl p-6 md:grid-cols-2 md:p-8"
            onSubmit={submit}
          >
            {/* honeypot: invisible to people, tempting to bots */}
            <input
              type="text"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />

            <label className="grid gap-1.5 text-xs uppercase tracking-wider opacity-80">
              Your name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="rounded-xl border border-hairline bg-transparent px-4 py-3 text-sm normal-case tracking-normal outline-none transition placeholder:opacity-40 focus:border-accent-glow"
              />
            </label>
            <label className="grid gap-1.5 text-xs uppercase tracking-wider opacity-80">
              Email / Discord
              <input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="you@studio.com"
                className="rounded-xl border border-hairline bg-transparent px-4 py-3 text-sm normal-case tracking-normal outline-none transition placeholder:opacity-40 focus:border-accent-glow"
              />
            </label>
            <label className="grid gap-1.5 text-xs uppercase tracking-wider opacity-80 md:col-span-2">
              What is this about?
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value as (typeof topics)[number])}
                className="rounded-xl border border-hairline bg-transparent px-4 py-3 text-sm normal-case tracking-normal outline-none transition focus:border-accent-glow [&>option]:bg-[color:var(--bg)]"
              >
                {topics.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-xs uppercase tracking-wider opacity-80 md:col-span-2">
              Message
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="What are we building? References, style, intended use (game / print / render)..."
                className="resize-y rounded-xl border border-hairline bg-transparent px-4 py-3 text-sm normal-case tracking-normal outline-none transition placeholder:opacity-40 focus:border-accent-glow"
              />
            </label>

            <label className="grid gap-1.5 text-xs uppercase tracking-wider opacity-80">
              Quick check: {captcha.a} + {captcha.b} = ?
              <input
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                inputMode="numeric"
                placeholder="Answer"
                className="rounded-xl border border-hairline bg-transparent px-4 py-3 text-sm normal-case tracking-normal outline-none transition placeholder:opacity-40 focus:border-accent-glow"
              />
            </label>

            <div className="flex flex-wrap items-end gap-4 md:col-span-1">
              <button
                type="submit"
                data-cursor="hover"
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-white shadow-glow transition hover:bg-accent-glow"
              >
                Send message
                <ArrowIcon className="h-4 w-4 transition group-hover:translate-x-1" />
              </button>
            </div>

            <p className="text-xs leading-relaxed opacity-50 md:col-span-2">
              {error ? (
                <span className="text-accent-glow">{error}</span>
              ) : (
                "Opens your mail app with everything pre-filled, addressed directly to me."
              )}
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
