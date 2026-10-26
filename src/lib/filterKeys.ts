/**
 * 筛选面板的纯数据定义（无 import.meta、无 DOM 依赖），
 * 渲染（filters.ts）与校验（scripts/check.ts）共用这一份，避免两边漂移。
 * `icon` 是 assets/raw/common 下的文件名（不含扩展名）。
 */

export type TagDef = { key: string; label: string; icon?: string };
export type GroupDef = { key: string; name: string; tags: TagDef[] };
export type SectionDef = { name: string; groups: GroupDef[] };

const STAT_ICON = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' } as const;
const STAT_LABEL = { str: '力量', dex: '敏捷', con: '体质', int: '智力', wis: '感知', cha: '魅力' } as const;

const statTags = (prefix: string): TagDef[] =>
  (Object.keys(STAT_ICON) as (keyof typeof STAT_ICON)[]).map((s) => ({
    key: `${prefix}${s}`,
    label: STAT_LABEL[s],
    icon: STAT_ICON[s],
  }));

export const FILTER_SECTIONS: SectionDef[] = [
  {
    name: '魔物',
    groups: [
      {
        key: 'race', name: '种族', tags: [
          { key: '野兽', label: '野兽', icon: 'beast' },
          { key: '精灵', label: '精灵', icon: 'elf' },
          { key: '亡灵', label: '亡灵', icon: 'undead' },
        ],
      },
      {
        key: 'lv', name: '等级',
        tags: Array.from({ length: 9 }, (_, i) => ({ key: `lv${i + 1}`, label: String(i + 1) })),
      },
    ],
  },
  {
    name: '部件',
    groups: [
      {
        key: 'part', name: '类型', tags: [
          { key: 'part_m', label: 'M', icon: 'm' },
          { key: 'part_s1', label: 'S1', icon: 's1' },
          { key: 'part_s2', label: 'S2', icon: 's2' },
        ],
      },
      {
        key: 'act', name: '动作', tags: [
          { key: 'act_main', label: '主要', icon: 'main' },
          { key: 'act_react', label: '反应', icon: 'reactive' },
          { key: 'act_passive', label: '总是生效' },
        ],
      },
      {
        key: 'bon', name: '加成', tags: [
          ...statTags('bon_'),
          { key: 'bon_mhp', label: '最大生命值', icon: 'MHP' },
          { key: 'bon_ac', label: '护甲', icon: 'AC' },
          { key: 'bon_ini', label: '先攻', icon: 'INI' },
          { key: 'bon_hit', label: '命中', icon: 'attack' },
          { key: 'bon_dc', label: '豁免DC', icon: 'save' },
        ],
      },
      {
        key: 'dmg', name: '伤害类型', tags: [
          { key: 'tag_phy4', label: '物理', icon: 'phy4' },
          { key: 'tag_ele1', label: '火焰', icon: 'ele1' },
          { key: 'tag_ele2', label: '寒冷', icon: 'ele2' },
          { key: 'tag_ele3', label: '闪电', icon: 'ele3' },
          { key: 'tag_ele7', label: '自然', icon: 'ele7' },
          { key: 'tag_mag1', label: '光耀', icon: 'mag1' },
          { key: 'tag_mag2', label: '死灵', icon: 'mag2' },
          { key: 'tag_mag3', label: '力场', icon: 'mag3' },
          { key: 'tag_mag4', label: '心灵', icon: 'mag4' },
          { key: 'tag_heal', label: '治疗', icon: 'heal' },
          { key: 'tag_shield', label: '临时生命值', icon: 'shield' },
        ],
      },
      { key: 'mult', name: '伤害加值', tags: statTags('mult_') },
      { key: 'dc', name: 'DC加值', tags: statTags('dc_') },
      {
        key: 'atk', name: '攻击类型', tags: [
          { key: 'melee', label: '近战', icon: 'melee' },
          { key: 'ranged', label: '远程', icon: 'ranged' },
          { key: 'spell', label: '法术', icon: 'spell' },
          { key: 'AoE', label: '范围', icon: 'AoE' },
        ],
      },
      {
        key: 'roll', name: '检定', tags: [
          { key: 'hit', label: '需要命中', icon: 'attack' },
          { key: 'save', label: '需要豁免', icon: 'save' },
          { key: 'hitnsave', label: '命中+豁免' },
        ],
      },
    ],
  },
];

/** 面板上所有可点的筛选键 */
export const ALL_FILTER_KEYS: string[] = FILTER_SECTIONS.flatMap((s) =>
  s.groups.flatMap((g) => g.tags.map((t) => t.key)),
);

/** 复算一张卡片的所有 data-tags 键（校验用，必须与 src/lib/derive.ts 一致） */
export function cardKeys(
  m: { level: number; race: string },
  parts: {
    slot: string; action?: string;
    bonus?: unknown[]; damage?: { type: string };
    damageStat?: string; save?: { dcStat?: string };
    attackTypes?: string[]; hitStat?: string;
  }[],
): string[] {
  const out = new Set<string>([`lv${m.level}`, m.race]);
  for (const p of parts) {
    if (p.slot !== 'b') out.add(`part_${p.slot}`);
    if (p.action) out.add(`act_${p.action}`);
    for (const b of p.bonus ?? []) {
      if (b && typeof b === 'object' && 'stat' in b) out.add(`bon_${(b as { stat: string }).stat}`);
    }
    if (p.damage) out.add(`tag_${p.damage.type}`);
    if (p.damageStat) out.add(`mult_${p.damageStat}`);
    if (p.save?.dcStat) out.add(`dc_${p.save.dcStat}`);
    for (const t of p.attackTypes ?? []) out.add(t);
    const hit = !!p.hitStat, save = !!p.save;
    if (hit && save) out.add('hitnsave');
    else if (hit) out.add('hit');
    else if (save) out.add('save');
  }
  return [...out];
}
