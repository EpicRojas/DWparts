# Third-Party Notices

This repository is not uniformly licensed. This document records every third-party component and every category of content that is not covered by the project's own MIT license, together with the terms that apply to each.

本仓库的授权并不统一。本文档逐项记录所有第三方组件，以及不受本项目自身 MIT 许可覆盖的各类内容，并列明各自适用的条款。

---

## 1. Game assets and game data

- **Rights holder:** Game Coaster, developer and publisher of *Dungeon Within* (《地牢深处》)
- **Scope:** all files under `img/raw/`, `img/common/` and `img/characters/` (PNG originals, derived WebP icons, UI assets and character portraits), and all in-game text, numeric values and data reproduced in `index.html`
- **Note:** the WebP files under `img/common/` and `img/characters/` are mechanically derived from `img/raw/` and carry the same rights as their sources. Converting a format does not create a new work or alter ownership.
- **License:** none granted. All rights reserved.
- **Basis for inclusion:** informational and commentary use within a non-commercial fan project.
- **Reuse:** redistribution and reuse are not permitted. Forking this repository conveys no rights to these materials.

Removal requests from rights holders will be actioned on receipt of an issue.

## 2. Tag filter — `filter/ft_tag.js`

- **Original author:** 克鲁赛德战记 wiki (biligame)
- **Source:** `https://wiki.biligame.com/cq/MediaWiki:Common.js`, lines 1596–1641
- **License:** Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported (CC BY-NC-SA 3.0), <https://creativecommons.org/licenses/by-nc-sa/3.0/>
- **Modifications:** none. The file is redistributed verbatim.

Three conditions follow from this license and apply at repository level:

- *NonCommercial* — the repository as a whole may not be used for commercial purposes, notwithstanding the MIT license on the original code.
- *ShareAlike* — redistribution of this file, modified or not, must remain under CC BY-NC-SA 3.0.
- *Attribution* — the credit above must be preserved in any redistribution.

## 3. jQuery 3.7.1 — `filter/jquery-3.7.1.min.js`

- **Copyright:** OpenJS Foundation and other contributors, <https://openjsf.org/>
- **Project:** <https://jquery.com/>
- **License:** MIT, <https://jquery.com/license/>
- **Modifications:** none. jQuery is redistributed under its own MIT notice and is not relicensed by this project.

## 4. Original project code — MIT

- **Scope:** `index.html`, `wiki_style.css`, `filter/filter.css`, and the documentation files
- **Copyright:** EpicRojas and DWparts contributors
- **License:** MIT, as set out in [LICENSE](LICENSE)

---

## Summary

| Component | Path | Rights holder | License | Commercial use |
| --- | --- | --- | --- | --- |
| Original code | `*.html`, `*.css` | EpicRojas and contributors | MIT | Permitted |
| Tag filter | `filter/ft_tag.js` | 克鲁赛德战记 wiki | CC BY-NC-SA 3.0 | Prohibited |
| jQuery | `filter/jquery-3.7.1.min.js` | OpenJS Foundation | MIT | Permitted |
| Game assets and data | `img/`, embedded data | Game Coaster | All rights reserved | Prohibited |

Two of the four categories prohibit commercial use or prohibit reuse entirely. The repository as a whole is therefore non-commercial and is not freely reusable, and the MIT license applies to the original code alone.

四类内容中有两类禁止商用，或完全禁止复用。因此本仓库整体为非商业用途且不可自由复用，MIT 许可仅适用于原创代码。
