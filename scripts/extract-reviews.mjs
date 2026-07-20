// One-off: extract real reviews from the saved Fiverr profile page (.fiverr.html).
import fs from "node:fs";

const html = fs.readFileSync(new URL("../.fiverr.html", import.meta.url), "utf8");

const out = [];
const re = /review-description"><p>([\s\S]*?)<\/p>/g;
let m;
while ((m = re.exec(html))) {
  const idx = m.index;
  const before = html.slice(Math.max(0, idx - 9000), idx);

  const names = [...before.matchAll(/data-track-tag="avatar" data-track-value="([^"]+)"/g)];
  const name = names.length ? names[names.length - 1][1] : "?";

  const countries = [...before.matchAll(/country-flag"[^>]*alt="([A-Z]{2})"[^>]*\/>\s*<p[^>]*>([^<]+)<\/p>/g)];
  const country = countries.length ? countries[countries.length - 1] : null;

  const ratings = [...before.matchAll(/rating-score[^"]*">([\d.]+)<\/strong>/g)];
  const rating = ratings.length ? ratings[ratings.length - 1][1] : "?";

  const times = [...before.matchAll(/<time>([^<]+)<\/time>/g)];
  const time = times.length ? times[times.length - 1][1] : "?";

  const after = html.slice(idx, idx + 6000);
  const price = after.match(/>([€$][\d,]+-?[€$]?[\d,]*|Up to [€$][\d,]+)</)?.[1] ?? "?";
  const duration = after.match(/>(\d+ (?:day|week|month)s?)</)?.[1] ?? "?";
  const gig = after.match(/href="\/cgrawr\/([^"]+)"/)?.[1] ?? "?";
  const gigTitle = after.match(/height="33px"\/><p[^>]*>([^<]+)<\/p>/)?.[1] ?? "?";

  out.push({
    name,
    countryCode: country ? country[1] : "?",
    country: country ? country[2] : "?",
    rating: Number(rating),
    time,
    text: m[1].replace(/<br\s*\/?>/g, "\n").trim(),
    price,
    duration,
    gig,
    gigTitle,
  });
}

console.log(JSON.stringify(out, null, 2));
