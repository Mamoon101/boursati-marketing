import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

import { ASPECTS, buildHtml, loadFamilyAssets, validateAsset } from "../src/brand-family-template.mjs";

const projectRoot = resolve(import.meta.dirname, "../..");
const forbidden =
  /اشتر|للشراء|قم بالشراء|بيع الآن|بع الآن|اربح|عوائد مضمونة|أفضل سهم|توصيات يومية|\b(buy|sell|hold|profit|guaranteed|premium|subscription|trial|paywall|pricing|unlock|buying power|liquidity is power|markets move you ahead)\b|Android|Google Play/i;

test("loads launch campaign bank across requested formats", async () => {
  const assets = await loadFamilyAssets();
  const families = new Set(assets.map((asset) => asset.family));
  const platforms = new Set(assets.map((asset) => asset.platform));
  const gridAssets = assets.filter((asset) => asset.platform === "instagram-grid");

  assert.ok(assets.length >= 24, "campaign needs enough assets for daily posting");
  assert.equal(gridAssets.length, 9, "Instagram launch grid must contain exactly nine tiles");
  assert.equal(assets.filter((asset) => asset.id.startsWith("bank-")).length, 25);
  assert.deepEqual([...families].sort(), [
    "announcement",
    "daily-tip",
    "featured-grid",
    "launch-poster",
    "market-card",
    "market-summary-tip",
    "phone-hero-banner",
    "product-proof",
    "vertical-cover",
  ]);
  assert.ok(platforms.has("instagram-grid"));
  assert.ok(platforms.has("instagram-square"));
  assert.ok(platforms.has("instagram-portrait"));
  assert.ok(platforms.has("instagram-story"));
  assert.ok(platforms.has("reels-tiktok"));
  assert.ok(platforms.has("tiktok"));
  assert.ok(platforms.has("x"));

  for (const asset of assets) {
    assert.doesNotThrow(() => validateAsset(asset));
    assert.ok(ASPECTS[asset.aspect], `${asset.id} uses unknown aspect`);
  }
});

test("copy is context-appropriate and finance-safe", async () => {
  const assets = await loadFamilyAssets();

  for (const asset of assets) {
    const copy = [
      asset.headlineAr,
      asset.sublineAr,
      asset.contextAr,
      asset.cta,
      ...asset.labels,
    ].join(" ");

    assert.doesNotMatch(copy, forbidden, `${asset.id} contains blocked wording`);
    assert.equal(asset.cta, "حمّل بورصتي من App Store");
  }
});

test("only product-proof and phone hero assets use contextual app screenshots", async () => {
  const assets = await loadFamilyAssets();

  for (const asset of assets) {
    if (["phone-hero-banner", "product-proof"].includes(asset.family)) {
      assert.ok(asset.phoneScreen, `${asset.id} needs a real app screen`);
      assert.ok(existsSync(resolve(projectRoot, asset.phoneScreen)), `${asset.id} missing phone screen`);
      continue;
    }

    assert.equal(asset.phoneScreen, null, `${asset.id} should not use phone screenshot`);
  }
});

test("buildHtml includes art direction, refined tower spire, and aligned CTA", async () => {
  const assets = await loadFamilyAssets();
  const html = buildHtml(assets.find((asset) => asset.family === "market-card"));
  const marketAsset = assets.find((asset) => asset.id === "feed-02-market-clarity");
  const marketHtml = buildHtml(marketAsset);
  const phoneHtml = buildHtml(assets.find((asset) => asset.family === "phone-hero-banner"));
  const proofHtml = buildHtml(assets.find((asset) => asset.family === "product-proof"));

  assert.match(html, /dir="rtl"/);
  assert.match(html, /class="art-direction/);
  assert.match(html, /class="tower-spire"/);
  assert.match(html, /class="tower-main-right"/);
  assert.match(html, /class="tower-main-left"/);
  assert.match(html, /class="tower-needle-center"/);
  assert.match(html, /class="tower-right-upper-sphere"/);
  assert.match(html, /class="tower-right-lower-sphere"/);
  assert.match(html, /class="tower-left-sphere"/);
  assert.match(html, /class="tower-lattice"/);
  assert.match(html, /class="tower-balcony-band"/);
  assert.match(html, /class="app-cta" dir="ltr"/);
  assert.match(html, /class="app-store-badge"/);
  assert.match(html, /class="cta-copy" dir="rtl"/);
  assert.match(html, /class="url"[\s\S]*class="app-store-badge"[\s\S]*class="cta-copy"/);
  assert.match(html, /Download on the App Store/);
  assert.doesNotMatch(html, /class="phone-stage"/);
  assert.match(phoneHtml, /class="phone-stage"/);
  assert.match(proofHtml, /class="phone-stage"/);
  assert.match(proofHtml, /data-family="product-proof"[\s\S]*class="anchor/);
  assert.match(proofHtml, /data-family="product-proof"[\s\S]*class="kinetic"/);
  assert.doesNotMatch(html, /portfolio overview|fake dashboard|buying power/i);
  assert.doesNotMatch(marketHtml, new RegExp(marketAsset.contextAr, "i"));
  assert.doesNotMatch(marketHtml, /class="eyebrow"/);
});

test("refinement pass keeps text clear, CTA contextual, and phone shell iPhone-like", async () => {
  const assets = await loadFamilyAssets();
  const paperHtml = buildHtml(assets.find((asset) => asset.palette === "paper" && asset.family === "announcement"));
  const darkHtml = buildHtml(assets.find((asset) => asset.palette === "dark" && asset.family === "market-card"));
  const phoneHtml = buildHtml(assets.find((asset) => asset.family === "phone-hero-banner"));
  const sourceHtml = buildHtml(assets.find((asset) => asset.anchor === "source-seal"));

  assert.doesNotMatch(sourceHtml, /<text[^>]*>مصدر<\/text>/);
  assert.match(paperHtml, /data-cta-zone="left"/);
  assert.match(darkHtml, /data-cta-zone="right"/);
  assert.match(paperHtml, /class="copy-plate"/);
  assert.match(phoneHtml, /class="phone-notch"/);
  assert.match(phoneHtml, /phone-side-button/);
  assert.match(phoneHtml, /class="brand-mark"/);
  assert.match(phoneHtml, /class="brand-word"/);
  assert.match(phoneHtml, /data-family="phone-hero-banner"[\s\S]*left: 46%/);
  assert.match(phoneHtml, /data-family="product-proof"[\s\S]*right: -8%/);
  assert.match(buildHtml(assets.find((asset) => asset.family === "daily-tip")), /data-family="daily-tip"/);
  assert.match(buildHtml(assets.find((asset) => asset.family === "market-summary-tip")), /data-family="market-summary-tip"/);
});

test("dark daily batch is dark-only, grid-safe, and paired for Instagram plus X", async () => {
  const assets = await loadFamilyAssets(new URL("../content/dark-daily-batch-v1.json", import.meta.url));
  const instagramAssets = assets.filter((asset) => asset.platform === "instagram-feed-profile-grid-safe");
  const xAssets = assets.filter((asset) => asset.platform === "x");

  assert.equal(assets.length, 28);
  assert.equal(instagramAssets.length, 14);
  assert.equal(xAssets.length, 14);

  for (const asset of assets) {
    assert.doesNotThrow(() => validateAsset(asset));
    assert.equal(asset.palette, "dark");
    assert.equal(asset.phoneScreen, null);
    assert.match(buildHtml(asset), /data-visual="/);
  }

  for (const asset of instagramAssets) {
    assert.equal(asset.aspect, "profile-grid");
  }

  for (const asset of xAssets) {
    assert.equal(asset.aspect, "x-banner");
  }
});
