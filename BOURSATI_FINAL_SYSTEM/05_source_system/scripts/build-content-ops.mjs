import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const campaignRoot = resolve(scriptDir, "..");
const projectRoot = resolve(campaignRoot, "..");
const contentPlanRoot = resolve(campaignRoot, "content-plan");
const exportsRoot = resolve(campaignRoot, "exports");
const assets = JSON.parse(readFileSync(resolve(campaignRoot, "content/assets.json"), "utf8"));

const platformNames = {
  "instagram-grid": "Instagram Grid",
  "instagram-square": "Instagram Feed Square",
  "instagram-portrait": "Instagram Feed Portrait",
  "instagram-story": "Instagram Story",
  "reels-tiktok": "Reels / TikTok",
  tiktok: "TikTok",
  x: "X / Twitter",
};

const familyNames = {
  "launch-poster": "Launch Poster",
  "market-card": "Market Card",
  "featured-grid": "Featured Grid",
  "vertical-cover": "Vertical Cover",
  announcement: "Announcement",
  "product-proof": "Product Proof",
  "phone-hero-banner": "Phone Hero Banner",
  "daily-tip": "Tip / Info Of The Day",
  "market-summary-tip": "Market Summary Tip",
};

const captionBank = {
  launch: {
    instagram:
      "بورصتي يجمع أهم مسارات متابعة بورصة الكويت في تطبيق عربي واحد: الأسعار، الأخبار، الإفصاحات، الشركات، والمحفظة.\n\nحمّل بورصتي من App Store.",
    x:
      "بورصتي: متابعة أوضح لبورصة الكويت من تطبيق عربي واحد. الأسعار، الأخبار، الإفصاحات، الشركات، والمحفظة.\n\nحمّله من App Store.",
    vertical:
      "بورصتي يجمع لك أهم مسارات متابعة بورصة الكويت في مكان واحد. حمّله من App Store.",
  },
  market: {
    instagram:
      "قبل ما تدخل في تفاصيل الشركات، ابدأ من الصورة العامة للسوق. بورصتي يساعدك تبدأ المتابعة اليومية بوضوح أكبر.\n\nحمّل بورصتي من App Store.",
    x:
      "ابدأ من الصورة العامة للسوق، ثم افتح الشركات والإفصاحات التي تهمك. بورصتي على App Store.",
    vertical:
      "ملخص السوق بسرعة: ما الجديد؟ ما الذي تحرك؟ وما الذي يحتاج مراجعة؟",
  },
  disclosure: {
    instagram:
      "الخبر يعطيك عنوان. الإفصاح يعطيك المصدر. في بورصتي، اجعل القراءة تبدأ من المصدر الرسمي ثم انتقل إلى سياق الشركة.\n\nحمّل بورصتي من App Store.",
    x:
      "الإفصاح الرسمي أولاً. الخبر مهم، لكن المصدر هو البداية الأوضح للقراءة.",
    vertical:
      "وصل تنبيه؟ افتح الإفصاح، اقرأ المصدر، ثم راجع تفاصيل الشركة.",
  },
  company: {
    instagram:
      "لا تقرأ الخبر وحده. اربطه بالشركة، الإفصاح، والبيانات المتاحة حتى تكون الصورة أوضح.\n\nحمّل بورصتي من App Store.",
    x:
      "صفحة الشركة هي نقطة الرجوع: السعر، الأخبار، الإفصاحات، والبيانات في مسار واحد.",
    vertical:
      "افتح الشركة: السعر، الأخبار، الإفصاحات، والبيانات في مكان واحد.",
  },
  portfolio: {
    instagram:
      "محفظتك تحتاج وضوح أكثر من رقم واحد. تابع المكونات، التوزيع، والتوزيعات المتوقعة ضمن تجربة عربية مرتبة.\n\nحمّل بورصتي من App Store.",
    x:
      "محفظتك أوضح عندما ترى المكونات والتوزيعات المتوقعة ضمن مكان واحد.",
    vertical:
      "محفظتك مو بس رقم. راجع المكونات والتوزيعات المتوقعة بهدوء.",
  },
  learning: {
    instagram:
      "معلومة اليوم: كل قراءة أفضل تبدأ بسؤال واضح: ما المصدر؟ ابدأ من الإفصاح الرسمي، ثم اقرأ الخبر أو التحليل بعده.\n\nحمّل بورصتي من App Store.",
    x:
      "معلومة اليوم: الخبر يشرح، لكن الإفصاح هو المصدر الرسمي.",
    vertical:
      "معلومة اليوم: اسأل أولاً، ما المصدر؟",
  },
  dailyTip: {
    instagram:
      "نصيحة اليوم: رتّب متابعتك. ابدأ من المصدر، راجع الشركة، ثم ضع ما يهمك في قائمتك.\n\nحمّل بورصتي من App Store.",
    x:
      "نصيحة اليوم: ابدأ من المصدر، ثم اقرأ سياق الشركة.",
    vertical:
      "نصيحة اليوم: لا تقرأ العنوان وحده. ارجع للمصدر.",
  },
};

const statuses = {
  grid: "Ready for launch grid review",
  feed: "Ready for caption review",
  proof: "Ready for visual proof review",
  bank: "Ready for rotation review",
  x: "Ready for X copy review",
  vertical: "Ready for short-form review",
};

const purposeOverrides = {
  "feed-02-market-clarity": "Market summary habit",
  "feed-03-disclosures": "Disclosure literacy",
  "feed-04-company-depth": "Company context",
  "feed-06-watchlist": "Watchlist habit",
  "feed-08-learning": "Educational content",
  "x-02-disclosure": "Disclosure literacy",
  "bank-01-info-news-vs-disclosure": "Disclosure literacy",
  "bank-06-tip-watchlist": "Watchlist habit",
  "bank-08-tip-notification-path": "Disclosure literacy",
  "bank-10-info-dividends": "Educational content",
  "bank-22-tip-before-following": "Company context",
  "bank-25-x-education-thread": "Educational content",
};

function purposeFor(asset) {
  const id = asset.id;
  const text = [id, asset.headlineAr, asset.sublineAr, asset.contextAr, ...asset.labels].join(" ");

  if (purposeOverrides[id]) return purposeOverrides[id];
  if (id.startsWith("grid-")) return "Launch profile grid";
  if (asset.family === "product-proof" || asset.family === "phone-hero-banner") return "Product proof";
  if (asset.family === "launch-poster") return "Launch awareness";
  if (asset.family === "market-summary-tip") return "Market summary habit";
  if (asset.family === "daily-tip") {
    if (/ticker|company|شركة|رمز|قطاع/i.test(text)) return "Company context";
    if (/portfolio|محفظ|توزيع/i.test(text)) return "Portfolio clarity";
    if (/market|سوق|ملخص|افتتاح|إغلاق/i.test(text)) return "Market summary habit";
    if (/disclosure|source|إفصاح|مصدر|تنبيه/i.test(text)) return "Disclosure literacy";
    return "Educational content";
  }
  if (/portfolio|محفظ|توزيع/i.test(text)) return "Portfolio clarity";
  if (/market|سوق|ملخص|افتتاح|إغلاق/i.test(text)) return "Market summary habit";
  if (/شركة|رمز|قطاع|company/i.test(text)) return "Company context";
  if (/إفصاح|مصدر|تنبيه|disclosure|source/i.test(text)) return "Disclosure literacy";
  if (/معلومة|تعلم|مفاهيم|info|tip|learning/i.test(text)) return "Educational content";
  return "Launch awareness";
}

function captionKeyFor(asset) {
  const purpose = purposeFor(asset);
  if (purpose === "Market summary habit") return "market";
  if (purpose === "Disclosure literacy") return "disclosure";
  if (purpose === "Portfolio clarity") return "portfolio";
  if (purpose === "Company context") return "company";
  if (purpose === "Watchlist habit") return "dailyTip";
  if (purpose === "Educational content") return asset.family === "daily-tip" ? "dailyTip" : "learning";
  if (asset.id.startsWith("grid-") || asset.family === "launch-poster") return "launch";
  return "launch";
}

function captionFor(asset) {
  if (asset.platform === "x") {
    return `${asset.headlineAr}\n\n${asset.sublineAr}\n\nحمّل بورصتي من App Store.`;
  }

  if (["instagram-story", "reels-tiktok", "tiktok"].includes(asset.platform)) {
    return `${asset.headlineAr}: ${asset.sublineAr}`;
  }

  return `${asset.headlineAr}\n\n${asset.sublineAr}\n\nحمّل بورصتي من App Store.`;
}

function statusFor(asset) {
  if (asset.id.startsWith("grid-")) return statuses.grid;
  if (asset.id.startsWith("bank-")) return statuses.bank;
  if (asset.family === "product-proof" || asset.family === "phone-hero-banner") return statuses.proof;
  if (asset.platform === "x") return statuses.x;
  if (["instagram-story", "reels-tiktok", "tiktok"].includes(asset.platform)) return statuses.vertical;
  return statuses.feed;
}

function nextActionFor(asset) {
  if (asset.id.startsWith("grid-")) return "Review in the 3x3 Instagram profile sequence.";
  if (asset.family === "product-proof" || asset.family === "phone-hero-banner") {
    return "Confirm real screenshot is acceptable and no private information appears.";
  }
  if (asset.id.startsWith("bank-")) return "Assign to the weekly rotation after launch.";
  if (asset.platform === "x") return "Shorten caption if needed before posting on X.";
  if (["instagram-story", "reels-tiktok", "tiktok"].includes(asset.platform)) {
    return "Pair with a simple voiceover or text animation.";
  }
  return "Pair with matching caption and schedule after the launch grid.";
}

function fileLink(asset) {
  return `exports/${asset.id}.png`;
}

function markdownTable(rows) {
  return [
    "| Asset | File | Platform | Family | Purpose | Caption Pack | Status | Next Action |",
    "|---|---|---|---|---|---|---|---|",
    ...rows.map((asset) => {
      const captionKey = captionKeyFor(asset);
      return [
        `\`${asset.id}\``,
        `\`${fileLink(asset)}\``,
        platformNames[asset.platform] ?? asset.platform,
        familyNames[asset.family] ?? asset.family,
        purposeFor(asset),
        captionKey,
        statusFor(asset),
        nextActionFor(asset),
      ].join(" | ");
    }).map((row) => `| ${row} |`),
  ].join("\n");
}

function buildMasterMap() {
  const groups = [
    ["Launch Grid", assets.filter((asset) => asset.id.startsWith("grid-"))],
    ["Feed And Product Proof", assets.filter((asset) => /^(feed|proof|vertical|x)-/.test(asset.id))],
    ["Expansion Bank", assets.filter((asset) => asset.id.startsWith("bank-"))],
  ];

  return `# Boursati Master Asset Map

Generated from \`content/assets.json\`.

## Summary

- Total assets: ${assets.length}
- Launch grid assets: ${assets.filter((asset) => asset.id.startsWith("grid-")).length}
- Expansion bank assets: ${assets.filter((asset) => asset.id.startsWith("bank-")).length}
- Product proof assets: ${assets.filter((asset) => asset.family === "product-proof" || asset.family === "phone-hero-banner").length}
- Default CTA: \`حمّل بورصتي من App Store\`

## Review States

- Ready for launch grid review: inspect as a profile sequence before posting.
- Ready for caption review: confirm wording and dialect level.
- Ready for visual proof review: confirm screenshot privacy and app accuracy.
- Ready for rotation review: assign to daily/weekly content slots.
- Ready for short-form review: pair with motion, voiceover, or story text.

${groups
  .map(([title, rows]) => `## ${title}\n\n${markdownTable(rows)}`)
  .join("\n\n")}

## Export Folder

Rendered PNGs live in:

\`${exportsRoot.replace(`${projectRoot}/`, "")}\`
`;
}

function buildCaptionPack() {
  const sections = Object.entries(captionBank)
    .map(([key, pack]) => `## ${key}

### Instagram

${pack.instagram}

### X / Twitter

${pack.x}

### Stories / Reels / TikTok

${pack.vertical}
`)
    .join("\n");

  const mapped = assets
    .map((asset) => {
      const caption = captionFor(asset).replace(/\n/g, "<br>");
      return `| \`${asset.id}\` | ${platformNames[asset.platform] ?? asset.platform} | ${purposeFor(asset)} | ${caption} |`;
    })
    .join("\n");

  return `# Boursati Caption Packs

Use these as editable starting points. Keep the tone Arabic-first, clear, non-advisory, and App Store-only.

${sections}

## Asset-To-Caption Map

| Asset | Platform | Purpose | Suggested Caption |
|---|---|---|---|
${mapped}
`;
}

function buildLaunchGridPlan() {
  const grid = assets.filter((asset) => asset.id.startsWith("grid-"));
  const rows = grid
    .map((asset, index) => `| ${index + 1} | \`${asset.id}\` | ${asset.headlineAr} | ${asset.sublineAr} | ${fileLink(asset)} |`)
    .join("\n");

  return `# Instagram Launch Grid Sequence

Post these nine assets first so the profile starts with a coherent launch wall.

| Order | Asset | Headline | Role | File |
|---:|---|---|---|---|
${rows}

## Posting Note

After the nine-grid launch wall is live, move into the \`bank-*\` rotation: alternate between market-summary tips, info-of-the-day posts, and product-proof posts.
`;
}

function buildRotationCalendar() {
  const launchGrid = assets.filter((asset) => asset.id.startsWith("grid-"));
  const postLaunch = [
    "feed-01-launch-portrait",
    "x-01-launch",
    "vertical-01-launch",
    "feed-02-market-clarity",
    "proof-01-home-summary",
    "vertical-02-disclosure",
    "feed-03-disclosures",
    "x-02-disclosure",
    "proof-02-disclosures",
    "feed-04-company-depth",
    "feed-05-portfolio",
    "vertical-03-tip",
    "proof-03-portfolio",
    "x-03-portfolio",
    "feed-06-watchlist",
    "feed-07-daily-habit",
    "feed-08-learning",
    "proof-04-news",
    "x-04-market-summary",
    "vertical-04-portfolio",
    "bank-01-info-news-vs-disclosure",
    "bank-03-market-morning",
    "bank-05-info-ticker",
    "bank-08-tip-notification-path",
    "bank-10-info-dividends",
    "bank-14-market-weekly",
    "bank-18-info-price-delay",
    "bank-23-market-story",
    "bank-24-info-day-story",
  ].map((id) => assets.find((asset) => asset.id === id)).filter(Boolean);

  const days = [
    {
      day: 1,
      asset: "grid-01 to grid-09",
      platform: "Instagram Grid",
      purpose: "Launch profile wall",
      note: "Publish the nine launch tiles as the first account grid.",
    },
    ...postLaunch.slice(0, 29).map((asset, index) => ({
      day: index + 2,
      asset: asset.id,
      platform: platformNames[asset.platform] ?? asset.platform,
      purpose: purposeFor(asset),
      note: nextActionFor(asset),
    })),
  ];

  const rows = days
    .map((entry) => `| ${entry.day} | \`${entry.asset}\` | ${entry.platform} | ${entry.purpose} | ${entry.note} |`)
    .join("\n");

  return `# 30-Day Rotation Calendar

This is a practical posting order for the first month after the app update is ready. Dates are intentionally left relative so the schedule can start on the actual release day.

| Day | Asset | Platform | Purpose | Note |
|---:|---|---|---|---|
${rows}

## Rotation Principle

Do not post only product screenshots. Alternate between launch promise, product proof, disclosure literacy, company context, portfolio clarity, and market-summary habits.
`;
}

await mkdir(contentPlanRoot, { recursive: true });
await writeFile(resolve(contentPlanRoot, "master-asset-map.md"), buildMasterMap(), "utf8");
await writeFile(resolve(contentPlanRoot, "caption-packs.md"), buildCaptionPack(), "utf8");
await writeFile(resolve(contentPlanRoot, "instagram-launch-grid-sequence.md"), buildLaunchGridPlan(), "utf8");
await writeFile(resolve(contentPlanRoot, "30-day-rotation-calendar.md"), buildRotationCalendar(), "utf8");

console.log("built content ops files");
