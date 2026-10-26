# 迁移说明（v1 单页 → v2 SSG）

## 为什么要重写

v1 是一个 680 KB / 18184 行的 `index.html`，数据、模板、样式三者混在一起。这带来几个结构性问题：

1. **不可校验**。筛选元数据是手写的 class 字符串，与卡片内容全靠人工保持一致。已经出现过「筛选器列了 11 种伤害类型，而数据里还用了 phy1/ele5 两种没有按钮的类型」。
2. **静默破图**。`img/common/phy1.webp` 被引用 7 次但文件不存在（`assets/raw` 里也没有源 PNG），页面只是安静地显示裂图。
3. **授权受限**。`filter/ft_tag.js` 逐字取自克鲁赛德战记 wiki，CC BY-NC-SA 3.0，导致整个仓库不可商用。

## v2 的结构

```
src/content/monsters/*.yaml    ← 唯一数据源（zod 校验）
src/components/*.astro         ← 模板，无手写 class
src/lib/{taxonomy,derive,markup,filterKeys}.ts
scripts/build-images.ts        ← PNG → 无损 WebP
scripts/check.ts               ← 内容完整性校验（CI 前置）
legacy/                        ← v1 原件，仅作迁移参照，P1 完成后删除
```

### 数据模型

一只魔物 = 5 张卡：`char_row`（头像 + 属性 + 基础动作）+ 4 个部件（`b`/`m`/`s1`/`s2`）。

`data-tags` 由结构化字段**推导**，不再手写：

| 字段 | 推导出的筛选键 |
| --- | --- |
| `level` / `race` | `lv1`、`野兽` |
| `parts[].slot` | `part_m` / `part_s1` / `part_s2`（`b` 不参与类型筛选，与 v1 一致） |
| `action` | `act_main` / `act_react` / `act_passive` |
| `bonus[].stat` | `bon_*` |
| `damage.type` | `tag_phy4` 等 |
| `damageStat` | `mult_*` |
| `save.dcStat` | `dc_*` |
| `attackTypes[]` | `melee` / `ranged` / `spell` / `AoE` |
| `hitStat` + `save` | `hit` / `save` / `hitnsave` |

### 内联标记

v1 在 HTML 里直接写 `<img src="img/common/ele1.webp"><span class="ele1">火焰伤害</span>`。
v2 在 YAML 里写 `{ele1|火焰伤害}`，由 `src/lib/markup.ts` 解析：

- key 命中图标表 → 图标 + 着色文字（图标缺失时退化为红色 ◆ 并在 `pnpm check` 报错）
- key 命中文字色表（`pink`/`blue`/`lb`/`lgreen`/…）→ 仅着色文字
- 其余 → 原样输出，同时 `pnpm check` 报「未知的内联标记」

## 迁移回归基线

v1 全量数据的实测值，P1 完成后新站的产出必须逐项对上：

| 指标 | v1 实测 |
| --- | --- |
| 魔物 | 76 |
| `char_row` 卡 | 76 |
| 部件卡 | 304 |
| `ft_list` 元素合计 | 380 |
| 图片引用 | 123 个（其中 2 个缺失：phy1/ele5） |
| `<div>` 开闭 | 9063 / 9063 |

## P0 已完成 / 未完成

已完成：Astro 骨架、zod schema、推导式 `data-tags`、Vue 筛选岛（URL 同步 / 计数 / 空态）、
无损 WebP 管线（与 v1 产物 **125/125 字节一致**）、`scripts/check.ts`、CI workflow。
3 只样本：BST101 / ELM101 / UDD101（覆盖野兽/精灵/亡灵，含治疗、反应、被动、豁免各类型）。

未完成：76 只怪的数据迁移（P1）、删除 `legacy/` 与 CC BY-NC-SA 依赖（P2 之后）、
搜索框、sitemap、补 lv8/lv9 缺失角色。
