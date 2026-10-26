# DWparts

[English](README.md) | **简体中文**

DWparts 是手机游戏《地牢深处》（Dungeon Within）的非官方资料站。该游戏由 Game Coaster 开发并发行。本站收录魔物及其部件、属性、伤害类型与相关游戏数据，并提供标签筛选功能以缩小检索范围。

本站为静态生成文档。魔物数据存放于 YAML 文件，模板为 Astro 组件，客户端 JavaScript 只有驱动筛选器的一个 Vue 岛。图片在构建期由 PNG 转码为无损 WebP。请求期不生成任何内容，也不存在服务端组件。

本项目与 Game Coaster 无隶属、授权或赞助关系。授权是分层且不统一的：[LICENSE](LICENSE) 中的 MIT 许可仅适用于原创代码，不延伸至游戏素材或第三方代码。本仓库各类文件的适用条款见 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)。

## 仓库结构

| 路径 | 内容 | 授权 |
| --- | --- | --- |
| `src/content/monsters/*.yaml` | 魔物数据，唯一数据源 | MIT |
| `src/content.config.ts` | 上述数据的 zod schema | MIT |
| `src/components/*.astro` | 卡片、图标、内联标记的模板 | MIT |
| `src/components/FilterPanel.vue` | 标签筛选器（唯一的客户端岛） | MIT |
| `src/lib/*.ts` | 词表、筛选键推导、内联标记解析 | MIT |
| `src/pages/` | 索引页与各魔物详情页 | MIT |
| `src/styles/wiki.css` | 项目样式表 | MIT |
| `scripts/build-images.ts` | PNG → 无损 WebP 转码 | MIT |
| `scripts/check.ts` | 构建前内容完整性校验 | MIT |
| `assets/raw/common/`、`assets/raw/characters/` | PNG 原始件，唯一新增图片的位置 | © Game Coaster |
| `legacy/` | v1 单页站点，仅作迁移参照 | 混合，见第三方声明 |
| `CNAME`、`robots.txt` | 静态托管元数据，原样复制到产物 | — |

生成的 WebP（`public/img/`）、构建产物（`dist/`）与依赖均被 git 忽略。

## 本地开发

```bash
pnpm install
pnpm dev          # 先转码图片，再在 :4321 启动
```

需要 Node ≥ 22 与 `cwebp`（Debian：`apt install webp`）。

| 命令 | 作用 |
| --- | --- |
| `pnpm check` | 校验内容：图标缺失、筛选键不可达、死按钮、立绘缺失 |
| `pnpm images` | 将新增或变更的 PNG 转码为 WebP（按哈希增量） |
| `pnpm images:force` | 全量重转 |
| `pnpm images:prune` | 同时删除失去 PNG 源的 WebP 产物 |
| `pnpm build` | `check` → `images` → `astro build` |
| `pnpm check:types` | `astro check`（类型检查） |

## 数据模型

一只魔物为五张卡：`char_row`（头像、属性、基础动作）加四个部件（`b`、`m`、`s1`、`s2`）。

筛选键由结构化字段**推导**，不再手写进 class：

| 字段 | 推导出的键 |
| --- | --- |
| `level`、`race` | `lv1`、`野兽` |
| `parts[].slot` | `part_m`、`part_s1`、`part_s2`（`b` 例外，与 v1 一致） |
| `action` | `act_main`、`act_react`、`act_passive` |
| `bonus[].stat` | `bon_*` |
| `damage.type` | `tag_phy4` 等 |
| `damageStat` | `mult_*` |
| `save.dcStat` | `dc_*` |
| `attackTypes[]` | `melee`、`ranged`、`spell`、`AoE` |
| `hitStat` 与 `save` | `hit`、`save`、`hitnsave` |

文本字段使用内联标记而非原始 HTML：`{ele1|火焰伤害}` 渲染为图标加着色文字，`{blue|优势}` 渲染为着色文字，未知键会使 `pnpm check` 失败。

v1 → v2 的字段映射与回归基线见 [docs/MIGRATION.md](docs/MIGRATION.md)。

## 文件约定

以下条目属于结构性约束，非风格偏好；违反者不予接受。

- `assets/raw/` 下的文件名在 GitHub Pages 上区分大小写。引用须与磁盘上的大小写完全一致。
- 图片为带透明通道的无损 WebP。不得改用有损编码；图标为像素画，在显示尺寸下会出现可见失真。`scripts/build-images.ts` 使用 `cwebp -lossless -z 9`，不得替换为有损编码器或降低压缩级别。
- `assets/raw/` 存放 PNG 原始件，是唯一新增图片的位置。不得手工新增或编辑 `.webp`——它们属于构建产物且被 git 忽略。
- 筛选键必须来自 `src/lib/filterKeys.ts`。若在数据中新增伤害类型或加成却没有对应的筛选按钮，该数据将不可达，`pnpm check` 会失败。
- 本站不引入前端框架。筛选器是唯一的岛；不得将页面改为客户端渲染应用。

## 持续集成

`.github/workflows/ci.yml` 在每次推送与 Pull Request 时运行：安装 `cwebp`、以冻结锁文件安装依赖、运行 `pnpm check`、转码图片、构建、自检产物（入口页、CNAME、两个图片目录），并上传产物。推送到 `main` 时额外部署到 GitHub Pages。

在 v1 迁移完成前，类型检查以 `continue-on-error` 运行。

## 参与贡献

接受 Issue 与 Pull Request。改动应范围明确，且不得变更授权条款。若改动引入第三方代码或素材，须在同一提交内更新 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) 中的对应条目。

站点文本为中文，界面用语与游戏术语以中文版本为准。

## 授权

以下为摘要，权威文本见 [LICENSE](LICENSE) 与 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)。

| 类别 | 权利人 | 授权 | 可否商用 |
| --- | --- | --- | --- |
| 原创代码（模板、数据、脚本） | EpicRojas 及贡献者 | MIT | 可以 |
| `legacy/filter/ft_tag.js` | 克鲁赛德战记 wiki（biligame） | CC BY-NC-SA 3.0 | 禁止 |
| `legacy/filter/jquery-3.7.1.min.js` | OpenJS Foundation | MIT | 可以 |
| `assets/`、游戏内文本与数据 | Game Coaster | 保留所有权利 | 禁止 |

v2 的筛选器为原创实现，不承载任何第三方许可。上表中的 CC BY-NC-SA 3.0 义务仅约束归档的 `legacy/` 目录，该目录计划在迁移结束时移除；在此之前，本仓库整体仍不得用于商业用途。

## 免责声明

《地牢深处》及其相关素材为 Game Coaster 的财产。本仓库收录的游戏内容仅用于资料整理与评述目的。权利人如要求移除任何内容，可提交 Issue。
