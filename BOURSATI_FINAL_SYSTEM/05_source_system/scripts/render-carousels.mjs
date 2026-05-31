import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { buildCarouselSlideHtml, CAROUSEL_SIZE, loadCarousels } from "../src/carousel-template.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const campaignRoot = resolve(scriptDir, "..");
const projectRoot = resolve(campaignRoot, "..");
const outputRoot = resolve(campaignRoot, "exports/carousels");
const htmlRoot = resolve(outputRoot, "_html");
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const requestedIds = new Set(process.argv.slice(2));

if (!existsSync(chromePath)) {
  throw new Error(`Google Chrome was not found at ${chromePath}`);
}

const carousels = (await loadCarousels()).filter((carousel) => {
  return requestedIds.size === 0 || requestedIds.has(carousel.id);
});

await mkdir(outputRoot, { recursive: true });
await mkdir(htmlRoot, { recursive: true });

for (const carousel of carousels) {
  for (const [slideIndex] of carousel.slides.entries()) {
    const html = buildCarouselSlideHtml(carousel, slideIndex, {
      assetSrc: (assetPath) => pathToFileURL(resolve(projectRoot, assetPath)).href,
    });
    const slideNumber = String(slideIndex + 1).padStart(2, "0");
    const basename = `${carousel.id}-s${slideNumber}`;
    const htmlPath = join(htmlRoot, `${basename}.html`);
    const outputPath = join(outputRoot, `${basename}.png`);

    await writeFile(htmlPath, html, "utf8");
    await rm(outputPath, { force: true });
    await runChromeScreenshot({
      htmlPath,
      outputPath,
      width: CAROUSEL_SIZE.width,
      height: CAROUSEL_SIZE.height,
    });

    console.log(`rendered ${outputPath}`);
  }
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
    const child = spawn(chromePath, args, { stdio: ["ignore", "pipe", "pipe"] });
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
