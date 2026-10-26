/**
 * 内容完整性校验。CI 里在 build 之前跑，任何一项失败即中断。
 *
 * 校验项：
 *  1. 内联标记引用的图标是否真的有源文件（历史上 phy1 / ele5 就是这样静默破图的）
 *  2. 数据里出现的筛选键是否有对应的筛选按钮（否则数据不可达）
 *  3. 筛选按钮是否都有数据命中（否则是死按钮）
 *  4. 角色立绘是否存在
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { ALL_FILTER_KEYS, cardKeys } from '../src/lib/filterKeys';

const ROOT = path.resolve(import.meta.dirname, '..');
const RAW_COMMON = path.join(ROOT, 'assets/raw/common');
const RAW_CHARS = path.join(ROOT, 'assets/raw/characters');
const CONTENT = path.join(ROOT, 'src/content/monsters');

const errors: string[] = [];
const warnings: string[] = [];

const iconFiles = new Set(
  fs.readdirSync(RAW_COMMON).filter((f) => f.endsWith('.png')).map((f) => path.basename(f, '.png')),
);
const charFiles = new Set(
  fs.readdirSync(RAW_CHARS).filter((f) => f.endsWith('.png')).map((f) => path.basename(f, '.png')),
);

// ── 图标键 → 文件名的映射（与 src/lib/markup.ts 保持一致）
const ICONS: Record<string, string> = {
  str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA',
  mhp: 'MHP', ac: 'AC', ini: 'INI', hit: 'attack', dc: 'save',
  phy1: 'phy1', phy2: 'phy2', phy3: 'phy3', phy4: 'phy4',
  ele1: 'ele1', ele2: 'ele2', ele3: 'ele3', ele4: 'ele4', ele5: 'ele5', ele6: 'ele6', ele7: 'ele7',
  mag1: 'mag1', mag2: 'mag2', mag3: 'mag3', mag4: 'mag4',
  heal: 'heal', shield: 'shield',
  attack: 'attack', save: 'save', main: 'main', reactive: 'reactive',
  melee: 'melee', ranged: 'ranged', spell: 'spell', AoE: 'AoE', dice: 'dice', Dom: 'Dom',
};
const TEXT_COLORS = new Set(['pink', 'blue', 'lb', 'lgreen', 'orange', 'green', 'red']);

const files = fs.readdirSync(CONTENT).filter((f) => f.endsWith('.yaml')).sort();
const usedIcons = new Map<string, Set<string>>(); // key → 出现在哪些文件
const dataKeys = new Set<string>();

function scanStrings(obj: unknown, file: string) {
  if (typeof obj === 'string') {
    for (const m of obj.matchAll(/\{([a-zA-Z0-9_]+)(?:\|[^}]*)?\}/g)) {
      const key = m[1]!;
      if (key in ICONS) {
        if (!usedIcons.has(key)) usedIcons.set(key, new Set());
        usedIcons.get(key)!.add(file);
      } else if (!TEXT_COLORS.has(key)) {
        errors.push(`${file}: 未知的内联标记 {${key}}`);
      }
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((v) => scanStrings(v, file));
  } else if (obj && typeof obj === 'object') {
    Object.values(obj).forEach((v) => scanStrings(v, file));
  }
}

for (const f of files) {
  const raw = fs.readFileSync(path.join(CONTENT, f), 'utf8');
  const data = parseYaml(raw) as any;
  scanStrings(data, f);

  if (!charFiles.has(data.id)) errors.push(`${f}: 缺少立绘 assets/raw/characters/${data.id}.png`);

  cardKeys(data, data.parts).forEach((k) => dataKeys.add(k));
}

// 1. 图标缺失
for (const [key, where] of usedIcons) {
  const file = ICONS[key];
  if (!file || !iconFiles.has(file)) {
    errors.push(`图标缺失：{${key}} 需要 assets/raw/common/${file}.png，被引用于 ${[...where].join(', ')}`);
  }
}

// 2/3. 筛选键与按钮对照
const filterKeys = new Set(ALL_FILTER_KEYS);
for (const k of dataKeys) {
  if (!filterKeys.has(k)) errors.push(`数据里有筛选项 "${k}"，但筛选面板没有对应按钮（数据不可达）`);
}
for (const k of filterKeys) {
  if (!dataKeys.has(k)) warnings.push(`筛选按钮 "${k}" 没有任何数据命中（死按钮）`);
}

// 4. 汇总
const total = files.length;
const partCount = files.reduce((n, f) => {
  const d = parseYaml(fs.readFileSync(path.join(CONTENT, f), 'utf8')) as any;
  return n + d.parts.length;
}, 0);
console.log(`sources: ${total} 只魔物 / ${partCount} 个部件 / ${usedIcons.size} 种内联图标`);

if (warnings.length) {
  console.log('\n警告：');
  for (const w of warnings) console.log('  ! ' + w);
}
if (errors.length) {
  console.error('\n错误：');
  for (const e of errors) console.error('  ✗ ' + e);
  process.exit(1);
}
console.log('\n校验通过');
