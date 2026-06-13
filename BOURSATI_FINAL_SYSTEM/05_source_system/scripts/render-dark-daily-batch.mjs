import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { ASPECTS, buildHtml, loadFamilyAssets } from "../src/brand-family-template.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const sourceRoot = resolve(scriptDir, "..");
const finalSystemRoot = resolve(sourceRoot, "..");
const batchFile = new URL("../content/dark-daily-batch-v1.json", import.meta.url);
const outputRoot = resolve(finalSystemRoot, "04_assets/ready_to_post_by_week/dark_daily_batch_v1");
const instagramRoot = resolve(outputRoot, "instagram");
const xRoot = resolve(outputRoot, "x");
const htmlRoot = resolve(outputRoot, "_html");
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const requestedIds = new Set(process.argv.slice(2));

if (!existsSync(chromePath)) {
  throw new Error(`Google Chrome was not found at ${chromePath}`);
}

const allAssets = await loadFamilyAssets(batchFile);
const assets = allAssets.filter((asset) => requestedIds.size === 0 || requestedIds.has(asset.id));

await rm(outputRoot, { recursive: true, force: true });
await mkdir(instagramRoot, { recursive: true });
await mkdir(xRoot, { recursive: true });
await mkdir(resolve(htmlRoot, "instagram"), { recursive: true });
await mkdir(resolve(htmlRoot, "x"), { recursive: true });

for (const asset of assets) {
  const requiredAssets = ["assets/app-icon-1024.png", "assets/app-store-badge.svg"];
  if (asset.phoneScreen) {
    requiredAssets.push(asset.phoneScreen);
  }

  for (const requiredAsset of requiredAssets) {
    const absolutePath = resolve(finalSystemRoot, requiredAsset);
    if (!existsSync(absolutePath)) {
      throw new Error(`Missing asset for ${asset.id}: ${absolutePath}`);
    }
  }

  const channel = asset.platform === "x" ? "x" : "instagram";
  const html = buildHtml(asset, {
    assetSrc: (assetPath) => pathToFileURL(resolve(finalSystemRoot, assetPath)).href,
  });
  const size = ASPECTS[asset.aspect];
  const htmlPath = join(htmlRoot, channel, `${asset.id}.html`);
  const outputPath = join(channel === "x" ? xRoot : instagramRoot, `${asset.id}.png`);

  await writeFile(htmlPath, html, "utf8");
  await runChromeScreenshot({
    htmlPath,
    outputPath,
    width: size.width,
    height: size.height,
  });

  console.log(`rendered ${outputPath}`);
}

await writeFile(resolve(outputRoot, "README.md"), buildReadme(allAssets), "utf8");
await writeFile(resolve(outputRoot, "captions.md"), buildCaptions(allAssets), "utf8");

await buildContactSheet({
  assets: allAssets.filter((asset) => asset.platform !== "x"),
  channel: "instagram",
  columns: 4,
  thumbWidth: 216,
  thumbHeight: 216,
  objectFit: "cover",
  outputPath: resolve(outputRoot, "contact-sheet-instagram.png"),
});
await buildContactSheet({
  assets: allAssets.filter((asset) => asset.platform !== "x"),
  channel: "instagram",
  columns: 4,
  thumbWidth: 216,
  thumbHeight: 216,
  objectFit: "cover",
  outputPath: resolve(outputRoot, "contact-sheet-instagram-grid-preview.png"),
});
await buildContactSheet({
  assets: allAssets.filter((asset) => asset.platform === "x"),
  channel: "x",
  columns: 2,
  thumbWidth: 360,
  thumbHeight: 203,
  objectFit: "cover",
  outputPath: resolve(outputRoot, "contact-sheet-x.png"),
});

function runChromeScreenshot({ htmlPath, outputPath, width, height }) {
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--allow-file-access-from-files",
    `--window-size=${width},${height}`,
    `--screenshot=${outputPath}`,
    pathToFileURL(htmlPath).href,
  ];

  return run(chromePath, args);
}

async function buildContactSheet({ assets, channel, columns, thumbWidth, thumbHeight, objectFit, outputPath }) {
  const gap = 18;
  const padding = 24;
  const rows = Math.ceil(assets.length / columns);
  const width = padding * 2 + columns * thumbWidth + (columns - 1) * gap;
  const height = padding * 2 + rows * thumbHeight + (rows - 1) * gap;
  const htmlPath = resolve(htmlRoot, `contact-sheet-${channel}.html`);
  const folder = channel === "x" ? xRoot : instagramRoot;
  const cards = assets
    .map((asset) => {
      const imageSrc = pathToFileURL(resolve(folder, `${asset.id}.png`)).href;
      return `<figure><img alt="" src="${imageSrc}"><figcaption>${asset.id}</figcaption></figure>`;
    })
    .join("");
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=${width}, initial-scale=1">
  <style>
    * { box-sizing: border-box; }
    html, body {
      width: ${width}px;
      height: ${height}px;
      margin: 0;
      overflow: hidden;
      background: #0A0B0D;
      font-family: "SF Pro Text", Arial, sans-serif;
    }
    .sheet {
      display: grid;
      grid-template-columns: repeat(${columns}, ${thumbWidth}px);
      gap: ${gap}px;
      padding: ${padding}px;
    }
    figure {
      position: relative;
      width: ${thumbWidth}px;
      height: ${thumbHeight}px;
      margin: 0;
      overflow: hidden;
      background: #05070B;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: ${objectFit};
      display: block;
    }
    figcaption {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 6px 7px;
      color: rgba(248,248,243,0.78);
      background: rgba(0,0,0,0.62);
      font-size: 8px;
      line-height: 1.1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  </style>
</head>
<body>
  <main class="sheet">${cards}</main>
</body>
</html>`;

  await writeFile(htmlPath, html, "utf8");
  await runChromeScreenshot({ htmlPath, outputPath, width, height });
}

function run(command, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });

    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`${command} failed with exit ${code}: ${stderr}`));
        return;
      }
      resolvePromise();
    });
  });
}

function buildReadme(assets) {
  const instagram = assets.filter((asset) => asset.platform !== "x");
  const x = assets.filter((asset) => asset.platform === "x");

  return `# Dark Daily Batch V1

Dark-only production batch for two weeks of daily Boursati posting.

## Format

- Instagram: \`1080x1080\`, square. The profile grid and opened post use the same visible composition.
- X: \`1600x900\`, landscape in-stream banner.
- Palette: dark only.
- Screenshots: none in this batch. This keeps the set art-led and avoids forced mockups.

## Instagram Posting Order

${instagram.map((asset, index) => `${index + 1}. \`instagram/${asset.id}.png\` - ${asset.headlineAr}`).join("\n")}

## X Posting Order

${x.map((asset, index) => `${index + 1}. \`x/${asset.id}.png\` - ${asset.headlineAr}`).join("\n")}

## Review Sheets

- \`contact-sheet-instagram.png\`
- \`contact-sheet-instagram-grid-preview.png\`
- \`contact-sheet-x.png\`
`;
}

function buildCaptions(assets) {
  const days = Array.from({ length: 14 }, (_, index) => {
    const day = String(index + 1).padStart(2, "0");
    const instagram = assets.find((asset) => asset.id.startsWith(`dark-day-${day}-ig-`));
    const xAsset = assets.find((asset) => asset.id.startsWith(`dark-day-${day}-x-`));
    return { day: index + 1, instagram, xAsset };
  });

  return `# Dark Daily Batch V1 Captions

Use one Instagram post and one X post per day. Keep the same day number across both platforms.

${days.map(({ day, instagram, xAsset }) => `## Day ${day}

Instagram asset: \`instagram/${instagram.id}.png\`

Instagram caption:
${captionForInstagram(instagram)}

X asset: \`x/${xAsset.id}.png\`

X caption:
${captionForX(xAsset)}
`).join("\n")}
`;
}

function captionForInstagram(asset) {
  const tags = "#بورصتي #بورصة_الكويت #الكويت #استثمار #إفصاحات";
  return `${asset.headlineAr}

${asset.sublineAr}

بورصتي يجمع أهم مسارات المتابعة في تجربة عربية واضحة: السوق، الشركات، الأخبار، الإفصاحات، والمحفظة.

حمّل بورصتي من App Store: boursati.app/download

${tags}`;
}

function captionForX(asset) {
  return `${asset.headlineAr}

${asset.sublineAr}

بورصتي: متابعة بورصة الكويت بوضوح، من مكان واحد.

boursati.app/download`;
}
