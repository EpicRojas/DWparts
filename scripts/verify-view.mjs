/**
 * 显示模式断言：全部 / 仅魔物 / 仅部件。
 *
 *   node scripts/verify-view.mjs [baseUrl]
 */
import puppeteer from 'puppeteer-core';

const BASE = process.argv[2] ?? 'http://127.0.0.1:8083/';
let fail = 0;
const bad = (m) => { fail++; console.error(`  ✗ ${m}`); };
const good = (m) => console.log(`  ✓ ${m}`);

const b = await puppeteer.launch({
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
});
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900 });
await p.goto(BASE, { waitUntil: 'networkidle2' });

const state = () => p.evaluate(() => {
  const m = document.querySelector('.monster');
  const head = m.querySelector('.monster__head');
  const parts = m.querySelector('.parts');
  return {
    url: location.search,
    view: document.documentElement.dataset.view,
    headDisplay: getComputedStyle(head).display,
    partsDisplay: getComputedStyle(parts).display,
    headBorder: getComputedStyle(head).borderBottomWidth,
    count: document.querySelector('[data-result-count]').textContent.trim(),
    pressed: [...document.querySelectorAll('.chip[data-view]')]
      .filter((c) => c.getAttribute('aria-pressed') === 'true')
      .map((c) => c.textContent.trim()),
  };
});

/* 位置：应为面板第一行 */
const firstRow = await p.evaluate(() => {
  const rows = [...document.querySelectorAll('.filters .filter-row')];
  return rows[0]?.querySelector('.filter-row__label')?.textContent.trim();
});
if (firstRow === '显示模式') good('显示模式位于筛选面板第一行');
else bad(`首行是「${firstRow}」，应为「显示模式」`);

/* 默认 */
const s0 = await state();
if (s0.view === 'all' && s0.headDisplay === 'grid' && s0.partsDisplay === 'grid') good('默认：头部与部件均显示');
else bad(`默认状态异常 ${JSON.stringify(s0)}`);

await p.click('[data-filters-toggle]');
await new Promise((r) => setTimeout(r, 600));

/* 仅部件 */
await p.evaluate(() => document.querySelector('.chip[data-view="part"]').click());
await new Promise((r) => setTimeout(r, 300));
const s1 = await state();
if (s1.headDisplay === 'none') good('仅部件：魔物头部不渲染');
else bad(`仅部件时头部仍显示（${s1.headDisplay}）`);
// 纯列表布局下 .parts 改为 display: contents，部件直接成为网格项
if (s1.partsDisplay === 'contents' || s1.partsDisplay === 'grid') good(`仅部件：部件区保留（${s1.partsDisplay}）`);
else bad(`仅部件时部件区被隐藏（${s1.partsDisplay}）`);
if (s1.url.includes('view=part')) good(`URL 记录 view=part`);
else bad(`URL 未记录：${s1.url}`);
if (/部件$/.test(s1.count)) good(`计数改为部件数：${s1.count}`);
else bad(`计数格式不符：${s1.count}`);

/* 仅魔物 */
await p.evaluate(() => document.querySelector('.chip[data-view="monster"]').click());
await new Promise((r) => setTimeout(r, 300));
const s2 = await state();
if (s2.partsDisplay === 'none') good('仅魔物：部件区不渲染');
else bad(`仅魔物时部件区仍显示（${s2.partsDisplay}）`);
if (s2.headDisplay === 'grid') good('仅魔物：头部保留');
else bad(`仅魔物时头部被隐藏`);
if (s2.headBorder === '0px') good('仅魔物：头部去掉底部分隔线');
else bad(`仅魔物时头部仍有分隔线（${s2.headBorder}）`);

/* 回到全部 */
await p.evaluate(() => document.querySelector('.chip[data-view="all"]').click());
await new Promise((r) => setTimeout(r, 300));
const s3 = await state();
if (s3.headDisplay === 'grid' && s3.partsDisplay === 'grid' && !s3.url.includes('view=')) good('回到全部：两区均显示，URL 无 view 参数');
else bad(`回到全部异常 ${JSON.stringify(s3)}`);

/* URL 还原 */
await p.goto(`${BASE}?view=part`, { waitUntil: 'networkidle2' });
const s4 = await state();
if (s4.view === 'part' && s4.headDisplay === 'none' && s4.pressed.includes('仅部件')) good('URL 直接进入仅部件模式');
else bad(`URL 还原失败 ${JSON.stringify(s4)}`);

/* 与标签筛选叠加 */
await p.goto(`${BASE}?view=part&act=react`, { waitUntil: 'networkidle2' });
const s5 = await p.evaluate(() => {
  const vis = [...document.querySelectorAll('.monster')].filter((m) => !m.hidden);
  return {
    cards: vis.length,
    headsShown: vis.filter((m) => getComputedStyle(m.querySelector('.monster__head')).display !== 'none').length,
  };
});
if (s5.headsShown === 0) good(`与标签筛选叠加：${s5.cards} 张卡命中，均不显示头部`);
else bad(`叠加时仍有 ${s5.headsShown} 张显示头部`);

/* ────────── 仅部件模式的纯列表布局 ────────── */
for (const [w, h, cols, label] of [[1440, 900, 4, '桌面'], [1024, 800, 2, '中屏'], [390, 844, 1, '竖屏']]) {
  await p.setViewport({ width: w, height: h });
  await p.goto(`${BASE}?view=part&act=react`, { waitUntil: 'networkidle2' });
  const g = await p.evaluate(() => {
    const content = document.querySelector('.content');
    const cs = getComputedStyle(content);
    const m = document.querySelector('.monster');
    return {
      display: cs.display,
      cols: cs.gridTemplateColumns.split(' ').filter(Boolean).length,
      monsterDisplay: getComputedStyle(m).display,
      partsDisplay: getComputedStyle(m.querySelector('.parts')).display,
      cards: [...document.querySelectorAll('.monster')].filter((x) => !x.hidden).length,
    };
  });
  if (g.display === 'grid' && g.cols === cols) good(`纯列表 ${label}：${cols} 列`);
  else bad(`纯列表 ${label}：期望 ${cols} 列，实际 ${g.cols}（display=${g.display}）`);
  if (g.monsterDisplay === 'contents' && g.partsDisplay === 'contents') good(`纯列表 ${label}：卡片外壳已脱离布局`);
  else bad(`纯列表 ${label}：外壳仍占位（monster=${g.monsterDisplay} parts=${g.partsDisplay}）`);
}
await p.setViewport({ width: 1440, height: 900 });

/* ────────── 仅部件模式下粒度开关不可用 ────────── */
await p.goto(`${BASE}?view=part&act=react`, { waitUntil: 'networkidle2' });
const lock = await p.evaluate(() => {
  const btn = document.querySelector('[data-mode-toggle]');
  return { disabled: btn.disabled, pressed: btn.getAttribute('aria-pressed'), title: btn.title };
});
if (lock.disabled) good('仅部件模式：粒度开关已禁用');
else bad('仅部件模式：粒度开关仍可点击');
if (lock.pressed === 'true') good('仅部件模式：粒度开关呈强制开启态');
else bad(`仅部件模式：粒度开关未开启（${lock.pressed}）`);
if (lock.title.includes('不可切换')) good('仅部件模式：已给出不可切换的说明');
else bad(`仅部件模式：说明文字缺失（${lock.title}）`);

/* ────────── 部件区标签自动切换显示模式 ────────── */
await p.goto(BASE, { waitUntil: 'networkidle2' });
await p.click('[data-filters-toggle]');
await new Promise((r) => setTimeout(r, 600));
const step = () => p.evaluate(() => ({
  view: document.documentElement.dataset.view,
  pressed: [...document.querySelectorAll('.chip[data-view]')]
    .filter((c) => c.getAttribute('aria-pressed') === 'true').map((c) => c.textContent.trim()),
}));

/* 魔物级标签不触发 */
await p.evaluate(() => document.querySelector('.chip[data-group="race"][data-value="undead"]').click());
await new Promise((r) => setTimeout(r, 250));
let a = await step();
if (a.view === 'all') good('魔物级标签：不触发自动切换');
else bad(`魔物级标签误触发：${a.view}`);

/* 部件级标签触发 */
await p.evaluate(() => document.querySelector('.chip[data-group="act"][data-value="main"]').click());
await new Promise((r) => setTimeout(r, 250));
a = await step();
if (a.view === 'part' && a.pressed.includes('仅部件')) good('部件级标签：自动切到仅部件');
else bad(`未自动切换：${JSON.stringify(a)}`);

/* 继续多选仍保持 */
await p.evaluate(() => document.querySelector('.chip[data-group="dmg"][data-value="phy4"]').click());
await new Promise((r) => setTimeout(r, 250));
a = await step();
if (a.view === 'part') good('继续多选部件区：保持仅部件');
else bad(`多选后变了：${a.view}`);

/* 逐个取消仍有部件筛选时保持 */
await p.evaluate(() => document.querySelector('.chip[data-group="act"][data-value="main"]').click());
await new Promise((r) => setTimeout(r, 250));
a = await step();
if (a.view === 'part') good('仍有部件筛选：保持仅部件');
else bad(`提前恢复：${a.view}`);

/* 全部清空后恢复 */
await p.evaluate(() => document.querySelector('.chip[data-group="dmg"][data-value="phy4"]').click());
await new Promise((r) => setTimeout(r, 250));
a = await step();
if (a.view === 'all' && a.pressed.includes('全部')) good('部件区全部清空：恢复原显示模式');
else bad(`未恢复：${JSON.stringify(a)}`);

/* 手动覆盖：部件筛选存在时切到全部，应保持到清空 */
await p.evaluate(() => document.querySelector('.chip[data-group="act"][data-value="main"]').click());
await new Promise((r) => setTimeout(r, 250));
await p.evaluate(() => document.querySelector('.chip[data-view="all"]').click());
await new Promise((r) => setTimeout(r, 250));
await p.evaluate(() => document.querySelector('.chip[data-group="dmg"][data-value="phy4"]').click());
await new Promise((r) => setTimeout(r, 250));
a = await step();
if (a.view === 'all') good('手动切回全部后：新增部件筛选不再强制切换');
else bad(`手动选择被覆盖：${a.view}`);

await b.close();
console.log('');
if (fail) { console.error(`❌ ${fail} 项问题`); process.exit(1); }
console.log('✅ 显示模式全部符合预期');
