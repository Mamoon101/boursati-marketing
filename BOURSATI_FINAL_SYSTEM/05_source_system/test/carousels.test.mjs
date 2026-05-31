import assert from "node:assert/strict";
import { test } from "node:test";

import { buildCarouselSlideHtml, loadCarousels, validateCarousel } from "../src/carousel-template.mjs";

const forbidden =
  /اشتر|للشراء|قم بالشراء|بيع الآن|بع الآن|اربح|عوائد مضمونة|أفضل سهم|توصيات يومية|\b(buy|sell|hold|profit|guaranteed|premium|subscription|trial|paywall|pricing|unlock)\b|Android|Google Play/i;

test("loads first carousel pack with safe educational content", async () => {
  const carousels = await loadCarousels();

  assert.equal(carousels.length, 4);
  assert.equal(carousels.flatMap((carousel) => carousel.slides).length, 20);

  for (const carousel of carousels) {
    assert.doesNotThrow(() => validateCarousel(carousel));
    assert.equal(carousel.platform, "instagram-carousel");
    assert.equal(carousel.slides.length, 5);

    for (const slide of carousel.slides) {
      const copy = [slide.kicker, slide.headlineAr, slide.bodyAr, ...slide.labels].join(" ");
      assert.doesNotMatch(copy, forbidden);
    }
  }
});

test("carousel slides keep brand direction, numbering, and App Store-only CTA", async () => {
  const [carousel] = await loadCarousels();
  const html = buildCarouselSlideHtml(carousel, 0);

  assert.match(html, /dir="rtl"/);
  assert.match(html, /BOURSATI/);
  assert.match(html, /01 \/ 05/);
  assert.match(html, /class="kinetic"/);
  assert.match(html, /class="copy-plate"/);
  assert.match(html, /boursati\.app/);
  assert.match(html, /حمّل بورصتي من App Store/);
  assert.doesNotMatch(html, /Google Play|Android|buying power|fake dashboard/i);
});
