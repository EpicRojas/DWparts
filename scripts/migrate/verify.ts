/**
 * 迁移一致性校验：用 v2 的渲染逻辑复算筛选键，与 v1 原始 class 逐卡对比。
 *
 *   tsx scripts/migrate/verify.ts
 *
 * 这是 P1 的验收标准。任何一张卡的键集合对不上就报错——说明数据迁移丢了语义。
 * 迁移彻底完成后，连同 legacy/ 与 legacy-tags.json 一起删除。
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { abilityTagIds } from '../../src/lib/derive';

const ROOT = path.resolve(import.meta.dirname, '../..');
const CONTENT = path.join(ROOT, 'src/content/monsters');
const SNAPSHOT = path.join(ROOT, 'scripts/migrate/legacy-tags.json');

type Snap = Record<string, { basic: string[]; parts: Record<string, string[]> }>;
const snap: Snap = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

/** v1 里不属于筛选键的 class */
const LAYOUT = new Set(['col-3', 'ft_list', 'row', 'char_row']);
const RACES = new Set(['野兽', '精灵', '亡灵']);

const errors: string[] = [];
const stats = { cards: 0, parts: 0, keys: 0 };

/**
 * v1 的 class 与页面显示本身不同步：
 *   - b 卡（种族特性）普遍漏写 class，但页面显示了攻击类型/加值等
 *   - s1/s2 普遍在 class 里标了 act_passive，但页面没有「动作」标签
 * 因此验收标准是单向的：**v1 class 有的键，v2 必须全部保留**。
 * 反过来 v2 多出的键是修好了 v1 的漏写，只统计不报错。
 */
const enriched: string[] = [];
let extraTotal = 0;

function diffSets(name: string, mine: Set<string>, theirs: Set<string>) {
  const missing = [...theirs].filter((k) => !mine.has(k)).sort();
  const extra = [...mine].filter((k) => !theirs.has(k)).sort();
  if (missing.length) {
    errors.push(`${name} — v1 有而 v2 缺: ${missing.join(', ')}`);
  }
  if (extra.length) {
    extraTotal += extra.length;
    enriched.push(`${name} +${extra.join(',+')}`);
  }
}

const files = fs.readdirSync(CONTENT).filter((f) => f.endsWith('.yaml')).sort();
for (const f of files) {
  const data = parseYaml(fs.readFileSync(path.join(CONTENT, f), 'utf8')) as any;
  const s = snap[data.id];
  if (!s) {
    errors.push(`${data.id}: v1 快照里没有这只怪`);
    continue;
  }

  // 基础动作卡是 char_row 的一部分，随 char_row 的 lv/race 一起显隐，
  // 自身不参与筛选（v1 里它的 class 也只有 col-3）。这里只断言这一点。
  const v1basic = s.basic.filter((k) => !LAYOUT.has(k) && !RACES.has(k) && !/^lv\d$/.test(k));
  if (v1basic.length) {
    errors.push(`${data.id} basic — v1 里基础卡不该有筛选键，实得: ${v1basic.join(', ')}`);
  }
  stats.cards++;

  for (const part of data.parts) {
    const slot = part.slot as string;
    const v1 = s.parts[slot];
    if (!v1) {
      errors.push(`${data.id}: v1 里找不到 slot=${slot}`);
      continue;
    }
    const mine = new Set(abilityTagIds(part));
    const theirs = new Set(v1.filter((k) => !LAYOUT.has(k) && !RACES.has(k) && !/^lv\d$/.test(k)));
    diffSets(`${data.id} ${slot}`, mine, theirs);
    stats.parts++;
    stats.keys += theirs.size;
  }
}

console.log(`对比 ${stats.cards} 张基础卡 / ${stats.parts} 张部件卡`);
if (extraTotal) {
  console.log(`\nv2 比 v1 多出 ${extraTotal} 个键（v1 页面显示但 class 漏写，现已补齐）：`);
  for (const e of enriched.slice(0, 12)) console.log('  + ' + e);
  if (enriched.length > 12) console.log(`  ... 另有 ${enriched.length - 12} 处`);
}
if (errors.length) {
  console.error(`\n不一致 ${errors.length} 处：`);
  for (const e of errors) console.error('  ✗ ' + e);
  process.exit(1);
}
console.log('筛选键与 v1 完全一致');
