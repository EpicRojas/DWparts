/**
 * 极简内联标记：`{key|文本}` / `{key}`。
 * key 命中图标表 → 渲染「图标 + 着色文字」；命中文字色表 → 只渲染着色文字。
 * 之所以不用原始 HTML，是因为 YAML 里写 HTML 既不可校验也不可移植。
 */
import { AVAILABLE_ICONS, DAMAGE_LABEL, TEXT_COLORS, STAT_ICON, STAT_LABEL, STATS, EXTRA_ICON, EXTRA_LABEL, EXTRA_BONUS } from './taxonomy';

export type Node =
  | { kind: 'text'; text: string }
  | { kind: 'icon'; key: string; text?: string; color?: string }
  | { kind: 'color'; cls: string; text: string };

const LABELS: Record<string, string> = {
  ...DAMAGE_LABEL,
  ...STAT_LABEL,
  ...EXTRA_LABEL,
};
const ICONS: Record<string, string> = {
  ...STAT_ICON,
  ...EXTRA_ICON,
};
for (const k of ['phy1','phy2','phy3','phy4','ele1','ele2','ele3','ele4','ele5','ele6','ele7','mag1','mag2','mag3','mag4','heal','shield','attack','save','main','reactive','melee','ranged','spell','AoE','dice','Dom']) {
  ICONS[k] ??= k;
}
for (const s of STATS) ICONS[s] = STAT_ICON[s];
for (const e of EXTRA_BONUS) ICONS[e] = EXTRA_ICON[e];

/** 该 key 是否为已知的「图标键」 */
export function isIconKey(key: string): boolean {
  return key in ICONS;
}
/** 该 key 对应的磁盘文件是否存在 */
export function iconExists(key: string): boolean {
  const f = ICONS[key];
  return !!f && AVAILABLE_ICONS.has(f);
}
export function iconFile(key: string): string {
  return ICONS[key] ?? key;
}
export function keyLabel(key: string): string {
  return LABELS[key] ?? '';
}

const TOKEN = /\{([a-zA-Z0-9_]+)(?:\|([^}]*))?\}/g;

export function parseMarkup(src: string): Node[] {
  const out: Node[] = [];
  let last = 0;
  for (const m of src.matchAll(TOKEN)) {
    const at = m.index!;
    if (at > last) out.push({ kind: 'text', text: src.slice(last, at) });
    const key = m[1]!;
    const text = m[2];
    if (isIconKey(key)) {
      out.push({ kind: 'icon', key, text: text ?? keyLabel(key), color: key });
    } else if (TEXT_COLORS.has(key)) {
      out.push({ kind: 'color', cls: key, text: text ?? '' });
    } else {
      out.push({ kind: 'text', text: m[0] });
    }
    last = at + m[0].length;
  }
  if (last < src.length) out.push({ kind: 'text', text: src.slice(last) });
  return out;
}

/** 抽出所有用到的图标键，供构建期校验 */
export function usedIconKeys(src: string): string[] {
  return [...src.matchAll(TOKEN)].filter((m) => isIconKey(m[1]!)).map((m) => m[1]!);
}
