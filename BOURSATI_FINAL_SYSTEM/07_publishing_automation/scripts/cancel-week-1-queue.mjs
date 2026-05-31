const apiBaseUrl = process.env.POSTIZ_API_BASE_URL ?? "https://api.postiz.com/public/v1";
const apiKey = process.env.POSTIZ_API_KEY;

if (!apiKey || apiKey.includes("replace_with")) {
  throw new Error("POSTIZ_API_KEY is required.");
}

const startDate = "2026-05-26T00:00:00.000Z";
const endDate = "2026-06-02T23:59:59.999Z";

const response = await fetch(`${apiBaseUrl}/posts?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`, {
  headers: { Authorization: apiKey },
});

if (!response.ok) {
  throw new Error(`Failed to list posts ${response.status}: ${await response.text()}`);
}

const data = await response.json();
const posts = (data.posts ?? []).filter((post) => {
  return post.creationMethod === "API"
    && post.state === "QUEUE"
    && ["instagram-standalone", "x"].includes(post.integration?.providerIdentifier);
});

console.log(`Found ${posts.length} queued API posts to delete.`);
for (const post of posts) {
  const deleted = await fetch(`${apiBaseUrl}/posts/${post.id}`, {
    method: "DELETE",
    headers: { Authorization: apiKey },
  });
  console.log(`${post.id} ${deleted.status} ${deleted.statusText}`);
  if (!deleted.ok) {
    console.log(await deleted.text());
  }
}
