import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const CAROUSEL_SIZE = { width: 1080, height: 1080 };

const anchors = new Set(["kuwait-towers", "dhow-sail", "sadu-weave", "source-seal", "market-arch"]);
const themes = new Set(["dark", "paper"]);
const forbiddenPatterns = [
  /اشتر|للشراء|قم بالشراء|بيع الآن|بع الآن|اربح|عوائد مضمونة|أفضل سهم|توصيات يومية/i,
  /\b(buy|sell|hold|profit|guaranteed|premium|subscription|trial|paywall|pricing|unlock)\b/i,
  /Android|Google Play/i,
];

export async function loadCarousels(fileUrl = new URL("../content/carousels.json", import.meta.url)) {
  const contents = readFileSync(fileURLToPath(fileUrl), "utf8");
  const carousels = JSON.parse(contents);
  if (!Array.isArray(carousels)) {
    throw new Error("carousels.json must contain an array");
  }
  return carousels;
}

export function validateCarousel(carousel) {
  for (const field of ["id", "title", "platform", "theme", "anchor", "purpose", "slides"]) {
    if (!carousel[field]) throw new Error(`${carousel.id ?? "carousel"} missing ${field}`);
  }
  if (carousel.platform !== "instagram-carousel") throw new Error(`${carousel.id} must target Instagram carousel`);
  if (!themes.has(carousel.theme)) throw new Error(`${carousel.id} has unsupported theme`);
  if (!anchors.has(carousel.anchor)) throw new Error(`${carousel.id} has unsupported anchor`);
  if (!Array.isArray(carousel.slides) || carousel.slides.length !== 5) {
    throw new Error(`${carousel.id} must contain exactly five slides`);
  }

  carousel.slides.forEach((slide, index) => {
    for (const field of ["kicker", "headlineAr", "bodyAr", "labels"]) {
      if (!slide[field]) throw new Error(`${carousel.id} slide ${index + 1} missing ${field}`);
    }
    if (!Array.isArray(slide.labels) || slide.labels.length !== 3) {
      throw new Error(`${carousel.id} slide ${index + 1} needs three labels`);
    }
    const copy = [slide.kicker, slide.headlineAr, slide.bodyAr, ...slide.labels].join(" ");
    for (const pattern of forbiddenPatterns) {
      if (pattern.test(copy)) throw new Error(`${carousel.id} slide ${index + 1} contains blocked wording`);
    }
  });
}

export function buildCarouselSlideHtml(carousel, slideIndex, options = {}) {
  validateCarousel(carousel);
  const slide = carousel.slides[slideIndex];
  if (!slide) throw new Error(`${carousel.id} slide ${slideIndex + 1} not found`);

  const assetSrc = options.assetSrc ?? ((assetPath) => `../../../../${assetPath}`);
  const logoSrc = assetSrc("assets/app-icon-1024.png");
  const labels = slide.labels.map((label) => `<span>${escapeHtml(label)}</span>`).join("");
  const slideNumber = `${String(slideIndex + 1).padStart(2, "0")} / ${String(carousel.slides.length).padStart(2, "0")}`;

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=${CAROUSEL_SIZE.width}, initial-scale=1">
  <title>${escapeHtml(carousel.id)} ${slideIndex + 1}</title>
  <style>
    :root {
      --blue: #1148FF;
      --brand-blue: #578AFF;
      --dark: #0A0B0D;
      --ink: #090A0F;
      --paper: #F4F0E7;
      --white: #F8F8F3;
      --arabic: "IBM Plex Sans Arabic", "Noto Sans Arabic", "Geeza Pro", Arial, sans-serif;
      --latin: "Inter", "SF Pro Display", Arial, sans-serif;
      --mono: "JetBrains Mono", "SF Mono", Consolas, monospace;
    }

    * { box-sizing: border-box; }
    html, body {
      width: ${CAROUSEL_SIZE.width}px;
      height: ${CAROUSEL_SIZE.height}px;
      margin: 0;
      overflow: hidden;
      font-family: var(--arabic);
      background: var(--dark);
    }

    .slide {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      isolation: isolate;
      color: var(--white);
      background:
        radial-gradient(circle at 82% 12%, rgba(17,72,255,0.42), transparent 28%),
        linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px),
        linear-gradient(0deg, rgba(255,255,255,0.035) 1px, transparent 1px),
        var(--dark);
      background-size: auto, 76px 76px, 76px 76px, auto;
    }

    .slide[data-theme="paper"] {
      color: var(--ink);
      background:
        radial-gradient(circle at 18% 18%, rgba(17,72,255,0.16), transparent 28%),
        linear-gradient(90deg, rgba(10,11,13,0.06) 1px, transparent 1px),
        linear-gradient(0deg, rgba(10,11,13,0.045) 1px, transparent 1px),
        var(--paper);
      background-size: auto, 76px 76px, 76px 76px, auto;
    }

    .brand {
      position: absolute;
      z-index: 20;
      top: 58px;
      right: 62px;
      display: flex;
      align-items: center;
      gap: 14px;
      direction: ltr;
      font: 950 20px/1 var(--latin);
      letter-spacing: 0.06em;
    }
    .brand img { width: 44px; height: 44px; border-radius: 10px; }

    .number {
      position: absolute;
      top: 64px;
      left: 68px;
      direction: ltr;
      color: var(--brand-blue);
      font: 900 18px/1 var(--mono);
      letter-spacing: 0.06em;
      z-index: 20;
    }

    .anchor {
      position: absolute;
      z-index: 2;
      left: -8%;
      bottom: -7%;
      width: 58%;
      height: 58%;
      opacity: 0.42;
      color: currentColor;
    }
    .slide[data-anchor="sadu-weave"] .anchor { opacity: 0.7; }
    .slide[data-anchor="kuwait-towers"] .anchor { opacity: 0.55; width: 50%; height: 68%; }

    .kinetic {
      position: absolute;
      z-index: 4;
      inset: 0;
      pointer-events: none;
    }
    .kinetic::before {
      content: "";
      position: absolute;
      left: -8%;
      top: 40%;
      width: 78%;
      height: 15%;
      background: var(--blue);
      clip-path: polygon(0 34%, 16% 10%, 31% 42%, 52% 5%, 70% 38%, 100% 12%, 100% 70%, 72% 88%, 52% 54%, 30% 92%, 14% 62%, 0 80%);
      transform: rotate(-7deg);
      opacity: 0.9;
    }
    .kinetic::after {
      content: "";
      position: absolute;
      left: 12%;
      bottom: 16%;
      width: 58%;
      height: 8px;
      background: rgba(255,255,255,0.82);
      transform: rotate(-12deg);
      box-shadow: 0 56px 0 rgba(87,138,255,0.58);
    }

    .content {
      position: absolute;
      z-index: 12;
      right: 72px;
      top: 178px;
      width: 64%;
      text-align: right;
      isolation: isolate;
    }
    .copy-plate {
      position: absolute;
      z-index: -1;
      inset: -36px -34px -30px -56px;
      background: linear-gradient(90deg, rgba(10,11,13,0), rgba(10,11,13,0.86) 10%, rgba(10,11,13,0.94));
    }
    .slide[data-theme="paper"] .copy-plate {
      background: linear-gradient(90deg, rgba(244,240,231,0), rgba(244,240,231,0.96) 10%, rgba(244,240,231,0.98));
    }
    .kicker {
      display: block;
      margin-bottom: 18px;
      direction: ltr;
      color: var(--brand-blue);
      font: 900 16px/1.3 var(--mono);
      text-transform: uppercase;
    }
    h1 {
      margin: 0;
      font-size: 104px;
      line-height: 0.96;
      font-weight: 950;
      letter-spacing: 0;
      text-wrap: balance;
    }
    p {
      width: min(100%, 680px);
      margin: 28px 0 0 auto;
      font-size: 35px;
      line-height: 1.45;
      font-weight: 780;
    }
    .labels {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      gap: 10px;
      margin-top: 32px;
      direction: rtl;
    }
    .labels span {
      padding: 9px 13px 10px;
      border: 2px solid currentColor;
      font-size: 20px;
      line-height: 1;
      font-weight: 950;
      background: rgba(255,255,255,0.08);
    }
    .footer {
      position: absolute;
      z-index: 22;
      left: 64px;
      right: 64px;
      bottom: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      direction: ltr;
      font: 900 18px/1 var(--mono);
      color: currentColor;
    }
    .url {
      padding: 11px 14px;
      color: #fff;
      background: var(--blue);
    }
    .cta {
      direction: rtl;
      font-family: var(--arabic);
      font-size: 22px;
    }
  </style>
</head>
<body>
  <main class="slide" data-theme="${escapeAttribute(carousel.theme)}" data-anchor="${escapeAttribute(carousel.anchor)}">
    <div class="brand" aria-hidden="true"><span>BOURSATI</span><img alt="" src="${escapeAttribute(logoSrc)}"></div>
    <div class="number">${slideNumber}</div>
    <div class="anchor anchor-${escapeAttribute(carousel.anchor)}" aria-hidden="true">${buildAnchorSvg(carousel.anchor)}</div>
    <div class="kinetic" aria-hidden="true"></div>
    <section class="content">
      <span class="copy-plate" aria-hidden="true"></span>
      <span class="kicker">${escapeHtml(slide.kicker)}</span>
      <h1>${escapeHtml(slide.headlineAr)}</h1>
      <p>${escapeHtml(slide.bodyAr)}</p>
      <div class="labels">${labels}</div>
    </section>
    <footer class="footer">
      <span class="url">boursati.app</span>
      <span class="cta">حمّل بورصتي من App Store</span>
    </footer>
  </main>
</body>
</html>`;
}

function buildAnchorSvg(anchor) {
  if (anchor === "kuwait-towers") {
    return `<svg viewBox="0 0 520 720"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><g stroke-width="10"><path d="M300 680 C310 556 315 454 332 406 C342 377 345 320 342 280 C338 226 342 184 352 112"/><path d="M386 680 C374 556 369 454 352 406 C342 377 339 320 342 280 C346 226 356 184 364 112" opacity="0.82"/><path d="M112 680 C120 560 126 448 144 382 C154 346 158 304 154 260 C150 206 156 160 166 94"/><path d="M188 680 C180 560 174 448 158 382 C148 346 144 304 148 260 C152 206 160 160 172 94" opacity="0.82"/></g><g stroke-width="7"><path d="M352 112 L356 18"/><path d="M364 112 L356 18" opacity="0.72"/><path d="M166 94 L174 30"/><path d="M172 94 L174 30" opacity="0.72"/></g><g stroke-width="8"><circle cx="338" cy="348" r="86"/><circle cx="352" cy="154" r="58"/><circle cx="152" cy="334" r="78"/></g><path d="M52 680 H430" stroke-width="10" opacity="0.78"/></g></svg>`;
  }
  if (anchor === "sadu-weave") {
    return `<svg viewBox="0 0 720 740"><rect width="720" height="740" fill="rgba(255,255,255,0.16)"/><g fill="currentColor">${Array.from({ length: 8 }, (_, row) => Array.from({ length: 7 }, (_, col) => { const x = 30 + col * 96; const y = 44 + row * 82; const opacity = (row + col) % 2 ? "0.22" : "0.54"; return `<path d="M${x} ${y + 34} L${x + 40} ${y} L${x + 80} ${y + 34} L${x + 40} ${y + 68} Z" opacity="${opacity}" />`; }).join("")).join("")}</g><g stroke="#1148FF" stroke-width="14" opacity="0.78"><path d="M0 170 H720"/><path d="M0 492 H720"/></g></svg>`;
  }
  if (anchor === "market-arch") {
    return `<svg viewBox="0 0 660 700"><g fill="none" stroke="currentColor" stroke-width="9"><path d="M80 650 V300 C80 152 196 54 330 54 C464 54 580 152 580 300 V650"/><path d="M164 650 V318 C164 218 232 150 330 150 C428 150 496 218 496 318 V650" opacity="0.72"/><path d="M72 650 H590"/><path d="M112 504 H548" opacity="0.55"/></g><g fill="#1148FF" opacity="0.72"><rect x="100" y="590" width="66" height="28"/><rect x="496" y="590" width="66" height="28"/></g></svg>`;
  }
  if (anchor === "dhow-sail") {
    return `<svg viewBox="0 0 760 760"><g fill="none" stroke="currentColor" stroke-width="8"><path d="M92 620 C214 684 486 686 680 602"/><path d="M182 602 L420 78 L590 602"/><path d="M420 78 C300 206 256 382 182 602" fill="rgba(17,72,255,0.26)"/><path d="M420 78 C506 258 538 414 590 602" fill="rgba(255,255,255,0.1)"/><path d="M134 620 C244 714 512 716 690 600"/></g></svg>`;
  }
  return `<svg viewBox="0 0 560 560"><g fill="none" stroke="currentColor" stroke-width="9"><circle cx="280" cy="280" r="224"/><circle cx="280" cy="280" r="158"/><path d="M110 280 H450"/><path d="M280 110 V450"/><path d="M164 164 L396 396" opacity="0.55"/><path d="M396 164 L164 396" opacity="0.55"/><circle cx="280" cy="280" r="18" fill="currentColor" stroke="none" opacity="0.82"/></g></svg>`;
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}
