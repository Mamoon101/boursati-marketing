# Publishing Automation

This folder is for full automated posting after approval.

## Recommended Workflow

1. Approve assets in the review workbook.
2. Generate the Week 1 queue.
3. Dry-run the publishing schedule.
4. Connect Instagram/X accounts inside Postiz.
5. Run the scheduler in live mode.

## Why Postiz

Postiz is the recommended publishing engine because Codex can prepare and schedule posts through a workflow, while the social account authorization stays outside this project folder.

Codex should not store Instagram, X, Apple, or social passwords in this repository.

## Files

- `config/week-1-schedule.config.json` - launch date, time slots, timezone, and platform switches.
- `config/postiz.example.env` - environment variables needed for publishing.
- `config/postiz-integrations.example.json` - where Postiz integration IDs are mapped.
- `queue/week-1-approved-queue.json` - generated posting queue.
- `scripts/generate-week-1-queue.mjs` - builds the queue from approved Week 1 assets.
- `scripts/postiz-list-integrations.mjs` - lists connected Postiz channels so integration IDs can be copied into config.
- `scripts/postiz-schedule-week-1.mjs` - validates or schedules the queue through Postiz.
- `logs/` - dry-run or scheduling logs.

## Current State

Week 1 is approved. Week 2 and Week 3 are parked.

This automation is ready to generate a queue now. Live posting requires Postiz account connections and API credentials.
