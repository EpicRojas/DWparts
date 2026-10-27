/**
 * 筛选岛 —— 全站唯一的客户端脚本。
 *
 * 设计要点：
 *   1. 状态全部放在 URL query，可分享、可后退；
 *   2. 判定基于 data-* 属性词，不做文字匹配；
 *   3. 同组多选取 OR，跨组取 AND；
 *   4. 两级模式：整卡（魔物任一部件命中即显示整行） / 部件（只显示命中部件）。
 */
type Mode = 'card' | 'part';

/**
 * 显示模式：控制渲染范围，与标签筛选、筛选粒度相互独立。
 *   all      显示魔物头部与部件卡
 *   monster  只显示魔物头部
 *   part     只显示部件卡，完全不显示魔物信息
 */
type View = 'all' | 'monster' | 'part';

interface GroupDef {
  id: string;
  attr: string;
  scope: 'monster' | 'part';
  values: { id: string; label: string }[];
}

interface Boot {
  groups: GroupDef[];
  total: number;
}

const REASON_NO_PART_FILTER = '当前只选了魔物级标签（种族/等级），所有部件都同等命中，无法细分为部件视图。先选动作、伤害类型等部件级标签。';
const REASON_PART_VIEW = '仅部件模式下始终只显示命中的部件，该开关不可切换。切回「全部」或「仅魔物」显示模式后可调整。';

const root = document.documentElement;
const state = {
  /** groupId → Set<valueId> */
  picked: new Map<string, Set<string>>(),
  mode: 'card' as Mode,
  view: 'all' as View,
  /** 用户显式选择的筛选粒度，仅部件模式结束后据此恢复 */
  modePref: 'card' as Mode,
  /** 用户显式选择的显示模式，部件筛选清空后据此恢复 */
  viewPref: 'all' as View,
  /** 显示模式当前是否由部件筛选自动触发 */
  viewAuto: false,
  /** 用户在部件筛选存在期间手动改过显示模式，清空前一概不自动切换 */
  viewPinned: false,
  query: '',
};

/* 「部件专属区」= scope 为 part 的全部标签组，即筛选面板中「部件」一行及其后各行。
   只要其中任意一组有选中值，即视为处于部件筛选状态。 */
function hasPartFilter(groups: GroupDef[]): boolean {
  return groups.some((g) => g.scope === 'part' && state.picked.get(g.id)?.size);
}

/**
 * 依据部件筛选状态调整显示模式。
 *
 *   出现部件筛选   → 切到「仅部件」，原显示模式记入 viewPref
 *   部件筛选增多   → 保持「仅部件」
 *   部件筛选清空   → 恢复 viewPref
 *   期间用户手动改过 → 尊重手动选择，直到部件筛选清空后才重新生效
 *
 * 自动切换只是「伪选中」：viewPref 始终保留用户的选择，便于恢复。
 */
function reconcileView(groups: GroupDef[]): void {
  const has = hasPartFilter(groups);

  if (has) {
    if (!state.viewAuto && !state.viewPinned) {
      if (state.view !== 'part') state.viewPref = state.view;
      state.viewAuto = true;
      state.view = 'part';
    }
    return;
  }

  // 部件筛选已清空：结束自动状态，恢复用户偏好
  if (state.viewAuto) {
    state.viewAuto = false;
    state.view = state.viewPref;
  }
  state.viewPinned = false;
}

/* ────────── URL <-> 状态 ────────── */
const PARAM_MODE = 'mode';
const PARAM_VIEW = 'view';
const PARAM_Q = 'q';

function readUrl(groups: GroupDef[]) {
  const params = new URLSearchParams(location.search);
  state.picked.clear();
  for (const g of groups) {
    const raw = params.get(g.id);
    if (!raw) continue;
    const vals = raw.split(',').map((v) => v.trim()).filter(Boolean);
    const valid = vals.filter((v) => g.values.some((x) => x.id === v));
    if (valid.length) state.picked.set(g.id, new Set(valid));
  }
  state.mode = params.get(PARAM_MODE) === 'part' ? 'part' : 'card';
  state.modePref = state.mode;
  const v = params.get(PARAM_VIEW);
  state.view = v === 'monster' || v === 'part' ? v : 'all';
  state.query = (params.get(PARAM_Q) ?? '').trim();
}

function writeUrl(groups: GroupDef[], { replace = false } = {}) {
  const params = new URLSearchParams();
  for (const g of groups) {
    const vals = state.picked.get(g.id);
    if (vals?.size) params.set(g.id, [...vals].join(','));
  }
  if (state.modePref === 'part') params.set(PARAM_MODE, 'part');
  if (state.view !== 'all') params.set(PARAM_VIEW, state.view);
  if (state.query) params.set(PARAM_Q, state.query);
  const qs = params.toString();
  const url = qs ? `${location.pathname}?${qs}${location.hash}` : `${location.pathname}${location.hash}`;
  history[replace ? 'replaceState' : 'pushState']({}, '', url);
}

/* ────────── 匹配 ────────── */
const words = (el: Element, attr: string): string[] =>
  (el.getAttribute(`data-${attr}`) ?? '').split(/\s+/).filter(Boolean);

/** 某部件是否满足全部已选条件 */
function partMatches(part: Element, groups: GroupDef[], monsterEl: Element): boolean {
  for (const g of groups) {
    const picked = state.picked.get(g.id);
    if (!picked?.size) continue;
    const src = g.scope === 'monster' ? monsterEl : part;
    const have = words(src, g.attr);
    if (![...picked].some((v) => have.includes(v))) return false;
  }
  return true;
}

/** 关键词匹配：魔物名 + 部件名 + 加成 + 正文 + 效果，文本在首次搜索时惰性索引 */
const searchIndex = new WeakMap<Element, string>();

function haystack(card: Element): string {
  let hay = searchIndex.get(card);
  if (hay === undefined) {
    // textContent 已包含所有可见文字；顺带收进标题属性（如图标 alt/title 中的属性名）
    const extra = Array.from(card.querySelectorAll('[title],[alt]'))
      .map((n) => `${n.getAttribute('title') ?? ''} ${n.getAttribute('alt') ?? ''}`)
      .join(' ');
    hay = `${card.textContent ?? ''} ${extra}`.toLowerCase().replace(/\s+/g, ' ');
    searchIndex.set(card, hay);
  }
  return hay;
}

function textMatches(card: Element, q: string): boolean {
  if (!q) return true;
  const hay = haystack(card);
  return q.split(/\s+/).every((t) => hay.includes(t));
}

/* ────────── 渲染 ────────── */
const els = {
  monsters: () => Array.from(document.querySelectorAll<HTMLElement>('.monster')),
  chip: (groupId: string) => Array.from(document.querySelectorAll<HTMLButtonElement>(`.chip[data-group="${groupId}"]`)),
  empty: () => document.querySelector<HTMLElement>('[data-empty-state]'),
  count: () => document.querySelector<HTMLElement>('[data-result-count]'),
  search: () => document.querySelector<HTMLInputElement>('[data-search]'),
  searchClear: () => document.querySelector<HTMLElement>('[data-search-clear]'),
  modeBtn: () => document.querySelector<HTMLButtonElement>('[data-mode-toggle]'),
  viewChip: (v: string) => document.querySelector<HTMLButtonElement>(`.chip[data-view="${v}"]`),
  filters: () => document.querySelector<HTMLElement>('[data-filters]'),
};

function apply(groups: GroupDef[]) {
  const q = state.query.toLowerCase();
  root.dataset.filterMode = state.mode;
  root.dataset.view = state.view;
  let visible = 0;
  let visibleParts = 0;
  let totalParts = 0;

  for (const card of els.monsters()) {
    const parts = Array.from(card.querySelectorAll<HTMLElement>('.part'));
    totalParts += parts.length;

    /* 显示模式：只影响卡内区块的显隐，不参与标签匹配。
       hidden 属性在 CSS 中为 display: none，故不会被布局计入。 */
    const head = card.querySelector<HTMLElement>('.monster__head');
    const partsBox = card.querySelector<HTMLElement>('.parts');
    if (head) head.hidden = state.view === 'part';
    if (partsBox) partsBox.hidden = state.view === 'monster';

    // 关键词优先级最高：不匹配则整卡隐藏
    if (!textMatches(card, q)) {
      card.hidden = true;
      continue;
    }

    const hitParts = parts.filter((p) => partMatches(p, groups, card));
    const anyFilter = groups.some((g) => state.picked.get(g.id)?.size);

    if (!anyFilter) {
      // 无筛选：全部显示，模式不生效
      card.hidden = false;
      card.dataset.hit = '';
      for (const p of parts) p.hidden = false;
      visible++;
      visibleParts += parts.length;
      continue;
    }

    if (state.mode === 'card') {
      const hit = hitParts.length > 0;
      card.hidden = !hit;
      card.dataset.hit = hit ? 'full' : '';
      for (const p of parts) p.hidden = false;   // 整卡模式下不隐藏部件
      if (hit) { visible++; visibleParts += parts.length; }
    } else {
      const hit = hitParts.length > 0;
      card.hidden = !hit;
      card.dataset.hit = hit ? 'part' : '';
      for (const p of parts) p.hidden = !hitParts.includes(p);
      if (hit) { visible++; visibleParts += hitParts.length; }
    }
  }

  if (els.count()) {
    els.count()!.textContent = state.view === 'part'
      ? `${visibleParts} 部件`
      : state.mode === 'part'
        ? `${visible} 魔物 · ${visibleParts} 部件`
        : `${visible} / ${els.monsters().length} 魔物`;
  }
  if (els.empty()) els.empty()!.hidden = visible > 0;

  // 空选值的 chip 降低存在感（说明"当前其他条件下无此项"）
  for (const g of groups) {
    const chips = els.chip(g.id);
    for (const btn of chips) {
      const v = btn.dataset.value!;
      const alive = els.monsters().some((card) => {
        if (card.hidden) return false;
        const srcs = g.scope === 'monster' ? [card] : Array.from(card.querySelectorAll('.part'));
        return srcs.some((s) => words(s, g.attr).includes(v));
      });
      if (alive) delete btn.dataset.empty;
      else btn.dataset.empty = '';
    }
  }
}

function syncChips(groups: GroupDef[]) {
  for (const g of groups) {
    const picked = state.picked.get(g.id);
    for (const btn of els.chip(g.id)) {
      const v = btn.dataset.value ?? '';
      const on = v === '' ? !picked?.size : Boolean(picked?.has(v));
      btn.setAttribute('aria-pressed', String(on));
    }
  }
  const btn = els.modeBtn();
  if (btn) {
    const partLevel = hasPartFilter(groups);
    const inPartView = state.view === 'part';

    if (inPartView) {
      /* 仅部件模式下该开关恒为开启且不可操作。
         若允许关闭，命中卡会展开全部部件，等同于未筛选，
         与「按部件筛选」的目的相悖。 */
      state.mode = 'part';
      btn.disabled = true;
      btn.dataset.disabled = 'true';
      btn.setAttribute('aria-pressed', 'true');
      btn.title = REASON_PART_VIEW;
    } else {
      /* 退出仅部件模式后回到用户先前选择的粒度；
         只选种族、等级等魔物级标签时该开关无意义，禁用而非假装有效。 */
      if (!partLevel) state.mode = 'card';
      else state.mode = state.modePref;

      btn.disabled = !partLevel;
      btn.dataset.disabled = String(!partLevel);
      btn.setAttribute('aria-pressed', String(state.mode === 'part'));
      btn.title = !partLevel
        ? REASON_NO_PART_FILTER
        : state.mode === 'part'
          ? '当前：只显示命中的部件（点击切回整卡）'
          : '当前：命中即显示整个魔物（点击切换为只看部件）';
    }
  }
  for (const v of ['all', 'monster', 'part'] as const) {
    els.viewChip(v)?.setAttribute('aria-pressed', String(state.view === v));
  }
  const s = els.search();
  if (s && s.value !== state.query) s.value = state.query;
  els.searchClear()?.toggleAttribute('data-visible', Boolean(state.query));
}

function update(groups: GroupDef[], opts?: { url?: boolean; replace?: boolean }) {
  reconcileView(groups);
  syncChips(groups);
  apply(groups);
  if (opts?.url !== false) writeUrl(groups, { replace: opts?.replace });
}

/* ────────── 事件 ────────── */
function init() {
  const data = JSON.parse(document.getElementById('filter-boot')!.textContent!) as Boot;
  const { groups } = data;
  readUrl(groups);

  // chip 切换
  for (const g of groups) {
    for (const btn of els.chip(g.id)) {
      btn.addEventListener('click', () => {
        const v = btn.dataset.value ?? '';
        // 空值 = 「全部」：清空该组的选择
        if (v === '') {
          state.picked.delete(g.id);
          update(groups);
          return;
        }
        let set = state.picked.get(g.id);
        if (!set) { set = new Set(); state.picked.set(g.id, set); }
        if (set.has(v)) set.delete(v); else set.add(v);
        if (!set.size) state.picked.delete(g.id);
        update(groups);
      });
    }
  }

  // 显示模式
  for (const btn of Array.from(document.querySelectorAll<HTMLButtonElement>('.chip[data-view]'))) {
    btn.addEventListener('click', () => {
      const v = btn.dataset.view;
      if (v !== 'all' && v !== 'monster' && v !== 'part') return;
      state.view = v;
      state.viewPref = v === 'part' ? 'all' : v;
      /* 部件筛选存在时手动改显示模式：视为明确意图，直到部件筛选清空
         之前不再自动切换，避免与用户操作相互覆盖。 */
      state.viewPinned = hasPartFilter(groups);
      state.viewAuto = false;
      update(groups);
    });
  }

  // 筛选粒度
  els.modeBtn()?.addEventListener('click', (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    if (btn.disabled) return;
    state.modePref = state.modePref === 'card' ? 'part' : 'card';
    state.mode = state.modePref;
    update(groups);
  });

  // 搜索（防抖）
  const search = els.search();
  let timer = 0;
  search?.addEventListener('input', () => {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      state.query = search.value.trim();
      update(groups, { replace: true });
    }, 120);
  });
  search?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { search.value = ''; state.query = ''; update(groups); }
  });
  els.searchClear()?.addEventListener('click', () => {
    if (search) search.value = '';
    state.query = '';
    search?.focus();
    update(groups);
  });

  /* 筛选面板：悬浮下拉，随时可开，不推挤内容。
     收起动画结束后才 hidden，保证过渡可见。 */
  const panel = els.filters();
  const toggle = document.querySelector<HTMLButtonElement>('[data-filters-toggle]');
  const isOpen = () => Boolean(panel?.hasAttribute('data-open'));
  let closeTimer = 0;

  const setPanel = (open: boolean) => {
    if (!panel) return;
    window.clearTimeout(closeTimer);
    toggle?.setAttribute('aria-expanded', String(open));
    if (open) {
      panel.hidden = false;
      // 强制一次回流，避免 hidden 取消后过渡被合并跳过
      void panel.offsetHeight;
      panel.setAttribute('data-open', '');
    } else {
      panel.removeAttribute('data-open');
      closeTimer = window.setTimeout(() => { if (!isOpen()) panel.hidden = true; }, 400);
    }
  };

  toggle?.addEventListener('click', () => setPanel(!isOpen()));

  // Esc 收起；点击面板与顶栏之外的区域也收起
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) { setPanel(false); toggle?.focus(); }
  });
  document.addEventListener('pointerdown', (e) => {
    if (!isOpen()) return;
    const t = e.target as Node | null;
    if (!t) return;
    if (panel?.contains(t) || toggle?.contains(t)) return;
    setPanel(false);
  });

  // 实测顶栏高度 → CSS 变量（sticky 偏移与锚点滚动都依赖它）
  const measure = () => {
    const bar = document.querySelector<HTMLElement>('.site-header');
    if (!bar) return;
    const h = Math.round(bar.getBoundingClientRect().height);
    root.style.setProperty('--header-h', `${h}px`);
    root.style.setProperty('--sticky-top', `${h}px`);
  };
  measure();
  const bar = document.querySelector('.site-header');
  if (bar && 'ResizeObserver' in window) new ResizeObserver(measure).observe(bar);
  window.addEventListener('resize', measure, { passive: true });

  // 浏览器前进/后退
  window.addEventListener('popstate', () => {
    readUrl(groups);
    update(groups, { url: false });
  });

  // 回到顶部
  const top = document.querySelector<HTMLElement>('[data-to-top]');
  if (top) {
    const onScroll = () => top.toggleAttribute('data-visible', window.scrollY > 900);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // 键盘：/ 聚焦搜索，Esc 清空
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== search && !(e.target as HTMLElement)?.closest('input,textarea')) {
      e.preventDefault();
      search?.focus();
    }
  });

  // 首次渲染：若 URL 已有筛选，不写历史
  update(groups, { url: false });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
