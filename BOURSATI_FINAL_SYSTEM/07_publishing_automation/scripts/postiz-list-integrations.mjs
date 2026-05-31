const apiBaseUrl = process.env.POSTIZ_API_BASE_URL ?? "https://api.postiz.com/public/v1";
const apiKey = process.env.POSTIZ_API_KEY;

if (!apiKey || apiKey.includes("replace_with")) {
  throw new Error("POSTIZ_API_KEY is required. Get it from Postiz Settings > Developers > Public API.");
}

const response = await fetch(`${apiBaseUrl}/integrations`, {
  headers: {
    Authorization: apiKey,
  },
});

if (!response.ok) {
  throw new Error(`Failed to list integrations ${response.status}: ${await response.text()}`);
}

const integrations = await response.json();
console.log(JSON.stringify(integrations, null, 2));
