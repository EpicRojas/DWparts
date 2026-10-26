/**
 * 筛选状态与匹配逻辑（纯函数，无 DOM）。
 *
 * 抽出来的理由：筛选器的行为之前只存在于 Vue 组件里，构建、内容校验、
 * 文本对比都不会碰到它，导致「部件卡漏了筛选标记」这种 bug 一路绿灯到成品。
 * 现在这段逻辑可以被 scripts/test-filter.ts 直接测。
 */

export type FilterState = Record<string, string | null>;

/** 分组里实际生效的键，顺序稳定（按分组名排序便于比较） */
export function activeKeys(state: FilterState): string[] {
  return Object.keys(state)
    .sort()
    .map((g) => state[g])
    .filter((k): k is string => !!k);
}

/** 一张卡片是否命中当前筛选（所有键同时满足 = 且关系） */
export function matchesCard(tags: readonly string[], keys: readonly string[]): boolean {
  if (!keys.length) return true;
  const set = new Set(tags);
  return keys.every((k) => set.has(k));
}

/** 分割 data-tags 属性值 */
export function splitTags(value: string | null | undefined): string[] {
  return (value ?? '').split(/\s+/).filter(Boolean);
}

/**
 * 把状态序列化成查询串。
 * 等级分组用 `lv=9` 这种短写法，读起来比 `lv=lv9` 自然。
 */
export function stateToQuery(state: FilterState): string {
  const p = new URLSearchParams();
  for (const g of Object.keys(state).sort()) {
    const k = state[g];
    if (!k) continue;
    p.set(g, g === 'lv' && /^lv\d$/.test(k) ? k.slice(2) : k);
  }
  return p.toString();
}

/**
 * 从查询串还原状态。
 * 兼容 `?lv=9` 与 `?lv=lv9` 两种写法；未知分组直接忽略。
 */
export function queryToState(search: string, validGroups: readonly string[]): FilterState {
  const state: FilterState = {};
  const p = new URLSearchParams(search);
  for (const [g, v] of p) {
    if (!validGroups.includes(g) || !v) continue;
    state[g] = g === 'lv' && /^\d+$/.test(v) ? `lv${v}` : v;
  }
  return state;
}
