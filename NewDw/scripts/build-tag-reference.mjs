#!/usr/bin/env node
/**
 * 生成 content/TAG-REFERENCE.md —— 标签速查表。
 *
 * 数据来源：
 *   content/tags.yaml        枚举型属性（种族、部件、动作……）
 *   content/monsters/*.html  数值属性的实测取值范围
 *   public/img/common/       图标清单
 *
 * 枚举与图标清单均由上述来源派生，不在此处硬编码；
 * 修改标签体系或增删图标后重新执行即可同步。
 *
 *   node scripts/build-tag-reference.mjs
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'parse5';
import YAML from 'yaml';

const ROOT = process.cwd();
const TAGS = join(ROOT, 'content', 'tags.yaml');
const MONSTERS = join(ROOT, 'content', 'monsters');
const ICONS = join(ROOT, 'public', 'img', 'common');
const OUT = join(ROOT, 'content', 'TAG-REFERENCE.md');

/** 表格内预览图。相对本文件所在目录解析。 */
const PREVIEW = (file, label) =>
  file ? `<img src="../public/img/common/${file}" alt="${label}" height="18">` : '—';

/** 可直接粘贴进卡片的行内图标标签。 */
const SNIPPET = (file, label) =>
  `<img src="img/common/${file}" class="ico" alt="${label}">`;

const tax = YAML.parse(readFileSync(TAGS, 'utf8'));

/* ────────── 数值属性：扫描全部魔物卡 ────────── */
const A = (n) => Object.fromEntries((n.attrs ?? []).map((a) => [a.name, a.value]));
const walk = (n, fn) => { for (const c of (n.childNodes ?? []).filter((x) => x.tagName)) { fn(c); walk(c, fn); } };
const files = readdirSync(MONSTERS).filter((x) => x.endsWith('.html'));
const docs = files.map((f) => parse(readFileSync(join(MONSTERS, f), 'utf8')));

const collect = (attr) => {
  const vals = new Set();
  for (const doc of docs) walk(doc, (n) => { if (n.tagName === 'article' && A(n)[attr] !== undefined) vals.add(Number(A(n)[attr])); });
  return [...vals].sort((a, b) => a - b);
};
const stats = Object.fromEntries(
  ['str', 'dex', 'con', 'int', 'wis', 'cha', 'dom', 'hp', 'ac'].map((k) => [k, collect(`data-${k}`)]),
);

/* ────────── 文案 ────────── */
const out = [];
const P = (s = '') => out.push(s);

const ENUM_DESC = {
  race: '魔物种族，单选。',
  level: '魔物等级，单选。',
  part: '部件类型，单选。',
  act: '部件动作类型，单选。',
  bonus: '部件提供的属性加成，可多选。',
  dmg: '部件造成的伤害类型，可多选。',
  mult: '伤害数值的加值来源属性，可多选。',
  dcbonus: '豁免 DC 的加值来源属性，可多选。',
  attack: '攻击类型，可多选。',
  check: '该部件是否需要命中或豁免检定，可多选。',
};
const STAT_DESC = {
  str: '力量', dex: '敏捷', con: '体质', int: '智力', wis: '感知', cha: '魅力',
  dom: '支配力', hp: '最大生命值', ac: '护甲等级',
};

/* ────────── 文件头 ────────── */
P('# 标签速查表');
P('');
P('本文件由 `scripts/build-tag-reference.mjs` 依据 `content/tags.yaml`、');
P('`content/monsters/` 与 `public/img/common/` 生成，用于查阅各属性可填写的值。');
P('');
P('「示例」列可直接复制到卡片 HTML 中。修改标签体系后执行 `pnpm reference` 重新生成，');
P('不要手工编辑本文件。');
P('');

/* ────────── 属性总览 ────────── */
P('## 属性总览');
P('');
P('| 属性 | 所属元素 | 类型 | 取值个数 | 示例 |');
P('| --- | --- | --- | --- | --- |');

const ATTR_EXAMPLE = {
  'data-id': 'data-id="BST101"',
  'data-name': 'data-name="拉塔托斯克"',
  'data-hit': 'data-hit="dex"',
  'data-save': 'data-save="wis:12"',
};
const ATTR_TYPE = {
  'data-id': '字符串', 'data-name': '字符串',
  'data-save': '字符串 `属性:DC`',
};
const ATTR_COUNT = {
  'data-id': '—', 'data-name': '—', 'data-save': '—',
};

P(`| \`data-id\` | article | ${ATTR_TYPE['data-id']} | — | \`${ATTR_EXAMPLE['data-id']}\` |`);
P(`| \`data-name\` | article | ${ATTR_TYPE['data-name']} | — | \`${ATTR_EXAMPLE['data-name']}\` |`);
for (const g of tax.groups) {
  const ex = g.id === 'check' ? 'data-check="hit save"' : `data-${g.attr}="${g.values[0].id}"`;
  P(`| \`data-${g.attr}\` | ${g.scope === 'monster' ? 'article' : 'li.part'} | 枚举 | ${g.values.length} | \`${ex}\` |`);
}
P(`| \`data-hit\` | li.part | 枚举（六项属性） | 6 | \`${ATTR_EXAMPLE['data-hit']}\` |`);
P(`| \`data-save\` | li.part | ${ATTR_TYPE['data-save']} | — | \`${ATTR_EXAMPLE['data-save']}\` |`);
for (const key of ['str', 'dex', 'con', 'int', 'wis', 'cha', 'dom', 'hp', 'ac']) {
  P(`| \`data-${key}\` | article | 整数 | ${stats[key].length} | \`data-${key}="${stats[key][Math.floor(stats[key].length / 2)]}"\` |`);
}
P('');

/* ────────── 枚举属性 ────────── */
P('## 枚举属性');
P('');
P('取值区分大小写。标为可多选的属性以单个空格分隔多个值，例如 `data-dmg="phy4 ele1"`。');
P('');

for (const g of tax.groups) {
  P(`### \`data-${g.attr}\` — ${g.label}`);
  P('');
  P(`${ENUM_DESC[g.id] ?? ''}写在 \`${g.scope === 'monster' ? '<article class="monster">' : '<li class="part">'}\` 上。`);
  P('');
  P('| 取值 | 含义 | 示例 | 图标 |');
  P('| --- | --- | --- | --- |');
  for (const v of g.values) {
    P(`| \`${v.id}\` | ${v.label} | \`data-${g.attr}="${v.id}"\` | ${PREVIEW(v.icon, v.label)} |`);
  }
  P('');
}

/* data-hit / data-save */
P('### `data-hit` — 命中检定属性');
P('');
P('写在 `<li class="part">` 上，仅当 `data-check` 含 `hit` 时生效。');
P('');
P('| 取值 | 含义 | 示例 | 图标 |');
P('| --- | --- | --- | --- |');
const bonusGroup = tax.groups.find((g) => g.id === 'bonus');
for (const id of ['str', 'dex', 'con', 'int', 'wis', 'cha']) {
  const v = bonusGroup.values.find((x) => x.id === id);
  if (v) P(`| \`${v.id}\` | ${v.label} | \`data-hit="${v.id}"\` | ${PREVIEW(v.icon, v.label)} |`);
}
P('');
P('### `data-save` — 豁免检定');
P('');
P('写在 `<li class="part">` 上，仅当 `data-check` 含 `save` 时生效。');
P('格式为 `<属性缩写>:<DC>`，属性缩写与上表一致。');
P('');
P('| 示例 | 含义 |');
P('| --- | --- |');
P('| `data-save="wis:12"` | 感知豁免，DC 12 |');
P('| `data-save="con:14"` | 体质豁免，DC 14 |');
P('');

/* ────────── 数值属性 ────────── */
P('## 数值属性');
P('');
P('下表列出各数值属性在当前魔物中的实测取值范围。');
P('全部为整数，构建不做上下限校验，新增魔物时可超出下表范围。');
P('');
P('| 属性 | 含义 | 最小值 | 最大值 | 现有取值 | 示例 |');
P('| --- | --- | --- | --- | --- | --- |');
for (const key of ['str', 'dex', 'con', 'int', 'wis', 'cha', 'dom', 'hp', 'ac']) {
  const v = stats[key];
  const list = v.length > 12 ? `${v[0]}–${v[v.length - 1]}（${v.length} 种）` : v.join('、');
  const mid = v[Math.floor(v.length / 2)];
  P(`| \`data-${key}\` | ${STAT_DESC[key]} | ${v[0]} | ${v[v.length - 1]} | ${list} | \`data-${key}="${mid}"\` |`);
}
P('');

/* ────────── 图标清单 ────────── */
P('## 图标清单');
P('');
P('「标签」列可直接粘贴到卡片的描述文字中。图标位于 `public/img/common/`，');
P('引用时使用 `img/common/` 开头的相对路径。');
P('');

const ICON_GROUPS = [
  ['六项属性', ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']],
  ['其他数值', ['MHP', 'AC', 'INI']],
  ['检定', ['attack', 'save']],
  ['伤害类型', ['phy4', 'ele1', 'ele2', 'ele3', 'ele7', 'mag1', 'mag2', 'mag3', 'mag4', 'heal', 'shield']],
  ['攻击类型', ['melee', 'ranged', 'spell', 'AoE']],
  ['动作', ['main', 'reactive']],
  ['种族', ['beast', 'elf', 'undead']],
  ['部件边框', ['b', 'm', 's1', 's2']],
  ['部件角标', ['bt', 'mt', 's1t', 's2t']],
  ['其他', ['dice', 'Dom', 'DungeonWithin']],
];

const ICON_LABEL = {
  STR: '力量', DEX: '敏捷', CON: '体质', INT: '智力', WIS: '感知', CHA: '魅力',
  MHP: '最大生命值', AC: '护甲', INI: '先攻', attack: '命中检定', save: '豁免检定',
  phy4: '物理', ele1: '火焰', ele2: '寒冷', ele3: '闪电', ele7: '自然',
  mag1: '光耀', mag2: '死灵', mag3: '力场', mag4: '心灵', heal: '治疗', shield: '临时生命值',
  melee: '近战', ranged: '远程', spell: '法术', AoE: '范围',
  main: '主要动作', reactive: '反应动作', beast: '野兽', elf: '精灵', undead: '亡灵',
  b: '基础攻击边框', m: 'M 边框', s1: 'S1 边框', s2: 'S2 边框',
  bt: '基础攻击角标', mt: 'M 角标', s1t: 'S1 角标', s2t: 'S2 角标',
  dice: '伤害骰', Dom: '支配力', DungeonWithin: '游戏图标',
};

const available = new Set(readdirSync(ICONS));
let listed = 0;
for (const [title, list] of ICON_GROUPS) {
  P(`### ${title}`);
  P('');
  P('| 文件 | 内容 | 预览 | 可复制标签 |');
  P('| --- | --- | --- | --- |');
  for (const name of list) {
    const file = `${name}.webp`;
    if (!available.has(file)) continue;
    const label = ICON_LABEL[name] ?? name;
    P(`| \`${file}\` | ${label} | ${PREVIEW(file, label)} | \`${SNIPPET(file, label)}\` |`);
    listed++;
  }
  P('');
}

/* 内部素材：说明不可用于卡片，避免误引 */
P('### 内部素材');
P('');
P('下列文件供构建与样式使用，内容中不应引用。');
P('');
P('| 文件 | 用途 |');
P('| --- | --- |');
P('| `mask-basic.png`、`mask-m.png`、`mask-s1.png`、`mask-s2.png` | 徽章头像裁切遮罩，由 `pnpm masks` 生成 |');
P('| `b_back.webp`、`m_back.webp`、`s1_back.webp`、`s2_back.webp` | 生成上述遮罩的中间素材 |');
P('| `heal_old.webp` | 未被内容引用的旧版治疗图标 |');
P('');

writeFileSync(OUT, out.join('\n'), 'utf8');
console.log(`已生成 ${OUT}`);
console.log(`  枚举 ${tax.groups.length} 组，数值 ${Object.keys(stats).length} 项，图标 ${listed} 个`);
