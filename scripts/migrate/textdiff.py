#!/usr/bin/env python3
"""
文本保真度对比：v1 页面 vs v2 构建产物，按怪物 id + 部件 slot 逐字段比对。

比的是用户真正看到的内容，而不是 YAML 源文件。
字段：部件名、加成行、正文散文、效果（名+说明）。

标签区（动作/攻击类型/加值/豁免）单独比：v1 的标签对必须是 v2 的子集，
因为 v2 会补齐 v1 漏写的标签（那是修 bug，不算丢内容）。
"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from minidom import parse

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SLOTS = ['b', 'm', 's1', 's2']


def groups_of(path):
    root = parse(path)
    cw = root.by_class('content_wrap')[0]
    out, cur = {}, None
    for k in [x for x in cw.children if not isinstance(x, str)]:
        if k.has('char_row'):
            cur = {'row': k, 'parts': []}
            ims = k.find_all(lambda n: n.tag == 'img')
            if ims:
                out[ims[0].attrs['src'].split('/')[-1].replace('.webp', '')] = cur
        elif cur is not None:
            cur['parts'].append(k)
    return out


def norm(s):
    s = re.sub(r'\s+', '', s)
    return s.replace('（', '(').replace('）', ')').replace('，', ',')


def pick(card, cls):
    r = card.find_all(lambda n: n.tag == 'div' and n.has(cls))
    return r[0] if r else None


def texts(card):
    """把卡片拆成可比对的字段集合"""
    name = norm(pick(card, 'comp_name').text()) if pick(card, 'comp_name') else ''
    bonus = []
    cb = pick(card, 'comp_bonus')
    if cb:
        for row in [x for x in cb.children if not isinstance(x, str) and x.tag == 'div']:
            t = norm(row.text())
            if t:
                bonus.append(t)
    prose = ''
    cc = pick(card, 'comp_cont')
    effs = []
    tags = []
    if cc:
        parts = []
        for ch in cc.children:
            if isinstance(ch, str):
                if ch.strip():
                    parts.append(ch)
                continue
            if ch.tag == 'div' and ch.has('effects'):
                for et in [x for x in ch.children if not isinstance(x, str)]:
                    effs.append(norm(et.text()))
                continue
            if ch.tag == 'div' and ch.has('tags'):
                for tg in [x for x in ch.children if not isinstance(x, str)]:
                    u = pick(tg, 'tag_upp')
                    l = pick(tg, 'tag_low')
                    if u is not None and l is not None:
                        imgs = tuple(sorted(i.attrs.get('src', '').split('/')[-1].replace('.webp', '')
                                            for i in l.find_all(lambda n: n.tag == 'img')))
                        tags.append((norm(u.text()), norm(l.text()), imgs))
                continue
            if ch.tag == 'div' and ch.has('dmg_grid'):
                parts.append(ch.text())
                continue
            parts.append(ch.text())
        prose = norm(''.join(parts))
    return {'name': name, 'bonus': bonus, 'prose': prose, 'effects': effs,
            'tags': tags}


v1 = groups_of(os.path.join(ROOT, 'legacy/index.html'))
v2 = groups_of(os.path.join(ROOT, 'dist/index.html'))

missing = sorted(set(v1) - set(v2))
extra = sorted(set(v2) - set(v1))
if missing or extra:
    print(f'怪集合不一致 — v2 缺: {missing}  v2 多: {extra}')
    sys.exit(1)

# v1 已知的数据错误，迁移时已按图标修正，不视为回归
KNOWN_V1_ERRORS = {
    'ELM901 m': 'v1 文本写「基于魅力」但图标与 class 都是 INT，v2 以图标为准',
}

bad = []
checked = 0
for mid in sorted(v1):
    for i, (p1, p2) in enumerate(zip(v1[mid]['parts'], v2[mid]['parts'])):
        checked += 1
        a, b = texts(p1), texts(p2)
        slot = SLOTS[i]
        where = f'{mid} {slot}'

        if f'{where}' in KNOWN_V1_ERRORS:
            continue

        if a['name'] != b['name']:
            bad.append(f'{where} 名称: {a["name"]!r} → {b["name"]!r}')

        # 加成：v2 可能补出 v1 没有的纯筛选标记，所以按子集比
        for x in a['bonus']:
            if not any(x in y or y in x for y in b['bonus']):
                bad.append(f'{where} 加成丢失: {x!r}')
        # 正文散文
        for chunk in [c for c in re.split(r'[。；]', a['prose']) if len(c) >= 4]:
            if chunk not in b['prose']:
                bad.append(f'{where} 正文丢失: {chunk!r}')
        # 效果
        for e in a['effects']:
            if not any(e in f or f in e for f in b['effects']):
                bad.append(f'{where} 效果丢失: {e[:60]!r}')
        # 标签：v1 每条标签的图标集合必须是 v2 同标签项的子集。
        # v2 会补齐 v1 页面上漏显示的图标（例如 class 里有 AoE、页面只写了「法术远程」），
        # 那是修 bug，不算丢内容，所以只要求「v1 有的 v2 都有」。
        for lab, txt, imgs in a['tags']:
            cands = [x for x in b['tags'] if x[0] == lab]
            if not cands:
                bad.append(f'{where} 标签整条丢失: {lab}')
                continue
            if not any(set(imgs) <= set(c[2]) for c in cands):
                bad.append(f'{where} 标签图标丢失: {lab} {imgs} → {[c[2] for c in cands]}')

print(f'对比 {checked} 张部件卡 / {len(v1)} 只怪；问题 {len(bad)} 处')
for x in bad[:30]:
    print('  ✗', x)
if len(bad) > 30:
    print(f'  ... 另有 {len(bad)-30} 处')
sys.exit(1 if bad else 0)
