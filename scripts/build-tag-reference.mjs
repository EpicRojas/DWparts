#!/usr/bin/env node
/**
 * 生成 content/TAG-REFERENCE.md —— 标签速查表。
 *
 * 数据来源：
 *   content/tags.yaml      枚举型属性（种族、部件、动作……）
 *   content/monsters/*.html  标量属性（六项属性、生命、护甲）的实测取值范围
 *
 * 枚举型属性全部由 tags.yaml 派生，不在此处硬编码，
 * 修改标签体系后重新执行即可同步。
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
const OUT = join(ROOT, 'content', 'TAG-REFERENCE.md');

/* 图片以仓库相对路径引用，Markdown 渲染时按文件所在目录解析 */
const IMG = (file, label) => (file ? `<img src="../public/img/common/${file}" alt="${label}" height="18">` : '');

const tax = YAML.parse(readFileSync(TAGS, 'utf8'));

/* ────────── 标量属性：扫描全部魔物卡 ────────── */
const A = (n) => Object.fromEntries((n.attrs ?? []).map((a) => [a.name, a.value]));
const walk = (n, fn) => { for (const c of (n.childNodes ?? []).filter((x) => x.tagName)) { fn(c); walk(c, fn); } };

const num = (attr) => {
  const vals = new Set();
  for (const f of readdirSync(MONSTERS).filter((x) => x.endsWith('.html'))) {
    const doc = parse(readFileSync(join(MONSTERS, f), 'utf8'));
    walk(doc, (n) => {
      if (n.tagName !== 'article') return;
      const v = A(n)[attr];
      if (v !== undefined) vals.add(Number(v));
    });
  }
  return [...vals].sort((a, b) => a - b);
};

const stats = {
  level: num('data-level'),
  dom: num('data-dom'),
  str: num('data-str'),
  dex: num('data-dex'),
  con: num('data-con'),
  int: num('data-int'),
  wis: num('data-wis'),
  cha: num('data-cha'),
  hp: num('data-hp'),
  ac: num('data-ac'),
};

/* ────────── 组装 ────────── */
const out = [];
const P = (s = '') => out.push(s);

P('# 标签速查表');
P('');
P('本文件由 `scripts/build-tag-reference.mjs` 依据 `content/tags.yaml` 与');
P('`content/monsters/` 的实际内容生成，用于查阅各属性可填写的值。');
P('');
P('修改标签体系后执行 `pnpm reference` 重新生成，不要手工编辑本文件。');
P('');
P('## 属性总览');
P('');
P('| 属性 | 所属元素 | 类型 | 取值个数 |');
P('| --- | --- | --- | --- |');

const groupByAttr = Object.fromEntries(tax.groups.map((g) => [g.attr, g]));
const overview = [
  ['data-id', 'article', '字符串', '—'],
  ['data-name', 'article', '字符串', '—'],
  ...tax.groups.map((g) => [`data-${g.attr}`, g.scope === 'monster' ? 'article' : 'li.part', g.values.length > 1 ? '枚举' : '枚举', String(g.values.length)]),
  ['data-hit', 'li.part', '枚举（六项属性）', String(groupByAttr.bonus.values.filter((v) => ['str','dex','con','int','wis','cha'].includes(v.id)).length)],
  ['data-save', 'li.part', '字符串 `属性:DC`', '—'],
  ['data-str', 'article', '整数', String(stats.str.length)],
  ['data-dex', 'article', '整数', String(stats.dex.length)],
  ['data-con', 'article', '整数', String(stats.con.length)],
  ['data-int', 'article', '整数', String(stats.int.length)],
  ['data-wis', 'article', '整数', String(stats.wis.length)],
  ['data-cha', 'article', '整数', String(stats.cha.length)],
  ['data-dom', 'article', '整数', String(stats.dom.length)],
  ['data-hp', 'article', '整数', String(stats.hp.length)],
  ['data-ac', 'article', '整数', String(stats.ac.length)],
];
for (const r of overview) P(`| \`${r[0]}\` | ${r[1]} | ${r[2]} | ${r[3]} |`);
P('');

/* 枚举型属性：每个一组表 */
P('## 枚举属性');
P('');
P('取值区分大小写，多个值以单个空格分隔，例如 `data-dmg="phy4 ele1"`。');
P('');

const ENUM_DESC = {
  race: '魔物种族，单选。',
  level: '魔物等级，单选。',
  part: '部件类型，单选。基础攻击对应 `basic`。',
  act: '部件动作类型，单选。',
  bonus: '部件提供的属性加成，可多选。',
  dmg: '部件造成的伤害类型，可多选。',
  mult: '伤害数值的加值来源属性，可多选。',
  dcbonus: '豁免 DC 的加值来源属性，可多选。',
  attack: '攻击类型，可多选。',
  check: '该部件是否需要命中或豁免检定，可多选。',
};

for (const g of tax.groups) {
  P(`### \`data-${g.attr}\` — ${g.label}`);
  P('');
  P(`${ENUM_DESC[g.id] ?? ''}写在 \`${g.scope === 'monster' ? '<article class="monster">' : '<li class="part">'}\` 上。`);
  P('');
  P('| 取值 | 含义 | 图标 |');
  P('| --- | --- | --- |');
  for (const v of g.values) {
    P(`| \`${v.id}\` | ${v.label} | ${IMG(v.icon, v.label) || '—'} |`);
  }
  P('');
}

/* data-hit 与 data-save 为复合语义，单独说明 */
P('### `data-hit` — 命中检定属性');
P('');
P('写在 `<li class="part">` 上。仅当 `data-check` 含 `hit` 时生效，取值为六项属性缩写之一。');
P('');
P('| 取值 | 含义 | 图标 |');
P('| --- | --- | --- |');
for (const id of ['str', 'dex', 'con', 'int', 'wis', 'cha']) {
  const v = groupByAttr.bonus.values.find((x) => x.id === id);
  if (v) P(`| \`${v.id}\` | ${v.label} | ${IMG(v.icon, v.label) || '—'} |`);
}
P('');
P('### `data-save` — 豁免检定');
P('');
P('写在 `<li class="part">` 上。仅当 `data-check` 含 `save` 时生效。');
P('格式为 `<属性缩写>:<DC>`，属性缩写与上表一致。');
P('');
P('| 示例 | 含义 |');
P('| --- | --- |');
P('| `wis:12` | 感知豁免，DC 12 |');
P('| `con:14` | 体质豁免，DC 14 |');
P('');

/* 标量属性：实测取值范围 */
P('## 数值属性');
P('');
P('下表列出各数值属性在当前 76 个魔物中的实际取值范围。');
P('全部属性均为整数，构建不做上下限校验，新增魔物时可超出下表范围。');
P('');
P('| 属性 | 含义 | 最小值 | 最大值 | 现有取值 |');
P('| --- | --- | --- | --- | --- |');

const STAT_DESC = {
  str: '力量', dex: '敏捷', con: '体质', int: '智力', wis: '感知', cha: '魅力',
  dom: '支配力', hp: '最大生命值', ac: '护甲等级',
};
const STAT_ATTR = { str: 'data-str', dex: 'data-dex', con: 'data-con', int: 'data-int', wis: 'data-wis', cha: 'data-cha', dom: 'data-dom', hp: 'data-hp', ac: 'data-ac' };
for (const key of ['str', 'dex', 'con', 'int', 'wis', 'cha', 'dom', 'hp', 'ac']) {
  const v = stats[key];
  const list = v.length > 12 ? `${v[0]}–${v[v.length - 1]}（${v.length} 种）` : v.join('、');
  P(`| \`${STAT_ATTR[key]}\` | ${STAT_DESC[key]} | ${v[0]} | ${v[v.length - 1]} | ${list} |`);
}
P('');

/* 常用图标 */
P('## 常用图标');
P('');
P('可用于 `data-*` 之外的行内插图，置于 `public/img/common/`。');
P('');
P('| 文件 | 内容 | 预览 |');
P('| --- | --- | --- |');
for (const [f, label] of [
  ['dice', '伤害骰'],
  ['Dom', '支配力'],
  ['b', '基础攻击边框'],
  ['m', 'M 部件边框'],
  ['s1', 'S1 部件边框'],
  ['s2', 'S2 部件边框'],
  ['bt', '基础攻击角标'],
  ['mt', 'M 角标'],
  ['s1t', 'S1 角标'],
  ['s2t', 'S2 角标'],
  ['DungeonWithin', '游戏图标'],
]) {
  P(`| \`${f}.webp\` | ${label} | ${IMG(`${f}.webp`, label)} |`);
}
P('');

writeFileSync(OUT, out.join('\n'), 'utf8');
console.log(`已生成 ${OUT}`);
console.log(`  枚举属性 ${tax.groups.length} 组，数值属性 9 项`);
