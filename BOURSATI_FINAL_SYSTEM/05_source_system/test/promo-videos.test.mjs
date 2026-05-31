import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const projectRoot = resolve(import.meta.dirname, "../..");
const specs = JSON.parse(readFileSync(resolve(projectRoot, "05_source_system/content/promo-videos.json"), "utf8"));
const forbidden =
  /اشتر|للشراء|قم بالشراء|بيع الآن|بع الآن|اربح|عوائد مضمونة|أفضل سهم|توصيات يومية|\b(buy|sell|hold|profit|guaranteed|premium|subscription|trial|paywall|pricing|unlock|buying power|liquidity is power|markets move you ahead)\b|Android|Google Play/i;

test("promo slate contains ten safe video concepts", () => {
  assert.equal(specs.length, 10);

  for (const spec of specs) {
    assert.match(spec.id, /^promo-\d{2}-/);
    assert.ok(spec.title);
    assert.ok(spec.target);
    assert.ok(spec.message);
    assert.ok(spec.direction);
    assert.ok(Array.isArray(spec.segments));
    assert.ok(spec.segments.length >= 3);
    assert.doesNotMatch([spec.title, spec.target, spec.message, spec.direction].join(" "), forbidden);
  }
});

test("promo video source assets exist and use supported segment types", () => {
  const segmentTypes = new Set(["image", "video"]);

  for (const spec of specs) {
    let totalDuration = 0;
    for (const segment of spec.segments) {
      assert.ok(segmentTypes.has(segment.type), `${spec.id} has unsupported segment type`);
      assert.ok(existsSync(resolve(projectRoot, segment.src)), `${spec.id} missing ${segment.src}`);
      assert.ok(segment.duration > 0, `${spec.id} segment needs duration`);
      totalDuration += segment.duration;
    }
    assert.ok(totalDuration >= 6, `${spec.id} is too short`);
    assert.ok(totalDuration <= 22, `${spec.id} is too long for first-draft vertical social`);
  }
});
