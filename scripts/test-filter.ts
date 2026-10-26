/**
 * 筛选逻辑单元测试。跑的是 src/lib/filterState.ts 里的纯函数，
 * 也就是筛选岛实际调用的那份代码。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {
  activeKeys, matchesCard, splitTags, stateToQuery, queryToState,
} from '../src/lib/filterState';

const ROOT = path.resolve(import.meta.dirname, '..');
let pass = 0;
const fails: string[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    pass++;
  } catch (e) {
    fails.push(`${name} — ${(e as Error).message.split('\n')[0]}`);
  }
}

// ── 纯函数行为 ──────────────────────────────────────────────────────────
test('activeKeys 丢弃未选中的分组', () => {
  assert.deepEqual(activeKeys({ lv: 'lv9', race: null, dmg: 'tag_mag2' }), ['tag_mag2', 'lv9']);
});

test('activeKeys 空状态返回空数组', () => {
  assert.deepEqual(activeKeys({}), []);
  assert.deepEqual(activeKeys({ lv: null }), []);
});

test('matchesCard 空条件匹配所有', () => {
  assert.equal(matchesCard(['lv1', '野兽'], []), true);
});

test('matchesCard 多键为且关系', () => {
  const tags = ['lv9', '亡灵', 'tag_mag2', 'part_m', 'act_main'];
  assert.equal(matchesCard(tags, ['lv9']), true);
  assert.equal(matchesCard(tags, ['lv9', 'tag_mag2']), true);
  assert.equal(matchesCard(tags, ['lv9', 'tag_phy4']), false);
  assert.equal(matchesCard(tags, ['lv9', 'tag_mag2', 'act_main']), true);
});

test('matchesCard 不做子串匹配', () => {
  // 关键：lv9 不能因为 lv90 之类的近似值而命中；tag_phy4 不能命中 tag_phy40
  assert.equal(matchesCard(['lv90'], ['lv9']), false);
  assert.equal(matchesCard(['tag_phy40'], ['tag_phy4']), false);
});

test('splitTags 处理多余空白与 null', () => {
  assert.deepEqual(splitTags('  lv1   野兽 '), ['lv1', '野兽']);
  assert.deepEqual(splitTags(''), []);
  assert.deepEqual(splitTags(null), []);
});

test('stateToQuery 等级用短写法', () => {
  assert.equal(stateToQuery({ lv: 'lv9' }), 'lv=9');
});

test('stateToQuery 忽略未选中分组', () => {
  assert.equal(stateToQuery({ lv: null, race: '亡灵' }), 'race=%E4%BA%A1%E7%81%B5');
});

test('queryToState 兼容短写与全写', () => {
  const g = ['lv', 'race'];
  assert.deepEqual(queryToState('?lv=9', g), { lv: 'lv9' });
  assert.deepEqual(queryToState('?lv=lv9', g), { lv: 'lv9' });
});

test('queryToState 忽略未知分组与空值', () => {
  assert.deepEqual(queryToState('?bogus=1&race=&lv=3', ['lv', 'race']), { lv: 'lv3' });
});

test('查询串往返一致', () => {
  const state = { lv: 'lv7', race: '精灵', dmg: 'tag_heal' };
  const groups = ['lv', 'race', 'dmg'];
  const q = stateToQuery(state);
  assert.deepEqual(queryToState(`?${q}`, groups), state);
});

// ── 用真实产物验证 ────────────────────────────────────────────────────────
const HTML = path.join(ROOT, 'dist/index.html');
if (fs.existsSync(HTML)) {
  const html = fs.readFileSync(HTML, 'utf8');
  const cards = [...html.matchAll(/data-tags="([^"]*)"/g)].map((m) => splitTags(m[1]!));

  test('产物里每张卡片都能被 data-tags 选中', () => {
    assert.equal(cards.length, 380, `实得 ${cards.length}`);
    const empty = cards.filter((c) => c.length === 0);
    assert.equal(empty.length, 0, `有 ${empty.length} 张卡片 data-tags 为空`);
  });

  test('每张卡片都带等级与种族', () => {
    const races = new Set(['野兽', '精灵', '亡灵']);
    const bad = cards.filter((c) => !c.some((k) => /^lv\d$/.test(k)) || !c.some((k) => races.has(k)));
    assert.equal(bad.length, 0, `${bad.length} 张缺 lv 或种族`);
  });

  test('任一筛选按钮都能命中至少一张卡片', () => {
    const keyed = [...html.matchAll(/class="ft_tag[^"]*" data-group="[^"]*" data-key="([^"]*)"/g)]
      .map((m) => m[1]!);
    assert.ok(keyed.length > 0, '没有可点按钮');
    const dead = keyed.filter((k) => !cards.some((c) => matchesCard(c, [k])));
    assert.deepEqual(dead, [], `死按钮: ${dead.join(', ')}`);
  });

  test('筛选结果随条件收窄而不放大', () => {
    const n = (keys: string[]) => cards.filter((c) => matchesCard(c, keys)).length;
    assert.ok(n(['lv9']) > 0);
    assert.ok(n(['lv9', 'tag_mag2']) <= n(['lv9']));
    assert.ok(n(['lv9', 'tag_mag2', 'part_m']) <= n(['lv9', 'tag_mag2']));
  });
} else {
  fails.push('缺少 dist/index.html，真实产物相关的用例未执行');
}

console.log(`通过 ${pass} 项`);
if (fails.length) {
  console.error(`失败 ${fails.length} 项：`);
  for (const f of fails) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log('筛选逻辑测试全部通过');
