import { existsSync, readFileSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const campaignRoot = resolve(scriptDir, "..");
const projectRoot = resolve(campaignRoot, "..");
const specsPath = resolve(campaignRoot, "content/promo-videos.json");
const outputRoot = resolve(campaignRoot, "exports/videos");
const tmpRoot = resolve(outputRoot, "_tmp");
const requestedIds = new Set(process.argv.slice(2));

const specs = JSON.parse(readFileSync(specsPath, "utf8")).filter((spec) => {
  return requestedIds.size === 0 || requestedIds.has(spec.id);
});

await mkdir(outputRoot, { recursive: true });
await rm(tmpRoot, { recursive: true, force: true });
await mkdir(tmpRoot, { recursive: true });

for (const spec of specs) {
  const specTmpRoot = resolve(tmpRoot, spec.id);
  await mkdir(specTmpRoot, { recursive: true });

  const segmentPaths = [];
  for (const [index, segment] of spec.segments.entries()) {
    const sourcePath = resolve(projectRoot, segment.src);
    if (!existsSync(sourcePath)) {
      throw new Error(`Missing source for ${spec.id}: ${sourcePath}`);
    }

    const outputPath = join(specTmpRoot, `${String(index + 1).padStart(2, "0")}.mp4`);
    if (segment.type === "image") {
      await renderImageSegment({ sourcePath, outputPath, duration: segment.duration });
    } else if (segment.type === "video") {
      await renderVideoSegment({
        sourcePath,
        outputPath,
        start: segment.start ?? 0,
        duration: segment.duration,
      });
    } else {
      throw new Error(`${spec.id} has unsupported segment type: ${segment.type}`);
    }
    segmentPaths.push(outputPath);
  }

  const listPath = join(specTmpRoot, "concat.txt");
  await writeFile(listPath, segmentPaths.map((path) => `file '${path.replaceAll("'", "'\\''")}'`).join("\n"), "utf8");

  const finalPath = resolve(outputRoot, `${spec.id}.mp4`);
  await run("ffmpeg", [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    listPath,
    "-c",
    "copy",
    "-movflags",
    "+faststart",
    finalPath,
  ]);

  console.log(`rendered ${finalPath}`);
}

await rm(tmpRoot, { recursive: true, force: true });

async function renderImageSegment({ sourcePath, outputPath, duration }) {
  await run("ffmpeg", [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-loop",
    "1",
    "-t",
    String(duration),
    "-i",
    sourcePath,
    "-vf",
    "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,format=yuv420p",
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "20",
    "-pix_fmt",
    "yuv420p",
    outputPath,
  ]);
}

async function renderVideoSegment({ sourcePath, outputPath, start, duration }) {
  await run("ffmpeg", [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-ss",
    String(start),
    "-t",
    String(duration),
    "-i",
    sourcePath,
    "-vf",
    "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,format=yuv420p",
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "20",
    "-pix_fmt",
    "yuv420p",
    outputPath,
  ]);
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
