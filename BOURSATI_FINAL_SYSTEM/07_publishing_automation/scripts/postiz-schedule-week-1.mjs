import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, resolve } from "node:path";

const automationRoot = resolve(import.meta.dirname, "..");
const queuePath = process.env.POSTIZ_QUEUE_PATH
  ? resolve(process.cwd(), process.env.POSTIZ_QUEUE_PATH)
  : resolve(automationRoot, "queue/week-1-approved-queue.json");
const logPath = resolve(automationRoot, `logs/postiz-week-1-${new Date().toISOString().replace(/[:.]/g, "-")}.log`);

const dryRun = process.env.POSTIZ_DRY_RUN !== "false";
const apiBaseUrl = process.env.POSTIZ_API_BASE_URL ?? "https://api.postiz.com/public/v1";
const apiKey = process.env.POSTIZ_API_KEY;
const integrationsFile = process.env.POSTIZ_INTEGRATIONS_FILE
  ? resolve(process.cwd(), process.env.POSTIZ_INTEGRATIONS_FILE)
  : resolve(automationRoot, "config/postiz-integrations.json");

const { queue } = JSON.parse(await fs.readFile(queuePath, "utf8"));
const integrations = existsSync(integrationsFile)
  ? JSON.parse(await fs.readFile(integrationsFile, "utf8"))
  : {};

const lines = [];
lines.push(`Dry run: ${dryRun}`);
lines.push(`Queue items: ${queue.length}`);

for (const item of queue) {
  if (!item.scheduledAt) {
    lines.push(`[BLOCKED] ${item.id} ${item.title}: missing scheduledAt. Set launchDate before live scheduling.`);
    continue;
  }

  const integration = integrations[item.platform];
  if (!integration?.enabled || !integration.integrationId || integration.integrationId.includes("replace_with")) {
    lines.push(`[BLOCKED] ${item.id} ${item.title}: missing ${item.platform} Postiz integration ID.`);
    continue;
  }

  for (const mediaPath of item.mediaPaths) {
    if (!existsSync(mediaPath)) {
      lines.push(`[BLOCKED] ${item.id} ${item.title}: missing media ${mediaPath}`);
    }
  }

  if (dryRun) {
    lines.push(`[DRY RUN] ${item.scheduledAt} ${item.platform} ${item.title} media=${item.mediaPaths.length}`);
    continue;
  }

  if (!apiBaseUrl || !apiKey || apiKey.includes("replace_with")) {
    lines.push(`[BLOCKED] ${item.id} ${item.title}: POSTIZ_API_BASE_URL and POSTIZ_API_KEY are required for live scheduling.`);
    continue;
  }

  try {
    const uploadedMedia = [];
    for (const mediaPath of item.mediaPaths) {
      uploadedMedia.push(await uploadMedia(mediaPath));
    }

    const created = await createPost({
      item,
      uploadedMedia,
      integrationId: integration.integrationId,
      settingsType: integration.settingsType ?? item.platform,
    });

    lines.push(`[SCHEDULED] ${item.id} ${item.platform} ${item.title}: ${JSON.stringify(created)}`);
  } catch (error) {
    lines.push(`[FAILED] ${item.id} ${item.platform} ${item.title}: ${error.message}`);
  }
}

await fs.writeFile(logPath, `${lines.join("\n")}\n`, "utf8");
console.log(lines.join("\n"));
console.log(`Log: ${logPath}`);

async function uploadMedia(mediaPath) {
  const form = new FormData();
  const bytes = await fs.readFile(mediaPath);
  form.append("file", new Blob([bytes], { type: mimeTypeFor(mediaPath) }), basename(mediaPath));

  const response = await fetch(`${apiBaseUrl}/upload`, {
    method: "POST",
    headers: {
      Authorization: apiKey,
    },
    body: form,
  });

  if (!response.ok) {
    throw new Error(`upload failed ${response.status}: ${await response.text()}`);
  }

  const uploaded = await response.json();
  return {
    id: uploaded.id,
    path: uploaded.path,
  };
}

async function createPost({ item, uploadedMedia, integrationId, settingsType }) {
  const response = await fetch(`${apiBaseUrl}/posts`, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: item.mode === "draft" ? "draft" : "schedule",
      date: item.scheduledAt,
      shortLink: false,
      tags: [],
      posts: [
        {
          integration: {
            id: integrationId,
          },
          value: [
            {
              content: item.platform === "instagram" && isStory(item) ? "" : item.caption,
              image: uploadedMedia,
            },
          ],
          settings: settingsFor({ item, settingsType }),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`create post failed ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

function settingsFor({ item, settingsType }) {
  if (item.platform === "instagram") {
    return {
      __type: settingsType,
      post_type: isStory(item) ? "story" : "post",
      is_trial_reel: false,
      collaborators: [],
    };
  }

  if (item.platform === "x") {
    return {
      __type: "x",
      who_can_reply_post: "everyone",
    };
  }

  return {
    __type: settingsType,
  };
}

function isStory(item) {
  return item.sourceAsset.startsWith("stories-reels/");
}

function mimeTypeFor(filePath) {
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
  if (filePath.endsWith(".webp")) return "image/webp";
  if (filePath.endsWith(".mp4")) return "video/mp4";
  return "application/octet-stream";
}
