# Third-Party Notices

This repository is not uniformly licensed. This document records every third-party component and every category of content that is not covered by the project's own MIT license, together with the terms that apply to each.

本仓库的授权并不统一。本文档逐项记录所有第三方组件，以及不受本项目自身 MIT 许可覆盖的各类内容，并列明各自适用的条款。

---

## 1. Game assets and game data

- **Rights holder:** Game Coaster, developer and publisher of *Dungeon Within* (《地牢深处》)
- **Scope:** all files under `assets/raw/` (PNG originals), the WebP files derived from them at build time, and all in-game text, numeric values and data reproduced in `src/content/monsters/`
- **Note:** the WebP files under `public/img/` are mechanically generated from `assets/raw/` and carry the same rights as their sources. Converting a format does not create a new work or alter ownership. They are git-ignored and are not distributed via this repository, only via the built site.
- **License:** none granted. All rights reserved.
- **Basis for inclusion:** informational and commentary use within a non-commercial fan project.
- **Reuse:** redistribution and reuse are not permitted. Forking this repository conveys no rights to these materials.

Removal requests from rights holders will be actioned on receipt of an issue.

## 2. Tag filter — v2 is original

The v2 filter (`src/components/FilterPanel.vue` and the `src/lib/filterKeys.ts` definitions) is an original implementation written for this project and is covered by the project's MIT license. It shares no code with the v1 filter described below.

v2 的筛选器为本项目原创实现，采用 MIT 许可，与下述 v1 筛选器不共享任何代码。

## 3. Archived v1 site — `legacy/`

`legacy/` preserves the v1 single-page site as a migration reference and contains two third-party components. It is not part of the built output and is scheduled for removal when the migration completes.

### 3.1 `legacy/filter/ft_tag.js`

- **Original author:** 克鲁赛德战记 wiki (biligame)
- **Source:** `https://wiki.biligame.com/cq/MediaWiki:Common.js`, lines 1596–1641
- **License:** Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported (CC BY-NC-SA 3.0), <https://creativecommons.org/licenses/by-nc-sa/3.0/>
- **Modifications:** none. The file is redistributed verbatim.

Three conditions follow from this license and apply to this file and its derivatives:

- *NonCommercial* — it may not be used for commercial purposes.
- *ShareAlike* — redistribution of this file, modified or not, must remain under CC BY-NC-SA 3.0.
- *Attribution* — the credit above must be preserved in any redistribution.

### 3.2 `legacy/filter/jquery-3.7.1.min.js`

- **Copyright:** OpenJS Foundation and other contributors, <https://openjsf.org/>
- **Project:** <https://jquery.com/>
- **License:** MIT, <https://jquery.com/license/>
- **Modifications:** none. jQuery is redistributed under its own MIT notice and is not relicensed by this project.

## 4. Build and runtime dependencies

All are declared in `package.json` and installed from the registry; none are vendored into this repository.

| Package | License | Role |
| --- | --- | --- |
| `astro` | MIT | Static site generator |
| `@astrojs/vue` | MIT | Vue integration for Astro |
| `vue` | MIT | Runtime for the filter island |
| `yaml` | ISC | YAML parsing in `scripts/check.ts` |
| `tsx` | MIT | Running the TypeScript build scripts |
| `typescript` | Apache-2.0 | Type checking |

`cwebp` from the WebP project (BSD-3-Clause) is used at build time as an external binary; it is not redistributed here.

## 5. Original project code — MIT

- **Scope:** everything under `src/`, `scripts/`, and the documentation files, except as noted above
- **Copyright:** EpicRojas, FancyStarry and DWparts contributors
- **License:** MIT, as set out in [LICENSE](LICENSE)

---

## Summary

| Component | Path | Rights holder | License | Commercial use |
| --- | --- | --- | --- | --- |
| Original code (v2) | `src/`, `scripts/` | EpicRojas and contributors | MIT | Permitted |
| Original filter (v2) | `src/components/FilterPanel.vue` | EpicRojas and contributors | MIT | Permitted |
| Tag filter (v1, archived) | `legacy/filter/ft_tag.js` | 克鲁赛德战记 wiki | CC BY-NC-SA 3.0 | Prohibited |
| jQuery (v1, archived) | `legacy/filter/jquery-3.7.1.min.js` | OpenJS Foundation | MIT | Permitted |
| Game assets and data | `assets/`, `src/content/monsters/` | Game Coaster | All rights reserved | Prohibited |

Two of the five categories prohibit commercial use or prohibit reuse entirely. Until `legacy/` is removed, the repository as a whole is therefore non-commercial and is not freely reusable, and the MIT license applies to the original code alone. Once `legacy/` is deleted, the only remaining restriction will be the game assets themselves.

五类内容中有两类禁止商用，或完全禁止复用。在 `legacy/` 被删除之前，本仓库整体为非商业用途且不可自由复用，MIT 许可仅适用于原创代码。`legacy/` 删除后，剩余的授权限制将仅来自游戏素材本身。
