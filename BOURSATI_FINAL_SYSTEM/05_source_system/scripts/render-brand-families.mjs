import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { ASPECTS, buildHtml, loadFamilyAssets } from "../src/brand-family-template.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const labRoot = resolve(scriptDir, "..");
const projectRoot = resolve(labRoot, "..");
const outputRoot = resolve(labRoot, "exports");
const htmlRoot = resolve(outputRoot, "_html");
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const requestedIds = new Set(process.argv.slice(2));

if (!existsSync(chromePath)) {
  throw new Error(`Google Chrome was not found at ${chromePath}`);
}

const assets = (await loadFamilyAssets()).filter((asset) => {
  return requestedIds.size === 0 || requestedIds.has(asset.id);
});

await mkdir(outputRoot, { recursive: true });
await mkdir(htmlRoot, { recursive: true });

for (const asset of assets) {
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
  const size = ASPECTS[asset.aspect];
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
