# 标签速查表

本文件由 `scripts/build-tag-reference.mjs` 依据 `content/tags.yaml`、
`content/monsters/` 与 `public/img/common/` 生成，用于查阅各属性可填写的值。

「示例」列可直接复制到卡片 HTML 中。修改标签体系后执行 `pnpm reference` 重新生成，
不要手工编辑本文件。

## 属性总览

| 属性 | 所属元素 | 类型 | 取值个数 | 示例 |
| --- | --- | --- | --- | --- |
| `data-id` | article | 字符串 | — | `data-id="BST101"` |
| `data-name` | article | 字符串 | — | `data-name="拉塔托斯克"` |
| `data-race` | article | 枚举 | 4 | `data-race="beast"` |
| `data-level` | article | 枚举 | 9 | `data-level="1"` |
| `data-part` | li.part | 枚举 | 4 | `data-part="basic"` |
| `data-act` | li.part | 枚举 | 3 | `data-act="main"` |
| `data-bonus` | li.part | 枚举 | 11 | `data-bonus="str"` |
| `data-dmg` | li.part | 枚举 | 11 | `data-dmg="phy4"` |
| `data-mult` | li.part | 枚举 | 6 | `data-mult="str"` |
| `data-dcbonus` | li.part | 枚举 | 6 | `data-dcbonus="str"` |
| `data-attack` | li.part | 枚举 | 4 | `data-attack="melee"` |
| `data-check` | li.part | 枚举 | 2 | `data-check="hit save"` |
| `data-hit` | li.part | 枚举（六项属性） | 6 | `data-hit="dex"` |
| `data-save` | li.part | 字符串 `属性:DC` | — | `data-save="wis:12"` |
| `data-str` | article | 整数 | 23 | `data-str="14"` |
| `data-dex` | article | 整数 | 20 | `data-dex="15"` |
| `data-con` | article | 整数 | 21 | `data-con="16"` |
| `data-int` | article | 整数 | 24 | `data-int="14"` |
| `data-wis` | article | 整数 | 24 | `data-wis="15"` |
| `data-cha` | article | 整数 | 26 | `data-cha="15"` |
| `data-dom` | article | 整数 | 9 | `data-dom="6"` |
| `data-hp` | article | 整数 | 58 | `data-hp="62"` |
| `data-ac` | article | 整数 | 2 | `data-ac="8"` |

## 枚举属性

取值区分大小写。标为可多选的属性以单个空格分隔多个值，例如 `data-dmg="phy4 ele1"`。

### `data-race` — 种族

魔物种族，单选。写在 `<article class="monster">` 上。

| 取值 | 含义 | 示例 | 图标 |
| --- | --- | --- | --- |
| `beast` | 野兽 | `data-race="beast"` | <img src="../public/img/common/beast.webp" alt="野兽" height="18"> |
| `elf` | 精灵 | `data-race="elf"` | <img src="../public/img/common/elf.webp" alt="精灵" height="18"> |
| `undead` | 亡灵 | `data-race="undead"` | <img src="../public/img/common/undead.webp" alt="亡灵" height="18"> |
| `none` | 无魔物 | `data-race="none"` | — |

### `data-level` — 等级

魔物等级，单选。写在 `<article class="monster">` 上。

| 取值 | 含义 | 示例 | 图标 |
| --- | --- | --- | --- |
| `1` | 1 | `data-level="1"` | — |
| `2` | 2 | `data-level="2"` | — |
| `3` | 3 | `data-level="3"` | — |
| `4` | 4 | `data-level="4"` | — |
| `5` | 5 | `data-level="5"` | — |
| `6` | 6 | `data-level="6"` | — |
| `7` | 7 | `data-level="7"` | — |
| `8` | 8 | `data-level="8"` | — |
| `9` | 9 | `data-level="9"` | — |

### `data-part` — 部件

部件类型，单选。写在 `<li class="part">` 上。

| 取值 | 含义 | 示例 | 图标 |
| --- | --- | --- | --- |
| `basic` | 基础攻击 | `data-part="basic"` | — |
| `m` | M | `data-part="m"` | <img src="../public/img/common/m.webp" alt="M" height="18"> |
| `s1` | S1 | `data-part="s1"` | <img src="../public/img/common/s1.webp" alt="S1" height="18"> |
| `s2` | S2 | `data-part="s2"` | <img src="../public/img/common/s2.webp" alt="S2" height="18"> |

### `data-act` — 动作

部件动作类型，单选。写在 `<li class="part">` 上。

| 取值 | 含义 | 示例 | 图标 |
| --- | --- | --- | --- |
| `main` | 主要 | `data-act="main"` | <img src="../public/img/common/main.webp" alt="主要" height="18"> |
| `react` | 反应 | `data-act="react"` | <img src="../public/img/common/reactive.webp" alt="反应" height="18"> |
| `passive` | 总是生效 | `data-act="passive"` | — |

### `data-bonus` — 加成

部件提供的属性加成，可多选。写在 `<li class="part">` 上。

| 取值 | 含义 | 示例 | 图标 |
| --- | --- | --- | --- |
| `str` | 力量 | `data-bonus="str"` | <img src="../public/img/common/STR.webp" alt="力量" height="18"> |
| `dex` | 敏捷 | `data-bonus="dex"` | <img src="../public/img/common/DEX.webp" alt="敏捷" height="18"> |
| `con` | 体质 | `data-bonus="con"` | <img src="../public/img/common/CON.webp" alt="体质" height="18"> |
| `int` | 智力 | `data-bonus="int"` | <img src="../public/img/common/INT.webp" alt="智力" height="18"> |
| `wis` | 感知 | `data-bonus="wis"` | <img src="../public/img/common/WIS.webp" alt="感知" height="18"> |
| `cha` | 魅力 | `data-bonus="cha"` | <img src="../public/img/common/CHA.webp" alt="魅力" height="18"> |
| `mhp` | 最大生命值 | `data-bonus="mhp"` | <img src="../public/img/common/MHP.webp" alt="最大生命值" height="18"> |
| `ac` | 护甲 | `data-bonus="ac"` | <img src="../public/img/common/AC.webp" alt="护甲" height="18"> |
| `ini` | 先攻 | `data-bonus="ini"` | <img src="../public/img/common/INI.webp" alt="先攻" height="18"> |
| `hit` | 命中 | `data-bonus="hit"` | <img src="../public/img/common/attack.webp" alt="命中" height="18"> |
| `dc` | 豁免DC | `data-bonus="dc"` | <img src="../public/img/common/save.webp" alt="豁免DC" height="18"> |

### `data-dmg` — 伤害类型

部件造成的伤害类型，可多选。写在 `<li class="part">` 上。

| 取值 | 含义 | 示例 | 图标 |
| --- | --- | --- | --- |
| `phy4` | 物理 | `data-dmg="phy4"` | <img src="../public/img/common/phy4.webp" alt="物理" height="18"> |
| `ele1` | 火焰 | `data-dmg="ele1"` | <img src="../public/img/common/ele1.webp" alt="火焰" height="18"> |
| `ele2` | 寒冷 | `data-dmg="ele2"` | <img src="../public/img/common/ele2.webp" alt="寒冷" height="18"> |
| `ele3` | 闪电 | `data-dmg="ele3"` | <img src="../public/img/common/ele3.webp" alt="闪电" height="18"> |
| `ele7` | 自然 | `data-dmg="ele7"` | <img src="../public/img/common/ele7.webp" alt="自然" height="18"> |
| `mag1` | 光耀 | `data-dmg="mag1"` | <img src="../public/img/common/mag1.webp" alt="光耀" height="18"> |
| `mag2` | 死灵 | `data-dmg="mag2"` | <img src="../public/img/common/mag2.webp" alt="死灵" height="18"> |
| `mag3` | 力场 | `data-dmg="mag3"` | <img src="../public/img/common/mag3.webp" alt="力场" height="18"> |
| `mag4` | 心灵 | `data-dmg="mag4"` | <img src="../public/img/common/mag4.webp" alt="心灵" height="18"> |
| `heal` | 治疗 | `data-dmg="heal"` | <img src="../public/img/common/heal.webp" alt="治疗" height="18"> |
| `shield` | 临时生命值 | `data-dmg="shield"` | <img src="../public/img/common/shield.webp" alt="临时生命值" height="18"> |

### `data-mult` — 伤害加值

伤害数值的加值来源属性，可多选。写在 `<li class="part">` 上。

| 取值 | 含义 | 示例 | 图标 |
| --- | --- | --- | --- |
| `str` | 力量 | `data-mult="str"` | <img src="../public/img/common/STR.webp" alt="力量" height="18"> |
| `dex` | 敏捷 | `data-mult="dex"` | <img src="../public/img/common/DEX.webp" alt="敏捷" height="18"> |
| `con` | 体质 | `data-mult="con"` | <img src="../public/img/common/CON.webp" alt="体质" height="18"> |
| `int` | 智力 | `data-mult="int"` | <img src="../public/img/common/INT.webp" alt="智力" height="18"> |
| `wis` | 感知 | `data-mult="wis"` | <img src="../public/img/common/WIS.webp" alt="感知" height="18"> |
| `cha` | 魅力 | `data-mult="cha"` | <img src="../public/img/common/CHA.webp" alt="魅力" height="18"> |

### `data-dcbonus` — DC加值

豁免 DC 的加值来源属性，可多选。写在 `<li class="part">` 上。

| 取值 | 含义 | 示例 | 图标 |
| --- | --- | --- | --- |
| `str` | 力量 | `data-dcbonus="str"` | <img src="../public/img/common/STR.webp" alt="力量" height="18"> |
| `dex` | 敏捷 | `data-dcbonus="dex"` | <img src="../public/img/common/DEX.webp" alt="敏捷" height="18"> |
| `con` | 体质 | `data-dcbonus="con"` | <img src="../public/img/common/CON.webp" alt="体质" height="18"> |
| `int` | 智力 | `data-dcbonus="int"` | <img src="../public/img/common/INT.webp" alt="智力" height="18"> |
| `wis` | 感知 | `data-dcbonus="wis"` | <img src="../public/img/common/WIS.webp" alt="感知" height="18"> |
| `cha` | 魅力 | `data-dcbonus="cha"` | <img src="../public/img/common/CHA.webp" alt="魅力" height="18"> |

### `data-attack` — 攻击类型

攻击类型，可多选。写在 `<li class="part">` 上。

| 取值 | 含义 | 示例 | 图标 |
| --- | --- | --- | --- |
| `melee` | 近战 | `data-attack="melee"` | <img src="../public/img/common/melee.webp" alt="近战" height="18"> |
| `ranged` | 远程 | `data-attack="ranged"` | <img src="../public/img/common/ranged.webp" alt="远程" height="18"> |
| `spell` | 法术 | `data-attack="spell"` | <img src="../public/img/common/spell.webp" alt="法术" height="18"> |
| `aoe` | 范围 | `data-attack="aoe"` | <img src="../public/img/common/AoE.webp" alt="范围" height="18"> |

### `data-check` — 检定

该部件是否需要命中或豁免检定，可多选。写在 `<li class="part">` 上。

| 取值 | 含义 | 示例 | 图标 |
| --- | --- | --- | --- |
| `hit` | 需要命中 | `data-check="hit"` | <img src="../public/img/common/attack.webp" alt="需要命中" height="18"> |
| `save` | 需要豁免 | `data-check="save"` | <img src="../public/img/common/save.webp" alt="需要豁免" height="18"> |

### `data-hit` — 命中检定属性

写在 `<li class="part">` 上，仅当 `data-check` 含 `hit` 时生效。

| 取值 | 含义 | 示例 | 图标 |
| --- | --- | --- | --- |
| `str` | 力量 | `data-hit="str"` | <img src="../public/img/common/STR.webp" alt="力量" height="18"> |
| `dex` | 敏捷 | `data-hit="dex"` | <img src="../public/img/common/DEX.webp" alt="敏捷" height="18"> |
| `con` | 体质 | `data-hit="con"` | <img src="../public/img/common/CON.webp" alt="体质" height="18"> |
| `int` | 智力 | `data-hit="int"` | <img src="../public/img/common/INT.webp" alt="智力" height="18"> |
| `wis` | 感知 | `data-hit="wis"` | <img src="../public/img/common/WIS.webp" alt="感知" height="18"> |
| `cha` | 魅力 | `data-hit="cha"` | <img src="../public/img/common/CHA.webp" alt="魅力" height="18"> |

### `data-save` — 豁免检定

写在 `<li class="part">` 上，仅当 `data-check` 含 `save` 时生效。
格式为 `<属性缩写>:<DC>`，属性缩写与上表一致。

| 示例 | 含义 |
| --- | --- |
| `data-save="wis:12"` | 感知豁免，DC 12 |
| `data-save="con:14"` | 体质豁免，DC 14 |

## 数值属性

下表列出各数值属性在当前魔物中的实测取值范围。
全部为整数，构建不做上下限校验，新增魔物时可超出下表范围。

| 属性 | 含义 | 最小值 | 最大值 | 现有取值 | 示例 |
| --- | --- | --- | --- | --- | --- |
| `data-str` | 力量 | 0 | 40 | 0–40（23 种） | `data-str="14"` |
| `data-dex` | 敏捷 | 0 | 36 | 0–36（20 种） | `data-dex="15"` |
| `data-con` | 体质 | 0 | 38 | 0–38（21 种） | `data-con="16"` |
| `data-int` | 智力 | 0 | 38 | 0–38（24 种） | `data-int="14"` |
| `data-wis` | 感知 | 0 | 40 | 0–40（24 种） | `data-wis="15"` |
| `data-cha` | 魅力 | 0 | 40 | 0–40（26 种） | `data-cha="15"` |
| `data-dom` | 支配力 | 1 | 32 | 1、2、3、4、6、9、12、16、32 | `data-dom="6"` |
| `data-hp` | 最大生命值 | 0 | 275 | 0–275（58 种） | `data-hp="62"` |
| `data-ac` | 护甲等级 | 0 | 8 | 0、8 | `data-ac="8"` |

## 图标清单

「标签」列可直接粘贴到卡片的描述文字中。图标位于 `public/img/common/`，
引用时使用 `img/common/` 开头的相对路径。

### 六项属性

| 文件 | 内容 | 预览 | 可复制标签 |
| --- | --- | --- | --- |
| `STR.webp` | 力量 | <img src="../public/img/common/STR.webp" alt="力量" height="18"> | `<img src="img/common/STR.webp" class="ico" alt="力量">` |
| `DEX.webp` | 敏捷 | <img src="../public/img/common/DEX.webp" alt="敏捷" height="18"> | `<img src="img/common/DEX.webp" class="ico" alt="敏捷">` |
| `CON.webp` | 体质 | <img src="../public/img/common/CON.webp" alt="体质" height="18"> | `<img src="img/common/CON.webp" class="ico" alt="体质">` |
| `INT.webp` | 智力 | <img src="../public/img/common/INT.webp" alt="智力" height="18"> | `<img src="img/common/INT.webp" class="ico" alt="智力">` |
| `WIS.webp` | 感知 | <img src="../public/img/common/WIS.webp" alt="感知" height="18"> | `<img src="img/common/WIS.webp" class="ico" alt="感知">` |
| `CHA.webp` | 魅力 | <img src="../public/img/common/CHA.webp" alt="魅力" height="18"> | `<img src="img/common/CHA.webp" class="ico" alt="魅力">` |

### 其他数值

| 文件 | 内容 | 预览 | 可复制标签 |
| --- | --- | --- | --- |
| `MHP.webp` | 最大生命值 | <img src="../public/img/common/MHP.webp" alt="最大生命值" height="18"> | `<img src="img/common/MHP.webp" class="ico" alt="最大生命值">` |
| `AC.webp` | 护甲 | <img src="../public/img/common/AC.webp" alt="护甲" height="18"> | `<img src="img/common/AC.webp" class="ico" alt="护甲">` |
| `INI.webp` | 先攻 | <img src="../public/img/common/INI.webp" alt="先攻" height="18"> | `<img src="img/common/INI.webp" class="ico" alt="先攻">` |

### 检定

| 文件 | 内容 | 预览 | 可复制标签 |
| --- | --- | --- | --- |
| `attack.webp` | 命中检定 | <img src="../public/img/common/attack.webp" alt="命中检定" height="18"> | `<img src="img/common/attack.webp" class="ico" alt="命中检定">` |
| `save.webp` | 豁免检定 | <img src="../public/img/common/save.webp" alt="豁免检定" height="18"> | `<img src="img/common/save.webp" class="ico" alt="豁免检定">` |

### 伤害类型

| 文件 | 内容 | 预览 | 可复制标签 |
| --- | --- | --- | --- |
| `phy4.webp` | 物理 | <img src="../public/img/common/phy4.webp" alt="物理" height="18"> | `<img src="img/common/phy4.webp" class="ico" alt="物理">` |
| `ele1.webp` | 火焰 | <img src="../public/img/common/ele1.webp" alt="火焰" height="18"> | `<img src="img/common/ele1.webp" class="ico" alt="火焰">` |
| `ele2.webp` | 寒冷 | <img src="../public/img/common/ele2.webp" alt="寒冷" height="18"> | `<img src="img/common/ele2.webp" class="ico" alt="寒冷">` |
| `ele3.webp` | 闪电 | <img src="../public/img/common/ele3.webp" alt="闪电" height="18"> | `<img src="img/common/ele3.webp" class="ico" alt="闪电">` |
| `ele7.webp` | 自然 | <img src="../public/img/common/ele7.webp" alt="自然" height="18"> | `<img src="img/common/ele7.webp" class="ico" alt="自然">` |
| `mag1.webp` | 光耀 | <img src="../public/img/common/mag1.webp" alt="光耀" height="18"> | `<img src="img/common/mag1.webp" class="ico" alt="光耀">` |
| `mag2.webp` | 死灵 | <img src="../public/img/common/mag2.webp" alt="死灵" height="18"> | `<img src="img/common/mag2.webp" class="ico" alt="死灵">` |
| `mag3.webp` | 力场 | <img src="../public/img/common/mag3.webp" alt="力场" height="18"> | `<img src="img/common/mag3.webp" class="ico" alt="力场">` |
| `mag4.webp` | 心灵 | <img src="../public/img/common/mag4.webp" alt="心灵" height="18"> | `<img src="img/common/mag4.webp" class="ico" alt="心灵">` |
| `heal.webp` | 治疗 | <img src="../public/img/common/heal.webp" alt="治疗" height="18"> | `<img src="img/common/heal.webp" class="ico" alt="治疗">` |
| `shield.webp` | 临时生命值 | <img src="../public/img/common/shield.webp" alt="临时生命值" height="18"> | `<img src="img/common/shield.webp" class="ico" alt="临时生命值">` |

### 攻击类型

| 文件 | 内容 | 预览 | 可复制标签 |
| --- | --- | --- | --- |
| `melee.webp` | 近战 | <img src="../public/img/common/melee.webp" alt="近战" height="18"> | `<img src="img/common/melee.webp" class="ico" alt="近战">` |
| `ranged.webp` | 远程 | <img src="../public/img/common/ranged.webp" alt="远程" height="18"> | `<img src="img/common/ranged.webp" class="ico" alt="远程">` |
| `spell.webp` | 法术 | <img src="../public/img/common/spell.webp" alt="法术" height="18"> | `<img src="img/common/spell.webp" class="ico" alt="法术">` |
| `AoE.webp` | 范围 | <img src="../public/img/common/AoE.webp" alt="范围" height="18"> | `<img src="img/common/AoE.webp" class="ico" alt="范围">` |

### 动作

| 文件 | 内容 | 预览 | 可复制标签 |
| --- | --- | --- | --- |
| `main.webp` | 主要动作 | <img src="../public/img/common/main.webp" alt="主要动作" height="18"> | `<img src="img/common/main.webp" class="ico" alt="主要动作">` |
| `reactive.webp` | 反应动作 | <img src="../public/img/common/reactive.webp" alt="反应动作" height="18"> | `<img src="img/common/reactive.webp" class="ico" alt="反应动作">` |

### 种族

| 文件 | 内容 | 预览 | 可复制标签 |
| --- | --- | --- | --- |
| `beast.webp` | 野兽 | <img src="../public/img/common/beast.webp" alt="野兽" height="18"> | `<img src="img/common/beast.webp" class="ico" alt="野兽">` |
| `elf.webp` | 精灵 | <img src="../public/img/common/elf.webp" alt="精灵" height="18"> | `<img src="img/common/elf.webp" class="ico" alt="精灵">` |
| `undead.webp` | 亡灵 | <img src="../public/img/common/undead.webp" alt="亡灵" height="18"> | `<img src="img/common/undead.webp" class="ico" alt="亡灵">` |

### 部件边框

| 文件 | 内容 | 预览 | 可复制标签 |
| --- | --- | --- | --- |
| `b.webp` | 基础攻击边框 | <img src="../public/img/common/b.webp" alt="基础攻击边框" height="18"> | `<img src="img/common/b.webp" class="ico" alt="基础攻击边框">` |
| `m.webp` | M 边框 | <img src="../public/img/common/m.webp" alt="M 边框" height="18"> | `<img src="img/common/m.webp" class="ico" alt="M 边框">` |
| `s1.webp` | S1 边框 | <img src="../public/img/common/s1.webp" alt="S1 边框" height="18"> | `<img src="img/common/s1.webp" class="ico" alt="S1 边框">` |
| `s2.webp` | S2 边框 | <img src="../public/img/common/s2.webp" alt="S2 边框" height="18"> | `<img src="img/common/s2.webp" class="ico" alt="S2 边框">` |

### 部件角标

| 文件 | 内容 | 预览 | 可复制标签 |
| --- | --- | --- | --- |
| `bt.webp` | 基础攻击角标 | <img src="../public/img/common/bt.webp" alt="基础攻击角标" height="18"> | `<img src="img/common/bt.webp" class="ico" alt="基础攻击角标">` |
| `mt.webp` | M 角标 | <img src="../public/img/common/mt.webp" alt="M 角标" height="18"> | `<img src="img/common/mt.webp" class="ico" alt="M 角标">` |
| `s1t.webp` | S1 角标 | <img src="../public/img/common/s1t.webp" alt="S1 角标" height="18"> | `<img src="img/common/s1t.webp" class="ico" alt="S1 角标">` |
| `s2t.webp` | S2 角标 | <img src="../public/img/common/s2t.webp" alt="S2 角标" height="18"> | `<img src="img/common/s2t.webp" class="ico" alt="S2 角标">` |

### 其他

| 文件 | 内容 | 预览 | 可复制标签 |
| --- | --- | --- | --- |
| `dice.webp` | 伤害骰 | <img src="../public/img/common/dice.webp" alt="伤害骰" height="18"> | `<img src="img/common/dice.webp" class="ico" alt="伤害骰">` |
| `Dom.webp` | 支配力 | <img src="../public/img/common/Dom.webp" alt="支配力" height="18"> | `<img src="img/common/Dom.webp" class="ico" alt="支配力">` |
| `DungeonWithin.webp` | 游戏图标 | <img src="../public/img/common/DungeonWithin.webp" alt="游戏图标" height="18"> | `<img src="img/common/DungeonWithin.webp" class="ico" alt="游戏图标">` |

### 内部素材

下列文件供构建与样式使用，内容中不应引用。

| 文件 | 用途 |
| --- | --- |
| `mask-basic.png`、`mask-m.png`、`mask-s1.png`、`mask-s2.png` | 徽章头像裁切遮罩，由 `pnpm masks` 生成 |
| `b_back.webp`、`m_back.webp`、`s1_back.webp`、`s2_back.webp` | 生成上述遮罩的中间素材 |
| `heal_old.webp` | 未被内容引用的旧版治疗图标 |
