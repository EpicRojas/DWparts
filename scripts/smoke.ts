/**
 * 产物冒烟测试。构建之后跑，验证用户实际拿到的 HTML 里筛选器真的能用。
 *
 * 这一步存在的理由：P1 期间出现过「部件卡漏了 ft_list，筛选器只选到 76 张
 * char_row、304 张部件卡永远筛不到」的 bug，而构建、内容校验、文本对比
 * 全部通过——没有任何一步会去检查成品里的筛选行为。
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const HTML = path.join(ROOT, 'dist/index.html');

const errors: string[] = [];
const info: string[] = [];

if (!fs.existsSync(HTML)) {
  console.error('缺少 dist/index.html，先跑 astro build');
  process.exit(1);
}
const html = fs.readFileSync(HTML, 'utf8');

// ── 1. 卡片：必须同时具备「筛选器能选中的标记」与 data-tags
const tagAttrs = [...html.matchAll(/data-tags="([^"]*)"/g)].map((m) => m[1]!);
const ftListCount = (html.match(/class="[^"]*\bft_list\b[^"]*"/g) ?? []).length;

info.push(`data-tags 卡片: ${tagAttrs.length}`);
info.push(`带 ft_list 的元素: ${ftListCount}`);

if (tagAttrs.length !== 380) {
  errors.push(`data-tags 卡片应为 380 张（76 char_row + 304 部件），实得 ${tagAttrs.length}`);
}
if (ftListCount !== tagAttrs.length) {
  errors.push(
    `筛选器选取的元素数（${ftListCount}）与卡片数（${tagAttrs.length}）不一致：` +
    `有卡片缺 ft_list，筛选时会被漏掉`,
  );
}

// ── 2. 筛选按钮：每个有 data-key 的可点项，必须有卡片能命中
const buttons = [...html.matchAll(/class="ft_tag[^"]*" data-group="([^"]*)"(?: data-key="([^"]*)")?/g)];
const keyed = buttons.filter((m) => m[2]).map((m) => m[2]!);
info.push(`可点筛选按钮: ${keyed.length}（另有 ${buttons.length - keyed.length} 个「所有」）`);

if (!keyed.length) errors.push('筛选面板没有任何可点按钮');

const cardTagSets = tagAttrs.map((t) => new Set(t.split(/\s+/).filter(Boolean)));
for (const key of keyed) {
  const hit = cardTagSets.filter((s) => s.has(key)).length;
  if (hit === 0) errors.push(`筛选按钮 "${key}" 无任何卡片命中（点了会全空）`);
}

// ── 3. 复合筛选：抽样几组，确认交集运算有结果且不为全部
const combos: string[][] = [
  ['lv9'],
  ['lv9', 'tag_mag2'],
  ['part_s2', 'tag_heal'],
  ['act_main', 'tag_phy4', 'melee'],
];
for (const keys of combos) {
  const n = cardTagSets.filter((s) => keys.every((k) => s.has(k))).length;
  info.push(`  ${keys.join(' & ')} → ${n} 张`);
  if (n === 0) errors.push(`复合筛选 ${keys.join(' & ')} 结果为空`);
  if (n === tagAttrs.length) errors.push(`复合筛选 ${keys.join(' & ')} 命中了全部卡片，条件未生效`);
}

// ── 4. 每只怪都必须有 5 张卡（char_row + 4 部件）
const charRows = (html.match(/class="row ft_list char_row"/g) ?? []).length;
if (charRows !== 76) errors.push(`char_row 应为 76 个，实得 ${charRows}`);
if (tagAttrs.length !== charRows * 5) {
  errors.push(`卡片总数 ${tagAttrs.length} ≠ char_row ${charRows} × 5`);
}

// ── 5. 图片引用必须都能在 dist 里找到
const refs = new Set([...html.matchAll(/src="(\/img\/[^"]+)"/g)].map((m) => m[1]!));
const missing = [...refs].filter((r) => !fs.existsSync(path.join(ROOT, 'dist', r)));
if (missing.length) errors.push(`产物缺图: ${missing.slice(0, 5).join(', ')}`);
info.push(`图片引用: ${refs.size} 个，缺失 ${missing.length}`);

console.log(info.join('\n'));
if (errors.length) {
  console.error(`\n冒烟测试失败 ${errors.length} 项：`);
  for (const e of errors) console.error('  ✗ ' + e);
  process.exit(1);
}
console.log('\n冒烟测试通过');
