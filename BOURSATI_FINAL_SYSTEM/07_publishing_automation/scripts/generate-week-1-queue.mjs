import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

const automationRoot = resolve(import.meta.dirname, "..");
const finalRoot = resolve(automationRoot, "..");
const assetRoot = resolve(finalRoot, "04_assets/ready_to_post_by_week/launch_batch_01_week_1");
const outputPath = resolve(automationRoot, "queue/week-1-approved-queue.json");
const configPath = resolve(automationRoot, "config/week-1-schedule.config.json");

const config = JSON.parse(await fs.readFile(configPath, "utf8"));
const launchDate = config.launchDate;
const hasLaunchDate = /^\d{4}-\d{2}-\d{2}$/.test(launchDate);

const posts = [
  {
    dayOffset: 0,
    platform: "instagram",
    slot: "gridLaunch",
    minuteOffset: 0,
    asset: "instagram-grid/grid-09-download.png",
    title: "Grid 09 - Download",
    caption: "جرّب بورصتي.\n\nمتاح الآن على App Store لمتابعة بورصة الكويت.\n\nحمّل بورصتي من App Store."
  },
  {
    dayOffset: 0,
    platform: "instagram",
    slot: "gridLaunch",
    minuteOffset: 2,
    asset: "instagram-grid/grid-08-all-paths.png",
    title: "Grid 08 - All Paths",
    caption: "كل مسار له مكان.\n\nالشركات، الإفصاحات، الأخبار، والمحفظة ضمن نظام واضح للمتابعة.\n\nحمّل بورصتي من App Store."
  },
  {
    dayOffset: 0,
    platform: "instagram",
    slot: "gridLaunch",
    minuteOffset: 4,
    asset: "instagram-grid/grid-07-alerts.png",
    title: "Grid 07 - Alerts",
    caption: "التنبيه يفتح المسار.\n\nمن الإشعار إلى الإفصاح، ثم إلى تفاصيل الشركة.\n\nحمّل بورصتي من App Store."
  },
  {
    dayOffset: 0,
    platform: "instagram",
    slot: "gridLaunch",
    minuteOffset: 6,
    asset: "instagram-grid/grid-06-portfolio-clear.png",
    title: "Grid 06 - Portfolio",
    caption: "محفظتك كدفتر واضح.\n\nمكوناتك وتوزيعاتك المتوقعة مرتبة للمراجعة السريعة.\n\nحمّل بورصتي من App Store."
  },
  {
    dayOffset: 0,
    platform: "instagram",
    slot: "gridLaunch",
    minuteOffset: 8,
    asset: "instagram-grid/grid-05-boursati-center.png",
    title: "Grid 05 - Boursati",
    caption: "بورصتي.\n\nطريقة أوضح لمتابعة بورصة الكويت من هاتفك.\n\nحمّل بورصتي من App Store."
  },
  {
    dayOffset: 0,
    platform: "instagram",
    slot: "gridLaunch",
    minuteOffset: 10,
    asset: "instagram-grid/grid-04-company-context.png",
    title: "Grid 04 - Company Context",
    caption: "الخبر يحتاج شركة.\n\nاقرأ الخبر، ثم ارجع إلى الشركة التي يتحرك حولها السياق.\n\nحمّل بورصتي من App Store."
  },
  {
    dayOffset: 0,
    platform: "instagram",
    slot: "gridLaunch",
    minuteOffset: 12,
    asset: "instagram-grid/grid-03-disclosure-source.png",
    title: "Grid 03 - Disclosure Source",
    caption: "المصدر أولاً.\n\nالإفصاح الرسمي هو بداية القراءة، لا نهايتها.\n\nحمّل بورصتي من App Store."
  },
  {
    dayOffset: 0,
    platform: "instagram",
    slot: "gridLaunch",
    minuteOffset: 14,
    asset: "instagram-grid/grid-02-market-summary.png",
    title: "Grid 02 - Market Summary",
    caption: "ابدأ من الصورة الأكبر.\n\nملخص السوق يساعدك تبدأ القراءة قبل الدخول في تفاصيل الشركات.\n\nحمّل بورصتي من App Store."
  },
  {
    dayOffset: 0,
    platform: "instagram",
    slot: "gridLaunch",
    minuteOffset: 16,
    asset: "instagram-grid/grid-01-launch-pocket.png",
    title: "Grid 01 - Launch Pocket",
    caption: "بورصة الكويت في جيبك.\n\nبورصتي يجمع أهم مسارات المتابعة في تطبيق عربي واحد: الأسعار، الأخبار، الإفصاحات، الشركات، والمحفظة.\n\nحمّل بورصتي من App Store."
  },
  {
    dayOffset: 1,
    platform: "instagram",
    slot: "feed",
    asset: "instagram-feed-profile-grid-safe/feed-01-launch-profile-grid-safe.png",
    title: "Main Launch Feed",
    caption: "بورصة الكويت في جيبك.\n\nأسعار، أخبار، إفصاحات، ومحفظتك في تطبيق عربي واحد.\n\nحمّل بورصتي من App Store."
  },
  {
    dayOffset: 2,
    platform: "instagram",
    slot: "feed",
    asset: "instagram-feed-profile-grid-safe/feed-02-market-clarity-profile-grid-safe.png",
    title: "Market Clarity",
    caption: "تابع السوق بدون لويه.\n\nابدأ من ملخص واضح، ثم ادخل في التفاصيل التي تهمك.\n\nحمّل بورصتي من App Store."
  },
  {
    dayOffset: 2,
    platform: "instagram",
    slot: "story",
    asset: "stories-reels/vertical-01-launch.png",
    title: "Launch Story",
    caption: "بورصتي.\n\nطريقة أوضح لمتابعة بورصة الكويت من هاتفك.\n\nحمّل بورصتي من App Store."
  },
  {
    dayOffset: 3,
    platform: "instagram",
    slot: "feed",
    asset: "instagram-feed-profile-grid-safe/feed-03-disclosures-profile-grid-safe.png",
    title: "Disclosure Awareness",
    caption: "الإفصاح قبل الكلام.\n\nابدأ من المصدر الرسمي، ثم اقرأ السياق داخل بورصتي.\n\nحمّل بورصتي من App Store."
  },
  {
    dayOffset: 3,
    platform: "instagram",
    slot: "story",
    asset: "stories-reels/vertical-02-disclosure.png",
    title: "Disclosure Story",
    caption: "وصل إفصاح؟\n\nافتح التنبيه، اقرأ المصدر، ثم راجع تفاصيل الشركة.\n\nحمّل بورصتي من App Store."
  },
  {
    dayOffset: 4,
    platform: "instagram",
    slot: "feed",
    asset: "instagram-feed-profile-grid-safe/proof-grid-01-home-summary-profile-grid-safe.png",
    title: "Product Proof",
    caption: "ملخص السوق أمامك.\n\nلقطة حقيقية من بورصتي لبداية أوضح قبل التفاصيل.\n\nحمّل بورصتي من App Store."
  },
  {
    dayOffset: 5,
    platform: "instagram",
    slot: "feed",
    asset: "carousels/carousel-01-news-vs-disclosure",
    title: "Carousel - News vs Disclosure",
    caption: "خبر أم إفصاح؟\n\nالخبر يعطيك العنوان. الإفصاح هو المصدر الرسمي. ابدأ بالمصدر، ثم اقرأ السياق.\n\nحمّل بورصتي من App Store."
  },
  {
    dayOffset: 6,
    platform: "x",
    slot: "x",
    minuteOffset: 0,
    asset: "x-banners/x-01-launch.png",
    title: "X Launch Banner",
    caption: "بورصة الكويت في جيبك.\n\nتابع الأسعار، الأخبار، الإفصاحات، ومحفظتك من تطبيق عربي واحد.\n\nحمّل بورصتي من App Store."
  },
  {
    dayOffset: 6,
    platform: "x",
    slot: "x",
    minuteOffset: 10,
    asset: "x-banners/x-02-disclosure.png",
    title: "X Disclosure Banner",
    caption: "الإفصاح الرسمي أولاً.\n\nالخبر مهم، لكن المصدر هو البداية الأوضح للقراءة.\n\nحمّل بورصتي من App Store."
  }
];

const queue = posts.map((post, index) => {
  const assetPath = resolve(assetRoot, post.asset);
  const mediaPaths = post.asset.endsWith(".png")
    ? [assetPath]
    : [
        resolve(assetPath, "carousel-01-news-vs-disclosure-s01.png"),
        resolve(assetPath, "carousel-01-news-vs-disclosure-s02.png"),
        resolve(assetPath, "carousel-01-news-vs-disclosure-s03.png"),
        resolve(assetPath, "carousel-01-news-vs-disclosure-s04.png"),
        resolve(assetPath, "carousel-01-news-vs-disclosure-s05.png")
      ];

  for (const mediaPath of mediaPaths) {
    if (!existsSync(mediaPath)) {
      throw new Error(`Missing media file: ${mediaPath}`);
    }
  }

  return {
    id: `week1-${String(index + 1).padStart(2, "0")}`,
    status: "approved",
    mode: config.mode,
    timezone: config.timezone,
    scheduledAt: hasLaunchDate ? scheduledAt(launchDate, post.dayOffset, config.dailySlots[post.slot], post.minuteOffset ?? 0) : null,
    platform: post.platform,
    title: post.title,
    caption: post.caption,
    mediaPaths,
    sourceAsset: post.asset,
    notes: hasLaunchDate ? "" : "Set launchDate in config/week-1-schedule.config.json before live scheduling."
  };
});

await fs.mkdir(dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), queue }, null, 2)}\n`, "utf8");
console.log(`Generated ${queue.length} approved Week 1 posts: ${outputPath}`);

function scheduledAt(date, offset, time, minuteOffset = 0) {
  const start = new Date(`${date}T00:00:00.000+03:00`);
  start.setDate(start.getDate() + offset);
  const [hours, minutes] = time.split(":").map(Number);
  start.setHours(hours, minutes + minuteOffset, 0, 0);
  return start.toISOString();
}
