import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { ASPECTS, buildHtml, loadFamilyAssets } from "../src/brand-family-template.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const sourceRoot = resolve(scriptDir, "..");
const projectRoot = resolve(sourceRoot, "..");
const outputRoot = resolve(projectRoot, "04_assets/ready_to_post_by_week/launch_batch_01_week_1/instagram-feed-profile-grid-safe");
const htmlRoot = resolve(outputRoot, "_html");
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

if (!existsSync(chromePath)) {
  throw new Error(`Google Chrome was not found at ${chromePath}`);
}

const feedAssets = (await loadFamilyAssets())
  .filter((asset) => asset.id.startsWith("feed-") || asset.id.startsWith("proof-"))
  .filter((asset) => ["feed-01-launch-portrait", "feed-02-market-clarity", "feed-03-disclosures", "proof-01-home-summary"].includes(asset.id))
  .map((asset) => ({
    ...asset,
    id: asset.id.replace("-portrait", "").replace("proof-01", "proof-grid-01") + "-profile-grid-safe",
    platform: "instagram-feed-profile-grid-safe",
    aspect: "profile-grid",
    contextAr: "Instagram feed post adapted to the current 3:4 profile grid thumbnail.",
  }));

await mkdir(outputRoot, { recursive: true });
await mkdir(htmlRoot, { recursive: true });

const readme = `# Instagram Feed - Profile Grid Safe

These are the Week 1 Instagram feed assets adapted for Instagram profile-grid visibility.

Use these for Instagram feed publishing when the post must look good both:

- opened as a normal post,
- viewed as a vertical profile-grid thumbnail.

Instagram's current profile grid displays posts as vertical 3:4 thumbnails. These files use native 1080x1440 exports so the grid view and opened post stay aligned.
`;

await writeFile(join(outputRoot, "README.md"), readme, "utf8");

for (const asset of feedAssets) {
  const requiredAssets = ["assets/app-icon-1024.png", "assets/app-store-badge.svg"];
  if (asset.phoneScreen) {
    requiredAssets.push(asset.phoneScreen);
  }

  for (const requiredAsset of requiredAssets) {
    const absolutePath = resolve(projectRoot, requiredAsset);
    if (!existsSync(absolutePath)) {
      throw new Error(`Missing asset for ${asset.id}: ${absolutePath}`);
    }
  }

  const html = buildHtml(asset, {
    assetSrc: (assetPath) => pathToFileURL(resolve(projectRoot, assetPath)).href,
  });
  const size = ASPECTS["profile-grid"];
  const htmlPath = join(htmlRoot, `${asset.id}.html`);
  const outputPath = join(outputRoot, `${asset.id}.png`);

  await writeFile(htmlPath, html, "utf8");
  await rm(outputPath, { force: true });
  await runChromeScreenshot({
    htmlPath,
    outputPath,
    width: size.width,
    height: size.height,
  });

  console.log(`rendered ${outputPath}`);
}

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

  return new Promise((resolvePromise, reject) => {
    const child = spawn(chromePath, args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Chrome screenshot failed with exit ${code}: ${stderr}`));
        return;
      }
      resolvePromise();
    });
  });
}
