# DWparts

**English** | [简体中文](README.zh-CN.md)

DWparts is an unofficial reference site for the mobile game *Dungeon Within* (Chinese title 《地牢深处》), developed and published by Game Coaster. It documents monsters, attributes, damage types and related game data, and provides a tag-based filter for narrowing that data set.

The site is a static document. It comprises one HTML page, one project stylesheet, one filter stylesheet, one filter script, and a vendored copy of jQuery. No build step, package manager or server-side component is involved. The page functions correctly when served by any static HTTP server, and also when opened directly from the filesystem, as all references are relative.

The project is not affiliated with, endorsed by or sponsored by Game Coaster. Licensing is partial and non-uniform: the MIT license in [LICENSE](LICENSE) applies to the original HTML and CSS only, and does not extend to game assets or third-party code. [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) states the terms for each category of file in this repository.

## Repository layout

| Path | Contents | Licensing |
| --- | --- | --- |
| `index.html` | The wiki document; entry point | MIT |
| `wiki_style.css` | Project stylesheet | MIT |
| `filter/filter.css` | Styles for the tag filter | MIT |
| `filter/ft_tag.js` | Tag filter logic | CC BY-NC-SA 3.0 |
| `filter/jquery-3.7.1.min.js` | jQuery 3.7.1, unmodified | MIT |
| `img/common/` | Icons and UI assets, lossless WebP — referenced by the page (47 files) | © Game Coaster |
| `img/characters/` | Character portraits, lossless WebP — referenced by the page (78 files) | © Game Coaster |
| `img/raw/` | Original PNG sources for the above, never referenced by the page (125 files) | © Game Coaster |
| `CNAME` | Custom domain for GitHub Pages | — |

## Running locally

```bash
git clone https://github.com/EpicRojas/DWparts.git
cd DWparts
python3 -m http.server 8000
```

Open `http://localhost:8000`. Any equivalent static server is acceptable.

## File conventions

The following are structural constraints, not style preferences; changes that violate them will be rejected.

- Filenames under `img/` are case-sensitive when served by GitHub Pages. References in the HTML must match the on-disk case exactly; `img/common/AC.webp` and `img/common/ac.webp` denote distinct files.
- Images are lossless WebP with alpha. Do not introduce lossy re-encoding; the icons are pixel art and artefacts are visible at display size.
- `img/raw/` holds the PNG originals and is the only place images are added. The WebP files under `img/common/` and `img/characters/` are build output; do not edit or add them by hand.
- The page references `img/common/` and `img/characters/` only. Nothing under `img/raw/` is referenced from the HTML.
- The site remains dependency-free. Frameworks and build tooling are not accepted.

## Contributing

Issues and pull requests are accepted. Changes should be narrow in scope and must not alter the licensing terms. Where a change introduces third-party code or assets, the corresponding entry in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) is updated in the same commit.

The site text is Chinese; the interface language and game terminology follow the Chinese release.

## Licensing

Summarized below. The authoritative text is [LICENSE](LICENSE) and [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

| Category | Rights holder | License | Commercial use |
| --- | --- | --- | --- |
| Original HTML and CSS | EpicRojas and contributors | MIT | Permitted |
| `filter/ft_tag.js` | 克鲁赛德战记 wiki (biligame) | CC BY-NC-SA 3.0 | Prohibited |
| `filter/jquery-3.7.1.min.js` | OpenJS Foundation | MIT | Permitted |
| `img/`, in-game text and data | Game Coaster | All rights reserved | Prohibited |

Because `filter/ft_tag.js` carries a NonCommercial condition, the repository as a whole may not be used for commercial purposes, notwithstanding the MIT license applied to the original code.

## Disclaimer

*Dungeon Within* and its associated assets are the property of Game Coaster. Game content is reproduced here for informational and commentary purposes only. Rights holders may request removal of any material by opening an issue.
