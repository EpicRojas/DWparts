/**
 * 极简内联标记：`{key|文本}` / `{key}`。
 * key 命中图标表 → 渲染「图标 + 着色文字」；命中文字色表 → 只渲染着色文字。
 * 之所以不用原始 HTML，是因为 YAML 里写 HTML 既不可校验也不可移植。
 */
import { AVAILABLE_ICONS, DAMAGE_LABEL, TEXT_COLORS, STAT_ICON, STAT_LABEL, STATS, EXTRA_ICON, EXTRA_LABEL, EXTRA_BONUS } from './taxonomy';

export type Node =
  | { kind: 'text'; text: string }
  | { kind: 'icon'; key: string; children?: Node[] }
  | { kind: 'color'; cls: string; children: Node[] };

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
// 正文里也直接用大写属性图标键：{CHA}、{WIS} 等
for (const s of STATS) {
  ICONS[STAT_ICON[s]] = STAT_ICON[s];
  LABELS[STAT_ICON[s]] = STAT_LABEL[s];
}
for (const e of EXTRA_BONUS) {
  ICONS[EXTRA_ICON[e]] = EXTRA_ICON[e];
  LABELS[EXTRA_ICON[e]] = EXTRA_LABEL[e];
}

/**
 * v1 遗留的缺图问题：这两个键在旧站图标集里就不存在，但正文有引用
 * （{phy1} 出现 7 次，{ele5} 1 次）。渲染时退化为纯着色文字，
 * pnpm check 把它们降为警告。拿到源 PNG 后放进 assets/raw/common/ 即可自动恢复。
 */
export const KNOWN_MISSING_ICONS = new Set(['phy1', 'ele5']);

export function isIconKey(key: string): boolean {
  return key in ICONS;
}
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

/**
 * 解析 `{key|文本}`。**支持嵌套**：`{heal|1d10 {shield}临时生命值}`
 * 这种写法在 v1 里真实存在（span 里套 img），用正则会解析错位。
 */
export function parseMarkup(src: string): Node[] {
  const out: Node[] = [];
  let buf = '';
  let i = 0;

  const flush = () => {
    if (buf) {
      out.push({ kind: 'text', text: buf });
      buf = '';
    }
  };

  while (i < src.length) {
    if (src[i] !== '{') {
      buf += src[i++];
      continue;
    }
    // 找配对的右括号，计入嵌套深度
    let depth = 0;
    let end = -1;
    for (let j = i; j < src.length; j++) {
      if (src[j] === '{') depth++;
      else if (src[j] === '}') {
        depth--;
        if (depth === 0) { end = j; break; }
      }
    }
    if (end < 0) { buf += src.slice(i); break; }

    const body = src.slice(i + 1, end);
    // 只在深度 0 处切第一个 |
    let bar = -1, d = 0;
    for (let j = 0; j < body.length; j++) {
      if (body[j] === '{') d++;
      else if (body[j] === '}') d--;
      else if (body[j] === '|' && d === 0) { bar = j; break; }
    }
    const key = (bar < 0 ? body : body.slice(0, bar)).trim();
    const rest = bar < 0 ? '' : body.slice(bar + 1);

    if (isIconKey(key)) {
      flush();
      const children = rest ? parseMarkup(rest) : undefined;
      out.push(children && children.length ? { kind: 'icon', key, children } : { kind: 'icon', key });
    } else if (TEXT_COLORS.has(key)) {
      flush();
      out.push({ kind: 'color', cls: key, children: parseMarkup(rest) });
    } else {
      // 未知键原样输出，交由 pnpm check 报错
      buf += src.slice(i, end + 1);
    }
    i = end + 1;
  }
  flush();
  return out;
}

/** 抽出所有用到的图标键，供构建期校验（含嵌套） */
export function usedIconKeys(src: string): string[] {
  const keys: string[] = [];
  const walk = (ns: Node[]) => {
    for (const n of ns) {
      if (n.kind === 'icon') keys.push(n.key);
      if (n.kind !== 'text' && n.children) walk(n.children);
    }
  };
  walk(parseMarkup(src));
  return keys;
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ESC[c]!);

/** 把节点渲染成 HTML 片段（内容为自有数据，文本仍然转义） */
export function renderMarkup(src: string, iconUrlFn: (file: string) => string): string {
  const render = (ns: Node[]): string =>
    ns.map((n) => {
      if (n.kind === 'text') return esc(n.text);
      if (n.kind === 'color') return `<span class="${n.cls}">${render(n.children)}</span>`;
      const file = iconFile(n.key);
      const img = iconExists(n.key)
        ? `<img src="${iconUrlFn(file)}" class="mi" alt="" loading="lazy" decoding="async">`
        : KNOWN_MISSING_ICONS.has(n.key)
          ? ''
          : `<span class="mi-missing" title="图标缺失：${esc(n.key)}">◆</span>`;
      const inner = n.children ? render(n.children) : '';
      return `<span class="mi-wrap ${n.key}">${img}${inner ? `<span class="${n.key}">${inner}</span>` : ''}</span>`;
    }).join('');
  return render(parseMarkup(src));
}
