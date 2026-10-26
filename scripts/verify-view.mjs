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
if (s1.partsDisplay === 'grid') good('仅部件：部件区保留');
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

await b.close();
console.log('');
if (fail) { console.error(`❌ ${fail} 项问题`); process.exit(1); }
console.log('✅ 显示模式全部符合预期');
