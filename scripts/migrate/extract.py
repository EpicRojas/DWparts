#!/usr/bin/env python3
"""
v1 单页 HTML → v2 YAML 数据。

    python3 scripts/migrate/extract.py

输出：
    src/content/monsters/<ID>.yaml        76 个数据文件
    scripts/migrate/legacy-tags.json      v1 的筛选类快照，供校验对比（迁移完成后删除）

设计原则：**不做任何猜测性还原**。能从 v1 class 直接读到的筛选语义就直读，
读不出来的（比如 "免疫中毒" 这种自由文案）原样保留为 text 字段。
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from minidom import parse                    # noqa: E402
from yamlio import dump                      # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'legacy/index.html')
OUT_DIR = os.path.join(ROOT, 'src/content/monsters')
TAGS_OUT = os.path.join(ROOT, 'scripts/migrate/legacy-tags.json')

RACES = ('野兽', '精灵', '亡灵')
STAT_CN = {'力量': 'str', '敏捷': 'dex', '体质': 'con', '智力': 'int', '感知': 'wis', '魅力': 'cha'}
STAT_ICON = {'STR': 'str', 'DEX': 'dex', 'CON': 'con', 'INT': 'int', 'WIS': 'wis', 'CHA': 'cha'}
ACTION_CN = {'主要': 'main', '反应': 'react', '总是生效': 'passive'}
ATTACK_ICON = {'melee': 'melee', 'ranged': 'ranged', 'spell': 'spell', 'AoE': 'AoE'}
DAMAGE_KEYS = {'phy1','phy2','phy3','phy4','ele1','ele2','ele3','ele4','ele5','ele6','ele7','mag1','mag2','mag3','mag4','heal','shield'}

TEXT_COLORS = {'pink', 'blue', 'lb', 'lgreen', 'orange', 'green', 'red', 'org', 'buff', 'debuff'}
IGNORE_SPAN = {'dmg_mult', 'effect_name', 'tag_upp', 'tag_low', 'ico'}

warnings = []


def warn(msg):
    warnings.append(msg)


# ── DOM 小工具 ─────────────────────────────────────────────────────────────

def kids(n):
    return [c for c in n.children if not isinstance(c, str)]


def text_of(n):
    return re.sub(r'\s+', ' ', n.text()).strip()


def find(n, pred):
    return n.find_all(pred)


def by_cls(n, cls):
    return find(n, lambda x: x.has(cls))


def first_cls(n, cls):
    r = by_cls(n, cls)
    return r[0] if r else None


def imgs(n):
    return find(n, lambda x: x.tag == 'img')


def img_key(im):
    src = im.attrs.get('src', '')
    return src.rsplit('/', 1)[-1].replace('.webp', '') if src else ''


# ── HTML → 内联标记 ────────────────────────────────────────────────────────

def _ser(ch, skip=None):
    """序列化单个子节点。span 需要保留自身 class，这是着色标记的来源。"""
    if isinstance(ch, str):
        return re.sub(r'\s+', ' ', ch)
    if ch.tag == 'img':
        k = img_key(ch)
        return '' if (not k or k == skip) else '{%s}' % k
    if ch.tag == 'span':
        cls = (ch.classes[0] if ch.classes else '')
        inner = inline(ch, skip=cls)
        if cls in IGNORE_SPAN:
            return inner
        return '{%s|%s}' % (cls, inner) if cls else inner
    if ch.tag == 'div':
        return ''
    return inline(ch, skip=skip)


def inline(node, skip=None):
    """
    把节点的子节点序列化成 `{key|文本}` 标记。

    <img ele1>火焰伤害      → {ele1|火焰伤害}
    <span blue>优势</span>  → {blue|优势}
    末尾孤立的 <img CHA>    → {cha}
    span 内部与自身同名的图标会被跳过，避免 {phy4|{phy4}物理伤害}。
    """
    out = []
    for ch in node.children:
        piece = _ser(ch, skip)
        if not piece:
            continue
        if out and out[-1].endswith(' ') is False and piece.startswith(' '):
            pass
        out.append(piece)
    s = ''.join(out)
    s = re.sub(r'\{([a-zA-Z0-9_]+)\}', lambda m: m.group(0), s)
    s = re.sub(r' {2,}', ' ', s)
    return s.strip()


def merge_dup(s):
    """`{X}{X|文本}` → `{X|文本}`；`{X}{X|}` → `{X}`"""
    return re.sub(r'\{(\w+)\}\{\1\|([^}]*)\}', lambda m: '{%s|%s}' % (m.group(1), m.group(2)), s)


def inline_merging(node):
    return merge_dup(inline(node))


# ── 各字段解析 ────────────────────────────────────────────────────────────

def parse_damage(card):
    """dmg_grid → [{dice, type, stat, factor?, note?}]"""
    grid = first_cls(card, 'dmg_grid')
    if grid is None:
        return []
    out = []
    for ds in find(grid, lambda x: x.tag == 'div' and x.has('dmg_show')):
        classes = [c for c in ds.classes if c != 'dmg_show']
        dtype = classes[0] if classes else None
        if not dtype:
            warn('dmg_show 无伤害类型 class: %r' % text_of(ds))
            continue
        # 文本节点顺序：骰子 → (类型图标) → 名称 → (属性图标) → (系数)
        raw = []
        stat = None
        factor = None
        note = None
        for ch in ds.children:
            if isinstance(ch, str):
                if ch.strip():
                    raw.append(ch.strip())
            elif ch.tag == 'img':
                k = img_key(ch)
                if k in STAT_ICON:
                    stat = STAT_ICON[k]
            elif ch.tag == 'span' and ch.has('dmg_mult'):
                factor = text_of(ch).strip('()').strip()
        dice = re.sub(r'^[+＋]\s*', '', ' '.join(raw)).split(' ')[0]
        dice = dice.strip()
        if not re.fullmatch(r'\d+(d\d+)?([+-]\d+)?', dice):
            warn('无法解析骰子 %r (class=%s)' % (dice, dtype))
            continue
        if stat is None and out:
            stat = out[-1].get('stat')
        entry = {'dice': dice, 'type': dtype}
        if stat:
            entry['stat'] = stat
        if factor is not None:
            entry['factor'] = factor
        if note:
            entry['note'] = note
        # stat 为 None 是合法的：v1 里治疗段与按层数递增的段确实不标属性
        out.append(entry)
    return out


BONUS_STAT = [
    (r'^力量\+(\d+)$', 'str'), (r'^敏捷\+(\d+)$', 'dex'), (r'^体质\+(\d+)$', 'con'),
    (r'^智力\+(\d+)$', 'int'), (r'^感知\+(\d+)$', 'wis'), (r'^魅力\+(\d+)$', 'cha'),
    (r'^最大生命值\+(\d+)$', 'mhp'), (r'^护甲(?:等级)?\+(\d+)$', 'ac'),
    (r'^先攻\+(\d+)$', 'ini'), (r'^(?:命中检定|攻击命中|命中)\+?(\d+)$', 'hit'),
    (r'^法术豁免难度\+(\d+)$', 'dc'), (r'^豁免DC\+(\d+)$', 'dc'),
    (r'^先攻检定\+(\d+)$', 'ini'), (r'^护甲等级\(AC\)\+(\d+)$', 'ac'),
]


def parse_bonus(card):
    """comp_bonus → [{stat, amount, text?}] 或 [{text}]"""
    cb = first_cls(card, 'comp_bonus')
    if cb is None:
        return []
    out = []
    for row in kids(cb):
        if row.tag != 'div':
            continue
        t = inline_merging(row)
        if not t:
            continue
        structured = False
        plain = text_of(row)
        for pat, key in BONUS_STAT:
            m = re.fullmatch(pat, plain)
            if m:
                e = {'stat': key, 'amount': int(m.group(1))}
                # 展示文案与推导默认值不同时保留原文
                if key == 'dc' and plain != '豁免DC+%s' % m.group(1):
                    e['text'] = t
                out.append(e)
                structured = True
                break
        if structured:
            continue
        m = re.fullmatch(r'抵抗\{(\w+)\|[^}]*\}', t)
        if m and m.group(1) in DAMAGE_KEYS:
            out.append({'resist': m.group(1)})
            continue
        m = re.fullmatch(r'免疫(\{[^}]*\}|.+)', t)
        if m:
            out.append({'text': t})
            continue
        out.append({'text': t})
    return out


def parse_effects(card):
    box = first_cls(card, 'effects')
    if box is None:
        return []
    out = []
    for et in kids(box):
        name_el = first_cls(et, 'effect_name')
        if name_el is None:
            warn('effect_tag 缺 effect_name: %r' % text_of(et)[:40])
            continue
        name = text_of(name_el)
        # 名称之后的全部内容
        body_parts = []
        seen = False
        for ch in et.children:
            if isinstance(ch, str):
                if ch.strip():
                    body_parts.append(re.sub(r'\s+', ' ', ch))
                continue
            if ch is name_el:
                seen = True
                continue
            if not seen:
                continue
            body_parts.append(_ser(ch))
        body = merge_dup(re.sub(r'^[\s:：]+', '', ''.join(body_parts)).strip())
        out.append({'name': name, 'text': body})
    return out


def parse_tags(card):
    """tags → (结构化字段 dict, v1 原样 class 集合)"""
    box = first_cls(card, 'tags')
    if box is None:
        return {}, set()
    res = {}
    for tag in kids(box):
        if tag.tag != 'div':
            continue
        upp = first_cls(tag, 'tag_upp')
        low = first_cls(tag, 'tag_low')
        if upp is None or low is None:
            continue
        label = text_of(upp)
        low_imgs = [img_key(i) for i in imgs(low)]
        low_text = text_of(low)
        if label == '动作':
            if low_text in ACTION_CN:
                res['action'] = ACTION_CN[low_text]
            else:
                warn('未知动作 %r' % low_text)
        elif label == '攻击类型':
            types = [t for t in low_imgs if t in ATTACK_ICON]
            if types:
                res['attackTypes'] = types
        elif label == '加值':
            # 文本、图标、class 三者偶有不一致。以图标为准（与 class 同源），并记录。
            m = re.fullmatch(r'基于(力量|敏捷|体质|智力|感知|魅力)', low_text)
            icon_stats = [STAT_ICON[k] for k in low_imgs if k in STAT_ICON]
            if icon_stats:
                res['damageStat'] = icon_stats[0]
                if m and STAT_CN[m.group(1)] != icon_stats[0]:
                    warn('加值文本与图标不一致：文本「%s」图标 %s，取图标'
                         % (low_text, icon_stats[0]))
            elif m:
                res['damageStat'] = STAT_CN[m.group(1)]
            else:
                warn('未知加值 %r' % low_text)
        elif label == '命中检定':
            if low_text in STAT_CN:
                res['hitStat'] = STAT_CN[low_text]
            else:
                warn('未知命中属性 %r' % low_text)
        elif label == '豁免检定':
            m = re.fullmatch(r'(力量|敏捷|体质|智力|感知|魅力)\s*/\s*DC\s*(\d+)', low_text)
            if m:
                save = {'stat': STAT_CN[m.group(1)], 'dc': int(m.group(2))}
                extra = [k for k in low_imgs if k in STAT_ICON]
                if extra:
                    save['dcStat'] = STAT_ICON[extra[-1]]
                res['save'] = save
            else:
                warn('未知豁免 %r' % low_text)
        else:
            warn('未知标签标签 %r' % label)
    return res, set()


def card_body(card):
    """comp_cont → (text, damage, effects, tags)"""
    cc = first_cls(card, 'comp_cont')
    if cc is None:
        return '', [], [], {}
    parts = []
    for ch in cc.children:
        if isinstance(ch, str):
            if ch.strip():
                parts.append(re.sub(r'\s+', ' ', ch))
            continue
        if ch.tag == 'div' and ch.has('dmg_grid'):
            continue
        if ch.tag == 'div' and ch.has('effects'):
            continue
        if ch.tag == 'div' and ch.has('tags'):
            continue
        parts.append(_ser(ch))
    body = merge_dup(re.sub(r'\s+', ' ', ''.join(parts)).strip())
    return body, parse_damage(card), parse_effects(card), parse_tags(card)[0]


def name_of(card):
    el = first_cls(card, 'comp_name')
    return text_of(el) if el else ''


# ── 部件组装 ──────────────────────────────────────────────────────────────

def reconcile(ability, cls_keys):
    """
    v1 的 class 是权威筛选语义，但页面显示常有残缺（b 卡普遍漏写 class，
    s1/s2 普遍漏显示「总是生效」）。这里把 class 中有、结构化字段里没有的键补齐：
      能用结构化字段表达的 → 补字段（顺带修好展示）
      表达不了的            → 进 extraTags（只参与筛选）
    """
    extra = set()

    if not ability.get('action'):
        for c in cls_keys:
            if c.startswith('act_') and c[4:] in ('main', 'react', 'passive'):
                ability['action'] = c[4:]

    # 攻击类型保持 v1 class 里的书写顺序，不重排（重排会改变页面显示顺序）
    atk = list(ability.get('attackTypes') or [])
    for c in cls_keys:
        if c in ('melee', 'ranged', 'spell', 'AoE') and c not in atk:
            atk.append(c)
    if atk:
        ability['attackTypes'] = atk

    if not ability.get('damageStat'):
        for c in cls_keys:
            if c.startswith('mult_'):
                ability['damageStat'] = c[5:]

    save = ability.get('save')
    dc_keys = [c[3:] for c in cls_keys if c.startswith('dc_')]
    if dc_keys:
        if save is None:
            # class 标了 dc_* 但没有豁免检定标签：纯筛选语义
            extra.update('dc_' + k for k in dc_keys)
        elif not save.get('dcStat'):
            save['dcStat'] = dc_keys[0]

    have_bon = {b['stat'] for b in (ability.get('bonus') or []) if 'stat' in b}
    for c in cls_keys:
        if c.startswith('bon_'):
            k = c[4:]
            if k not in have_bon:
                if k in ('str', 'dex', 'con', 'int', 'wis', 'cha', 'mhp', 'ac', 'ini', 'hit', 'dc'):
                    ability.setdefault('bonus', []).append({'stat': k, 'amount': 0})
                    have_bon.add(k)
                else:
                    extra.add(c)

    have_tag = {d['type'] for d in (ability.get('damage') or [])}
    for c in cls_keys:
        if c.startswith('tag_') and c[4:] not in have_tag:
            extra.add(c)

    if extra:
        ability['extraTags'] = sorted(extra)
    return ability


def build_ability(card, slot=None, v1tags=None):
    body, damage, effects, tags = card_body(card)
    ability = {'name': name_of(card)}
    if slot:
        ability['slot'] = slot
    if tags.get('action'):
        ability['action'] = tags['action']
    bonus = parse_bonus(card)
    if bonus:
        ability['bonus'] = bonus
    if damage:
        ability['damage'] = damage
    if tags.get('damageStat'):
        ability['damageStat'] = tags['damageStat']
    if tags.get('save', {}).get('dcStat'):
        ability['dcStat'] = tags['save']['dcStat']
    if tags.get('attackTypes'):
        ability['attackTypes'] = tags['attackTypes']
    if tags.get('hitStat'):
        ability['hitStat'] = tags['hitStat']
    if tags.get('save'):
        ability['save'] = tags['save']
    if body:
        ability['text'] = body
    if effects:
        ability['effects'] = effects
    reconcile(ability, collect_v1_keys(card))
    return ability


def collect_v1_keys(card):
    """v1 卡片 class 里的筛选键（排除布局/层级/种族/part_）"""
    keys = set()
    for c in card.classes:
        if c in ('col-3', 'ft_list', 'row', 'char_row'):
            continue
        if re.fullmatch(r'lv\d', c) or c in RACES:
            continue
        if c.startswith('part_'):
            continue
        keys.add(c)
    return keys


def parse_monster(row, parts):
    icon = first_cls(row, 'icon')
    im = imgs(icon)[0] if icon else None
    mid = img_key(im) if im else None
    name_el = first_cls(icon, 'name') if icon else None
    name = text_of(name_el) if name_el else ''

    c3 = first_cls(row, 'ministat')
    c3divs = [text_of(d) for d in kids(c3)] if c3 else []
    level = int(re.sub(r'\D', '', c3divs[0])) if c3divs else None
    race = c3divs[1] if len(c3divs) > 1 else None
    dominance = int(c3divs[2]) if len(c3divs) > 2 and c3divs[2].isdigit() else 1

    c6 = first_cls(row, 'col6')
    titles = [[c for c in d.classes] for d in kids(c6)]
    labels = [text_of(d) for d in kids(c6)][:6]
    values = [text_of(d) for d in kids(c6)][6:]
    stats = {}
    adv = None
    for i, lab in enumerate(labels):
        stats[STAT_CN[lab]] = int(values[i])
        if 'adv' in titles[i]:
            adv = STAT_CN[lab]

    c2 = first_cls(row, 'col2')
    nums = [text_of(d) for d in kids(c2)]
    hp = int(re.sub(r'\D', '', nums[1]))
    ac = int(re.sub(r'\D', '', nums[3]))

    # char_row 里的第三列是「基础动作」
    basic_card = None
    for ch in kids(row):
        if ch.tag == 'div' and ch.has('col-3'):
            basic_card = ch
            break

    m = {'id': mid, 'name': name, 'race': race, 'level': level, 'dominance': dominance,
         'stats': stats}
    if adv:
        m['statAdvantage'] = adv
    m['hp'] = hp
    m['ac'] = ac
    return m, basic_card


SLOT_ORDER = ['b', 'm', 's1', 's2']


def slot_of(card, index):
    for c in card.classes:
        if c.startswith('part_') and c[5:] in ('m', 's1', 's2'):
            return c[5:]
    return 'b' if index == 0 else None


def main():
    root = parse(SRC)
    cw = first_cls(root, 'content_wrap')
    if cw is None:
        sys.exit('找不到 .content_wrap')

    groups = []
    cur = None
    for ch in kids(cw):
        if ch.has('char_row'):
            cur = {'row': ch, 'parts': []}
            groups.append(cur)
        elif cur is not None:
            cur['parts'].append(ch)

    if len(groups) != 76:
        sys.exit('期望 76 组，实得 %d' % len(groups))

    os.makedirs(OUT_DIR, exist_ok=True)
    v1snap = {}
    written = 0

    for g in groups:
        monster, basic_card = parse_monster(g['row'], g['parts'])
        if not monster['id']:
            warn('跳过无 id 的怪：%r' % monster['name'])
            continue

        v1snap[monster['id']] = {'basic': sorted(collect_v1_keys(basic_card)) if basic_card else [],
                                 'parts': {}}

        data = {k: monster[k] for k in ('id', 'name', 'race', 'level', 'dominance', 'stats')}
        if monster.get('statAdvantage'):
            data['statAdvantage'] = monster['statAdvantage']
        data['hp'] = monster['hp']
        data['ac'] = monster['ac']

        if basic_card is not None:
            v1snap[monster['id']]['basic'] = sorted(collect_v1_keys(basic_card))
            data['basic'] = build_ability(basic_card)
        else:
            warn('%s 无基础动作卡' % monster['id'])
            data['basic'] = {'name': ''}

        parts = []
        for i, pc in enumerate(g['parts']):
            slot = slot_of(pc, i)
            if slot is None:
                warn('%s 第 %d 个部件无法确定 slot' % (monster['id'], i))
                slot = SLOT_ORDER[i] if i < 4 else 'b'
            v1snap[monster['id']]['parts'][slot] = sorted(collect_v1_keys(pc))
            parts.append(build_ability(pc, slot=slot))
        parts.sort(key=lambda p: SLOT_ORDER.index(p['slot']))
        data['parts'] = parts

        path = os.path.join(OUT_DIR, '%s.yaml' % monster['id'])
        with open(path, 'w', encoding='utf-8') as f:
            f.write('# %s（%s）\n' % (monster['name'], monster['id']))
            f.write(dump(data) + '\n')
        written += 1

    with open(TAGS_OUT, 'w', encoding='utf-8') as f:
        json.dump(v1snap, f, ensure_ascii=False, indent=1, sort_keys=True)

    print('写入 %d 个 YAML → %s' % (written, os.path.relpath(OUT_DIR, ROOT)))
    print('v1 筛选键快照 → %s' % os.path.relpath(TAGS_OUT, ROOT))
    if warnings:
        print('\n警告 %d 条：' % len(warnings))
        for w in warnings[:40]:
            print('  !', w)
        if len(warnings) > 40:
            print('  ... 另有 %d 条' % (len(warnings) - 40))
    else:
        print('无警告')


if __name__ == '__main__':
    main()
