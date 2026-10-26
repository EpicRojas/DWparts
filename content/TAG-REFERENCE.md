# 标签速查表

本文件由 `scripts/build-tag-reference.mjs` 依据 `content/tags.yaml` 与
`content/monsters/` 的实际内容生成，用于查阅各属性可填写的值。

修改标签体系后执行 `pnpm reference` 重新生成，不要手工编辑本文件。

## 属性总览

| 属性 | 所属元素 | 类型 | 取值个数 |
| --- | --- | --- | --- |
| `data-id` | article | 字符串 | — |
| `data-name` | article | 字符串 | — |
| `data-race` | article | 枚举 | 3 |
| `data-level` | article | 枚举 | 9 |
| `data-part` | li.part | 枚举 | 4 |
| `data-act` | li.part | 枚举 | 3 |
| `data-bonus` | li.part | 枚举 | 11 |
| `data-dmg` | li.part | 枚举 | 11 |
| `data-mult` | li.part | 枚举 | 6 |
| `data-dcbonus` | li.part | 枚举 | 6 |
| `data-attack` | li.part | 枚举 | 4 |
| `data-check` | li.part | 枚举 | 2 |
| `data-hit` | li.part | 枚举（六项属性） | 6 |
| `data-save` | li.part | 字符串 `属性:DC` | — |
| `data-str` | article | 整数 | 22 |
| `data-dex` | article | 整数 | 19 |
| `data-con` | article | 整数 | 20 |
| `data-int` | article | 整数 | 23 |
| `data-wis` | article | 整数 | 23 |
| `data-cha` | article | 整数 | 25 |
| `data-dom` | article | 整数 | 9 |
| `data-hp` | article | 整数 | 57 |
| `data-ac` | article | 整数 | 1 |

## 枚举属性

取值区分大小写，多个值以单个空格分隔，例如 `data-dmg="phy4 ele1"`。

### `data-race` — 种族

魔物种族，单选。写在 `<article class="monster">` 上。

| 取值 | 含义 | 图标 |
| --- | --- | --- |
| `beast` | 野兽 | <img src="../public/img/common/beast.webp" alt="野兽" height="18"> |
| `elf` | 精灵 | <img src="../public/img/common/elf.webp" alt="精灵" height="18"> |
| `undead` | 亡灵 | <img src="../public/img/common/undead.webp" alt="亡灵" height="18"> |

### `data-level` — 等级

魔物等级，单选。写在 `<article class="monster">` 上。

| 取值 | 含义 | 图标 |
| --- | --- | --- |
| `1` | 1 | — |
| `2` | 2 | — |
| `3` | 3 | — |
| `4` | 4 | — |
| `5` | 5 | — |
| `6` | 6 | — |
| `7` | 7 | — |
| `8` | 8 | — |
| `9` | 9 | — |

### `data-part` — 部件

部件类型，单选。基础攻击对应 `basic`。写在 `<li class="part">` 上。

| 取值 | 含义 | 图标 |
| --- | --- | --- |
| `basic` | 基础攻击 | — |
| `m` | M | <img src="../public/img/common/m.webp" alt="M" height="18"> |
| `s1` | S1 | <img src="../public/img/common/s1.webp" alt="S1" height="18"> |
| `s2` | S2 | <img src="../public/img/common/s2.webp" alt="S2" height="18"> |

### `data-act` — 动作

部件动作类型，单选。写在 `<li class="part">` 上。

| 取值 | 含义 | 图标 |
| --- | --- | --- |
| `main` | 主要 | <img src="../public/img/common/main.webp" alt="主要" height="18"> |
| `react` | 反应 | <img src="../public/img/common/reactive.webp" alt="反应" height="18"> |
| `passive` | 总是生效 | — |

### `data-bonus` — 加成

部件提供的属性加成，可多选。写在 `<li class="part">` 上。

| 取值 | 含义 | 图标 |
| --- | --- | --- |
| `str` | 力量 | <img src="../public/img/common/STR.webp" alt="力量" height="18"> |
| `dex` | 敏捷 | <img src="../public/img/common/DEX.webp" alt="敏捷" height="18"> |
| `con` | 体质 | <img src="../public/img/common/CON.webp" alt="体质" height="18"> |
| `int` | 智力 | <img src="../public/img/common/INT.webp" alt="智力" height="18"> |
| `wis` | 感知 | <img src="../public/img/common/WIS.webp" alt="感知" height="18"> |
| `cha` | 魅力 | <img src="../public/img/common/CHA.webp" alt="魅力" height="18"> |
| `mhp` | 最大生命值 | <img src="../public/img/common/MHP.webp" alt="最大生命值" height="18"> |
| `ac` | 护甲 | <img src="../public/img/common/AC.webp" alt="护甲" height="18"> |
| `ini` | 先攻 | <img src="../public/img/common/INI.webp" alt="先攻" height="18"> |
| `hit` | 命中 | <img src="../public/img/common/attack.webp" alt="命中" height="18"> |
| `dc` | 豁免DC | <img src="../public/img/common/save.webp" alt="豁免DC" height="18"> |

### `data-dmg` — 伤害类型

部件造成的伤害类型，可多选。写在 `<li class="part">` 上。

| 取值 | 含义 | 图标 |
| --- | --- | --- |
| `phy4` | 物理 | <img src="../public/img/common/phy4.webp" alt="物理" height="18"> |
| `ele1` | 火焰 | <img src="../public/img/common/ele1.webp" alt="火焰" height="18"> |
| `ele2` | 寒冷 | <img src="../public/img/common/ele2.webp" alt="寒冷" height="18"> |
| `ele3` | 闪电 | <img src="../public/img/common/ele3.webp" alt="闪电" height="18"> |
| `ele7` | 自然 | <img src="../public/img/common/ele7.webp" alt="自然" height="18"> |
| `mag1` | 光耀 | <img src="../public/img/common/mag1.webp" alt="光耀" height="18"> |
| `mag2` | 死灵 | <img src="../public/img/common/mag2.webp" alt="死灵" height="18"> |
| `mag3` | 力场 | <img src="../public/img/common/mag3.webp" alt="力场" height="18"> |
| `mag4` | 心灵 | <img src="../public/img/common/mag4.webp" alt="心灵" height="18"> |
| `heal` | 治疗 | <img src="../public/img/common/heal.webp" alt="治疗" height="18"> |
| `shield` | 临时生命值 | <img src="../public/img/common/shield.webp" alt="临时生命值" height="18"> |

### `data-mult` — 伤害加值

伤害数值的加值来源属性，可多选。写在 `<li class="part">` 上。

| 取值 | 含义 | 图标 |
| --- | --- | --- |
| `str` | 力量 | <img src="../public/img/common/STR.webp" alt="力量" height="18"> |
| `dex` | 敏捷 | <img src="../public/img/common/DEX.webp" alt="敏捷" height="18"> |
| `con` | 体质 | <img src="../public/img/common/CON.webp" alt="体质" height="18"> |
| `int` | 智力 | <img src="../public/img/common/INT.webp" alt="智力" height="18"> |
| `wis` | 感知 | <img src="../public/img/common/WIS.webp" alt="感知" height="18"> |
| `cha` | 魅力 | <img src="../public/img/common/CHA.webp" alt="魅力" height="18"> |

### `data-dcbonus` — DC加值

豁免 DC 的加值来源属性，可多选。写在 `<li class="part">` 上。

| 取值 | 含义 | 图标 |
| --- | --- | --- |
| `str` | 力量 | <img src="../public/img/common/STR.webp" alt="力量" height="18"> |
| `dex` | 敏捷 | <img src="../public/img/common/DEX.webp" alt="敏捷" height="18"> |
| `con` | 体质 | <img src="../public/img/common/CON.webp" alt="体质" height="18"> |
| `int` | 智力 | <img src="../public/img/common/INT.webp" alt="智力" height="18"> |
| `wis` | 感知 | <img src="../public/img/common/WIS.webp" alt="感知" height="18"> |
| `cha` | 魅力 | <img src="../public/img/common/CHA.webp" alt="魅力" height="18"> |

### `data-attack` — 攻击类型

攻击类型，可多选。写在 `<li class="part">` 上。

| 取值 | 含义 | 图标 |
| --- | --- | --- |
| `melee` | 近战 | <img src="../public/img/common/melee.webp" alt="近战" height="18"> |
| `ranged` | 远程 | <img src="../public/img/common/ranged.webp" alt="远程" height="18"> |
| `spell` | 法术 | <img src="../public/img/common/spell.webp" alt="法术" height="18"> |
| `aoe` | 范围 | <img src="../public/img/common/AoE.webp" alt="范围" height="18"> |

### `data-check` — 检定

该部件是否需要命中或豁免检定，可多选。写在 `<li class="part">` 上。

| 取值 | 含义 | 图标 |
| --- | --- | --- |
| `hit` | 需要命中 | <img src="../public/img/common/attack.webp" alt="需要命中" height="18"> |
| `save` | 需要豁免 | <img src="../public/img/common/save.webp" alt="需要豁免" height="18"> |

### `data-hit` — 命中检定属性

写在 `<li class="part">` 上。仅当 `data-check` 含 `hit` 时生效，取值为六项属性缩写之一。

| 取值 | 含义 | 图标 |
| --- | --- | --- |
| `str` | 力量 | <img src="../public/img/common/STR.webp" alt="力量" height="18"> |
| `dex` | 敏捷 | <img src="../public/img/common/DEX.webp" alt="敏捷" height="18"> |
| `con` | 体质 | <img src="../public/img/common/CON.webp" alt="体质" height="18"> |
| `int` | 智力 | <img src="../public/img/common/INT.webp" alt="智力" height="18"> |
| `wis` | 感知 | <img src="../public/img/common/WIS.webp" alt="感知" height="18"> |
| `cha` | 魅力 | <img src="../public/img/common/CHA.webp" alt="魅力" height="18"> |

### `data-save` — 豁免检定

写在 `<li class="part">` 上。仅当 `data-check` 含 `save` 时生效。
格式为 `<属性缩写>:<DC>`，属性缩写与上表一致。

| 示例 | 含义 |
| --- | --- |
| `wis:12` | 感知豁免，DC 12 |
| `con:14` | 体质豁免，DC 14 |

## 数值属性

下表列出各数值属性在当前 76 个魔物中的实际取值范围。
全部属性均为整数，构建不做上下限校验，新增魔物时可超出下表范围。

| 属性 | 含义 | 最小值 | 最大值 | 现有取值 |
| --- | --- | --- | --- | --- |
| `data-str` | 力量 | 4 | 40 | 4–40（22 种） |
| `data-dex` | 敏捷 | 4 | 36 | 4–36（19 种） |
| `data-con` | 体质 | 6 | 38 | 6–38（20 种） |
| `data-int` | 智力 | 3 | 38 | 3–38（23 种） |
| `data-wis` | 感知 | 4 | 40 | 4–40（23 种） |
| `data-cha` | 魅力 | 3 | 40 | 3–40（25 种） |
| `data-dom` | 支配力 | 1 | 32 | 1、2、3、4、6、9、12、16、32 |
| `data-hp` | 最大生命值 | 10 | 275 | 10–275（57 种） |
| `data-ac` | 护甲等级 | 8 | 8 | 8 |

## 常用图标

可用于 `data-*` 之外的行内插图，置于 `public/img/common/`。

| 文件 | 内容 | 预览 |
| --- | --- | --- |
| `dice.webp` | 伤害骰 | <img src="../public/img/common/dice.webp" alt="伤害骰" height="18"> |
| `Dom.webp` | 支配力 | <img src="../public/img/common/Dom.webp" alt="支配力" height="18"> |
| `b.webp` | 基础攻击边框 | <img src="../public/img/common/b.webp" alt="基础攻击边框" height="18"> |
| `m.webp` | M 部件边框 | <img src="../public/img/common/m.webp" alt="M 部件边框" height="18"> |
| `s1.webp` | S1 部件边框 | <img src="../public/img/common/s1.webp" alt="S1 部件边框" height="18"> |
| `s2.webp` | S2 部件边框 | <img src="../public/img/common/s2.webp" alt="S2 部件边框" height="18"> |
| `bt.webp` | 基础攻击角标 | <img src="../public/img/common/bt.webp" alt="基础攻击角标" height="18"> |
| `mt.webp` | M 角标 | <img src="../public/img/common/mt.webp" alt="M 角标" height="18"> |
| `s1t.webp` | S1 角标 | <img src="../public/img/common/s1t.webp" alt="S1 角标" height="18"> |
| `s2t.webp` | S2 角标 | <img src="../public/img/common/s2t.webp" alt="S2 角标" height="18"> |
| `DungeonWithin.webp` | 游戏图标 | <img src="../public/img/common/DungeonWithin.webp" alt="游戏图标" height="18"> |
