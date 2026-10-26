# DWparts

**English** | [简体中文](README.zh-CN.md)

DWparts is an unofficial reference site for the mobile game *Dungeon Within* (Chinese title 《地牢深处》), developed and published by Game Coaster. It documents monsters, their parts, attributes, damage types and related game data, and provides a tag-based filter for narrowing that data set.

The site is a statically generated document. Monster data lives in YAML files, templates are Astro components, and the only client-side JavaScript is a single Vue island that drives the filter. Images are transcoded from PNG to lossless WebP at build time. Nothing is generated at request time and no server-side component exists.

The project is not affiliated with, endorsed by or sponsored by Game Coaster. Licensing is partial and non-uniform: the MIT license in [LICENSE](LICENSE) applies to the original code only, and does not extend to game assets or third-party code. [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) states the terms for each category of file in this repository.

## Repository layout

| Path | Contents | Licensing |
| --- | --- | --- |
| `src/content/monsters/*.yaml` | Monster data; the single source of truth | MIT |
| `src/content.config.ts` | Zod schema for the data above | MIT |
| `src/components/*.astro` | Templates for cards, icons, inline markup | MIT |
| `src/components/FilterPanel.vue` | The tag filter (the only client island) | MIT |
| `src/lib/*.ts` | Taxonomy, derived filter keys, inline-markup parser | MIT |
| `src/pages/` | Index page and per-monster pages | MIT |
| `src/styles/wiki.css` | Stylesheet | MIT |
| `scripts/build-images.ts` | PNG → lossless WebP transcoder | MIT |
| `scripts/check.ts` | Pre-build content integrity checks | MIT |
| `assets/raw/common/`, `assets/raw/characters/` | PNG originals; the only place images are added | © Game Coaster |
| `legacy/` | The v1 single-page site, kept as a migration reference | mixed — see notices |
| `CNAME`, `robots.txt` | Static hosting metadata, copied verbatim to output | — |

Generated WebP (`public/img/`), build output (`dist/`) and dependencies are git-ignored.

## Local development

```bash
pnpm install
pnpm dev          # transcodes images, then serves on :4321
```

Requires Node ≥ 22 and `cwebp` (Debian: `apt install webp`).

| Command | Effect |
| --- | --- |
| `pnpm check` | Validate content: missing icons, unreachable filter keys, dead filter buttons, missing portraits |
| `pnpm images` | Transcode new or changed PNGs to WebP (hash-cached) |
| `pnpm images:force` | Re-transcode everything |
| `pnpm images:prune` | Also delete WebP output whose PNG source is gone |
| `pnpm build` | `check` → `images` → `astro build` |
| `pnpm check:types` | `astro check` (type checking) |

## How the data model works

One monster is five cards: a `char_row` (portrait, attributes, basic action) plus four parts (`b`, `m`, `s1`, `s2`).

Filter keys are **derived** from structured fields rather than hand-written into class names:

| Field | Derived keys |
| --- | --- |
| `level`, `race` | `lv1`, `野兽` |
| `parts[].slot` | `part_m`, `part_s1`, `part_s2` (`b` is exempt, as in v1) |
| `action` | `act_main`, `act_react`, `act_passive` |
| `bonus[].stat` | `bon_*` |
| `damage.type` | `tag_phy4`, … |
| `damageStat` | `mult_*` |
| `save.dcStat` | `dc_*` |
| `attackTypes[]` | `melee`, `ranged`, `spell`, `AoE` |
| `hitStat` + `save` | `hit`, `save`, `hitnsave` |

Text fields use inline markup instead of raw HTML: `{ele1|火焰伤害}` renders an icon plus colour-coded text, `{blue|优势}` renders coloured text, and an unknown key fails `pnpm check`.

See [docs/MIGRATION.md](docs/MIGRATION.md) for the v1 → v2 mapping and the regression baseline.

## File conventions

The following are structural constraints, not style preferences; changes that violate them will be rejected.

- Filenames under `assets/raw/` are case-sensitive when served by GitHub Pages. A referenced name must match the on-disk case exactly.
- Images are lossless WebP with alpha. Do not introduce lossy re-encoding; the icons are pixel art and artefacts are visible at display size. `scripts/build-images.ts` uses `cwebp -lossless -z 9` and must not be replaced with a lossy encoder or a lower effort level.
- `assets/raw/` holds the PNG originals and is the only place images are added. Never add or edit a `.webp` by hand — they are build output and are git-ignored.
- Filter keys must come from `src/lib/filterKeys.ts`. Adding a damage type or bonus to the data without adding a corresponding filter button makes it unreachable, and `pnpm check` will fail.
- The site remains free of UI frameworks. The filter is the only island; do not convert the page to a client-rendered app.

## Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request: install `cwebp`, install dependencies with a frozen lockfile, run `pnpm check`, transcode images, build, then self-check the output (index, CNAME, both image directories) and upload the artifact. Pushes to `main` additionally deploy to GitHub Pages.

Type checking currently runs with `continue-on-error` while the migration from v1 is in progress.

## Contributing

Issues and pull requests are accepted. Changes should be narrow in scope and must not alter the licensing terms. Where a change introduces third-party code or assets, the corresponding entry in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) is updated in the same commit.

The site text is Chinese; the interface language and game terminology follow the Chinese release.

## Licensing

Summarized below. The authoritative text is [LICENSE](LICENSE) and [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

| Category | Rights holder | License | Commercial use |
| --- | --- | --- | --- |
| Original code (templates, data, scripts) | EpicRojas and contributors | MIT | Permitted |
| `legacy/filter/ft_tag.js` | 克鲁赛德战记 wiki (biligame) | CC BY-NC-SA 3.0 | Prohibited |
| `legacy/filter/jquery-3.7.1.min.js` | OpenJS Foundation | MIT | Permitted |
| `assets/`, in-game text and data | Game Coaster | All rights reserved | Prohibited |

The v2 filter is an original implementation and carries no third-party license. The CC BY-NC-SA 3.0 obligation in the table above applies only to the archived `legacy/` directory, which is scheduled for removal at the end of the migration; until then the repository as a whole still may not be used for commercial purposes.

## Disclaimer

*Dungeon Within* and its associated assets are the property of Game Coaster. Game content is reproduced here for informational and commentary purposes only. Rights holders may request removal of any material by opening an issue.
