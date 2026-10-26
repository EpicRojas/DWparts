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

## 进度

### P0 骨架 —— 完成

Astro + Vue island、zod schema、推导式 `data-tags`、Vue 筛选岛（URL 同步 / 计数 / 空态）、
无损 WebP 管线（与 v1 产物 **125/125 字节一致**）、`scripts/check.ts`、CI workflow。

### P1 数据迁移 —— 完成

`python3 scripts/migrate/extract.py` 把 18184 行 HTML 切成 76 个 YAML。
提取器只做确定性转换，不做猜测；`scripts/migrate/verify.ts` 与 `textdiff.py` 是验收标准。

三条验收全部通过：

| 验收项 | 结果 |
| --- | --- |
| 筛选键与 v1 逐卡对比 | **完全一致**（304 张部件卡，v1 有的键 v2 全部保留） |
| 可见文本与 v1 逐字段对比 | **0 处丢失**（名称 / 加成 / 正文 / 效果 / 标签） |
| 卡片数量 | 76 char_row + 304 部件 = 380 个 `data-tags`，与 v1 的 `ft_list` 数量相等 |

### P1 过程中发现并修掉的 v1 数据缺陷

迁移的意义不只是搬家——下面这些是 v1 真实存在、用户能看见的问题：

1. **`b` 卡（种族特性）普遍漏写筛选 class**：36 张卡在页面上显示了「攻击类型 / 加值 / 豁免」，
   但 class 里没有对应标记，导致这些特性无法被筛选到。v2 从可见标签补齐，
   共补出 103 个键。
2. **`s1`/`s2` 普遍漏显示「总是生效」标签**：90 张卡的 class 里有 `act_passive`，
   但页面不显示该标签，用户无从得知。v2 补上了标签显示。
3. **`ELM901` 的 m 部件文本与图标矛盾**：文本写「基于魅力」，图标和 class 都是 INT。
   v2 以图标为准（与 class 同源），渲染为「基于智力」。
4. **`BST902` 等 3 张卡的攻击类型显示不全**：class 里有 `AoE`，页面只写「法术远程」，
   导致筛「范围」能筛到、但用户看不出为什么。v2 统一按数据渲染。
5. **`phy1`（挥砍）图标从缺**：7 处引用、`assets/raw` 里没有源 PNG，v1 一直静默破图。
   v2 降级为着色文字，并在 `pnpm check` 里作为已知警告列出。

### 未完成

删除 `legacy/` 与 CC BY-NC-SA 依赖、搜索框、sitemap、补 lv8/lv9 缺失角色。

## 迁移工具

| 命令 | 作用 |
| --- | --- |
| `pnpm migrate` | 由 `legacy/index.html` 重新生成 76 个 YAML |
| `pnpm verify:migration` | 筛选键对比 + 文本保真对比 |
| `pnpm test:filter` | 筛选逻辑单元测试（15 项） |
| `pnpm smoke` | 产物冒烟测试 |

## 筛选器失效事故记录

P1 期间有一个 bug 一路绿灯到成品：**部件卡模板漏写了 `ft_list` 类**。
筛选器用 `querySelectorAll('.ft_list')` 选卡片，于是只选到 76 张 `char_row`，
304 张部件卡永远筛不到——筛选器对部件完全不起作用。

它没被发现的理由值得记下来：构建成功、`check.ts` 通过、筛选键与 v1 逐卡一致、
文本 0 丢失，**没有任何一步去看成品里的筛选行为**。`verify.ts` 比的是数据，
`textdiff.py` 比的是文本，两者都不碰交互。

现在有三道防线：

1. `src/lib/filterState.ts` —— 把筛选逻辑从 Vue 组件里抽成纯函数，可测；
2. `scripts/test-filter.ts` —— 15 项用例，含「不做子串匹配」（`lv9` 不能命中 `lv90`）
   与「查询串往返一致」；
3. `scripts/smoke.ts` —— 直接读 `dist/index.html`，断言
   `ft_list` 元素数 == `data-tags` 数（这条就是当时漏掉的检查）、无死按钮、
   复合筛选既不空也不全命中、每怪 5 张卡、图片引用全部可解析。

三者都接进了 `pnpm build` 与 CI。教训是：**验收要盯着成品，而不是盯着源数据。**

`scripts/migrate/` 下的 Python 工具依赖 `minidom.py`（内置的小型 DOM）与 `yamlio.py`
（内置的 YAML 输出），不是通用库，只为本项目的数据形态服务。
`legacy-tags.json` 是 v1 筛选类的快照，`verify.ts` 的比对基准，删 `legacy/` 时一并删除。
