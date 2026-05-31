import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const campaignRoot = resolve(scriptDir, "..");
const exportsRoot = resolve(campaignRoot, "exports");
const packagesRoot = resolve(campaignRoot, "packages");
const platformRoot = resolve(packagesRoot, "platform-static-v1");
const launchRoot = resolve(packagesRoot, "launch-batch-v1");
const contentPlanRoot = resolve(campaignRoot, "content-plan");
const assets = JSON.parse(readFileSync(resolve(campaignRoot, "content/assets.json"), "utf8"));
const carousels = JSON.parse(readFileSync(resolve(campaignRoot, "content/carousels.json"), "utf8"));

const launchBatchIds = [
  "grid-01-launch-pocket",
  "grid-02-market-summary",
  "grid-03-disclosure-source",
  "grid-04-company-context",
  "grid-05-boursati-center",
  "grid-06-portfolio-clear",
  "grid-07-alerts",
  "grid-08-all-paths",
  "grid-09-download",
  "feed-01-launch-portrait",
  "feed-02-market-clarity",
  "proof-01-home-summary",
  "proof-02-disclosures",
  "proof-03-portfolio",
  "bank-01-info-news-vs-disclosure",
  "bank-03-market-morning",
  "bank-05-info-ticker",
  "vertical-02-disclosure",
  "x-02-disclosure",
];

const platformFolders = {
  "instagram-grid": "instagram-grid",
  "instagram-square": "instagram-feed",
  "instagram-portrait": "instagram-feed",
  "instagram-story": "instagram-stories",
  "reels-tiktok": "reels-tiktok-covers",
  tiktok: "reels-tiktok-covers",
  x: "x-banners",
};

const reviewOverrides = {
  "x-01-launch": {
    status: "needs polish",
    reason: "Phone-led X banner is useful, but should be visually rechecked before posting because phone mockups are higher risk.",
  },
};

function assetPath(asset) {
  return resolve(exportsRoot, `${asset.id}.png`);
}

function relativeAssetPath(asset) {
  return `exports/${asset.id}.png`;
}

function purposeFor(asset) {
  if (asset.id.startsWith("grid-")) return "Launch profile grid";
  if (asset.family === "product-proof" || asset.family === "phone-hero-banner") return "Product proof";
  if (asset.family === "market-summary-tip") return "Market summary habit";
  if (asset.family === "daily-tip") return "Education / daily tip";
  if (asset.family === "featured-grid") return "Feature education";
  if (asset.family === "market-card") return "Market habit";
  if (asset.family === "announcement") return "Feature context";
  return "Launch awareness";
}

function statusFor(asset) {
  if (reviewOverrides[asset.id]) return reviewOverrides[asset.id].status;
  if (launchBatchIds.includes(asset.id)) return "approved for Launch Batch V1";
  if (asset.family === "product-proof") return "approved after screenshot review";
  if (asset.platform === "x") return "caption ready";
  if (asset.id.startsWith("bank-")) return "rotation candidate";
  return "caption ready";
}

function reasonFor(asset) {
  if (reviewOverrides[asset.id]) return reviewOverrides[asset.id].reason;
  if (launchBatchIds.includes(asset.id)) return "Selected for first launch wave because message and format match the launch narrative.";
  if (asset.family === "product-proof") return "Use when real app proof is needed; confirm screenshots remain acceptable before posting.";
  if (asset.id.startsWith("bank-")) return "Useful for ongoing daily education and market-summary rotation after the first wave.";
  return "Usable static asset, keep in platform package for scheduling.";
}

function captionFor(asset) {
  const cta = "حمّل بورصتي من App Store.";

  const captions = {
    "grid-01-launch-pocket": `بورصة الكويت في جيبك.\n\nبورصتي يجمع أهم مسارات المتابعة في تطبيق عربي واحد: الأسعار، الأخبار، الإفصاحات، الشركات، والمحفظة.\n\n${cta}`,
    "grid-02-market-summary": `ابدأ من الصورة الأكبر.\n\nملخص السوق يساعدك تبدأ القراءة قبل الدخول في تفاصيل الشركات.\n\n${cta}`,
    "grid-03-disclosure-source": `المصدر أولاً.\n\nالإفصاح الرسمي هو بداية القراءة، لا نهايتها.\n\n${cta}`,
    "grid-04-company-context": `الخبر يحتاج شركة.\n\nاقرأ الخبر، ثم ارجع إلى الشركة التي يتحرك حولها السياق.\n\n${cta}`,
    "grid-05-boursati-center": `بورصتي.\n\nطريقة أوضح لمتابعة بورصة الكويت من هاتفك.\n\n${cta}`,
    "grid-06-portfolio-clear": `محفظتك كدفتر واضح.\n\nمكوناتك وتوزيعاتك المتوقعة مرتبة للمراجعة السريعة.\n\n${cta}`,
    "grid-07-alerts": `التنبيه يفتح المسار.\n\nمن الإشعار إلى الإفصاح، ثم إلى تفاصيل الشركة.\n\n${cta}`,
    "grid-08-all-paths": `كل مسار له مكان.\n\nالشركات، الإفصاحات، الأخبار، والمحفظة ضمن نظام واضح للمتابعة.\n\n${cta}`,
    "grid-09-download": `جرّب بورصتي.\n\nمتاح الآن على App Store لمتابعة بورصة الكويت.\n\n${cta}`,
    "feed-01-launch-portrait": `بورصة الكويت في جيبك.\n\nأسعار، أخبار، إفصاحات، ومحفظتك في تطبيق عربي واحد.\n\n${cta}`,
    "feed-02-market-clarity": `تابع السوق بدون لويه.\n\nابدأ من ملخص واضح، ثم ادخل في التفاصيل التي تهمك.\n\n${cta}`,
    "proof-01-home-summary": `ملخص السوق أمامك.\n\nلقطة حقيقية من بورصتي لبداية أوضح قبل التفاصيل.\n\n${cta}`,
    "proof-02-disclosures": `الإفصاحات في مسار واضح.\n\nمن الشركة إلى الإعلان الرسمي، ثم إلى سياق المتابعة.\n\n${cta}`,
    "proof-03-portfolio": `محفظتك في صورة واحدة.\n\nتابع مكوناتك وتوزيعاتك المتوقعة ضمن تجربة عربية واضحة.\n\n${cta}`,
    "bank-01-info-news-vs-disclosure": `خبر أم إفصاح؟\n\nالخبر يشرح الحدث. الإفصاح هو المصدر الرسمي من الشركة.\n\n${cta}`,
    "bank-03-market-morning": `قبل افتتاح السوق.\n\nراجع الأخبار الأخيرة، الإفصاحات الجديدة، والشركات في قائمتك.\n\n${cta}`,
    "bank-05-info-ticker": `رمز الشركة اختصار.\n\nالرمز يساعدك توصل للشركة بسرعة، لكنه لا يغني عن قراءة التفاصيل.\n\n${cta}`,
    "vertical-02-disclosure": `وصل إفصاح؟\n\nافتح التنبيه، اقرأ المصدر، ثم راجع تفاصيل الشركة.\n\n${cta}`,
    "x-02-disclosure": `الإفصاح الرسمي أولاً.\n\nالخبر مهم، لكن المصدر هو البداية الأوضح للقراءة.\n\n${cta}`,
  };

  return captions[asset.id] ?? `${asset.headlineAr}\n\n${asset.sublineAr}\n\n${cta}`;
}

function platformForCaption(asset) {
  if (asset.platform === "x") return "X";
  if (["instagram-story", "reels-tiktok", "tiktok"].includes(asset.platform)) return "Stories/Reels/TikTok";
  return "Instagram";
}

await rm(packagesRoot, { recursive: true, force: true });
await mkdir(platformRoot, { recursive: true });
await mkdir(launchRoot, { recursive: true });

for (const asset of assets) {
  const source = assetPath(asset);
  if (!existsSync(source)) throw new Error(`Missing export: ${source}`);

  const folder = platformFolders[asset.platform];
  const destinationFolder = resolve(platformRoot, folder);
  await mkdir(destinationFolder, { recursive: true });
  await copyFile(source, resolve(destinationFolder, `${asset.id}.png`));
}

const carouselDestination = resolve(platformRoot, "carousels");
await mkdir(carouselDestination, { recursive: true });
for (const carousel of carousels) {
  const carouselFolder = resolve(carouselDestination, carousel.id);
  await mkdir(carouselFolder, { recursive: true });
  for (const [index] of carousel.slides.entries()) {
    const slide = String(index + 1).padStart(2, "0");
    const source = resolve(exportsRoot, `carousels/${carousel.id}-s${slide}.png`);
    if (!existsSync(source)) throw new Error(`Missing carousel slide: ${source}`);
    await copyFile(source, resolve(carouselFolder, `${carousel.id}-s${slide}.png`));
  }
}

for (const id of launchBatchIds) {
  const asset = assets.find((candidate) => candidate.id === id);
  if (!asset) throw new Error(`Unknown launch batch asset: ${id}`);
  const folder = asset.platform === "x" ? "x-banners" : ["instagram-story", "reels-tiktok", "tiktok"].includes(asset.platform) ? "stories-reels" : "instagram-feed";
  const destinationFolder = resolve(launchRoot, folder);
  await mkdir(destinationFolder, { recursive: true });
  await copyFile(assetPath(asset), resolve(destinationFolder, `${asset.id}.png`));
}

const reviewRows = assets.map((asset) => {
  return `| \`${asset.id}\` | \`${relativeAssetPath(asset)}\` | ${asset.platform} | ${purposeFor(asset)} | ${statusFor(asset)} | ${reasonFor(asset)} |`;
});

const reviewTable = `# Static Asset Review Table

This table is the first-pass review inventory for static Boursati launch assets. Video drafts are intentionally excluded.

| Asset | File | Platform | Purpose | Status | Notes |
|---|---|---|---|---|---|
${reviewRows.join("\n")}

## Status Meanings

- \`approved for Launch Batch V1\`: selected for the first posting package.
- \`approved after screenshot review\`: usable product proof, but check the screenshot before publishing.
- \`caption ready\`: usable after final caption pairing.
- \`rotation candidate\`: good for ongoing posts after launch.
- \`needs polish\`: do not publish until visually rechecked.
`;

const launchRows = launchBatchIds.map((id, index) => {
  const asset = assets.find((candidate) => candidate.id === id);
  return `| ${index + 1} | \`${asset.id}\` | ${asset.platform} | ${purposeFor(asset)} | \`${relativeAssetPath(asset)}\` |`;
});

const launchReadme = `# Launch Batch V1

This folder contains the first approved static posting batch. It excludes promo video drafts and keeps the launch package focused on the strongest static assets.

## Contents

- \`instagram-feed/\`: feed, grid, and product-proof assets.
- \`stories-reels/\`: vertical story/reel cover assets.
- \`x-banners/\`: X launch assets.
- \`captions-final.md\`: final captions for this first batch.

## Posting Order

| Order | Asset | Platform | Purpose | Source |
|---:|---|---|---|---|
${launchRows.join("\n")}
`;

const captions = `# Launch Batch V1 Final Captions

These captions are ready for manual review before posting. They keep the tone Arabic-first, clear, App Store-only, and non-advisory.

${launchBatchIds
  .map((id, index) => {
    const asset = assets.find((candidate) => candidate.id === id);
    return `## ${index + 1}. ${asset.id}

**Platform:** ${platformForCaption(asset)}

${captionFor(asset)}
`;
  })
  .join("\n")}
`;

const platformReadme = `# Platform Static Package V1

This package organizes the approved static asset bank by publishing surface.

## Folders

- \`instagram-feed/\`: square and portrait Instagram feed assets.
- \`instagram-grid/\`: the nine-tile launch profile wall.
- \`instagram-stories/\`: vertical story assets.
- \`reels-tiktok-covers/\`: vertical covers for short-form posts.
- \`x-banners/\`: X/Twitter banner assets.
- \`carousels/\`: four five-slide educational carousel sequences.

Use \`../launch-batch-v1/\` for the first posting package.
`;

await writeFile(resolve(contentPlanRoot, "static-asset-review-table.md"), reviewTable, "utf8");
await writeFile(resolve(platformRoot, "README.md"), platformReadme, "utf8");
await writeFile(resolve(launchRoot, "README.md"), launchReadme, "utf8");
await writeFile(resolve(launchRoot, "captions-final.md"), captions, "utf8");

console.log("packaged static launch assets");
