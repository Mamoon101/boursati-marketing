# Source System

This folder contains the source files used to regenerate the approved Boursati final system.

- `content/` - structured asset, carousel, and video specs.
- `src/` - visual templates and rendering logic.
- `scripts/` - generation and packaging commands.
- `test/` - checks that protect the system from mistakes.
- `exports/` - generated working outputs used by the source system and parked video concepts.

The image assets and source captures live one level up in `../assets/` and `../captures/` so this final system stays self-contained.

Useful checks:

```bash
node --test BOURSATI_FINAL_SYSTEM/05_source_system/test/brand-families.test.mjs BOURSATI_FINAL_SYSTEM/05_source_system/test/carousels.test.mjs BOURSATI_FINAL_SYSTEM/05_source_system/test/promo-videos.test.mjs
```
