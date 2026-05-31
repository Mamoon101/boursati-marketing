# Publishing Automation Next Steps

## What Is Ready

- Week 1 approved queue generated with 18 posts.
- Week 1 assets are mapped to captions and media files.
- Dry-run scheduler blocks live posting until required setup is complete.

## What Is Needed For Live Posting

1. Choose launch date.
2. Connect Instagram account in Postiz.
3. Connect X account in Postiz, if X is included.
4. Get the Public API key from Postiz Settings > Developers > Public API.
5. Copy `config/postiz-integrations.example.json` to `config/postiz-integrations.json`.
6. Add the real Postiz integration IDs.
7. Copy `config/postiz.example.env` to a local `.env` file outside versioned notes or export the variables in terminal.
8. Regenerate the queue.
9. Run dry-run again.
10. Run live scheduling only after dry-run shows no blocked items.

## Commands

Generate queue:

```bash
node BOURSATI_FINAL_SYSTEM/07_publishing_automation/scripts/generate-week-1-queue.mjs
```

Dry run:

```bash
POSTIZ_DRY_RUN=true node BOURSATI_FINAL_SYSTEM/07_publishing_automation/scripts/postiz-schedule-week-1.mjs
```

List Postiz integrations after exporting `POSTIZ_API_KEY`:

```bash
node BOURSATI_FINAL_SYSTEM/07_publishing_automation/scripts/postiz-list-integrations.mjs
```

Live mode, after credentials and integrations are configured:

```bash
POSTIZ_DRY_RUN=false node BOURSATI_FINAL_SYSTEM/07_publishing_automation/scripts/postiz-schedule-week-1.mjs
```

## Important

Do not paste passwords into Codex. Social account authorization should happen inside Postiz or the official social platform OAuth flow.
