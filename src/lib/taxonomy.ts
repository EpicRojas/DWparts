/** 词表与图标映射。所有 key 都是筛选器 id 的真实取值。 */

export const RACES = ['野兽', '精灵', '亡灵'] as const;
export type Race = (typeof RACES)[number];

export const STATS = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
export type Stat = (typeof STATS)[number];

export const STAT_LABEL: Record<Stat, string> = {
  str: '力量', dex: '敏捷', con: '体质', int: '智力', wis: '感知', cha: '魅力',
};
export const STAT_ICON: Record<Stat, string> = {
  str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA',
};

export const EXTRA_BONUS = ['mhp', 'ac', 'ini', 'hit', 'dc'] as const;
export type ExtraBonus = (typeof EXTRA_BONUS)[number];
export const EXTRA_LABEL: Record<ExtraBonus, string> = {
  mhp: '最大生命值', ac: '护甲等级', ini: '先攻', hit: '命中', dc: '豁免DC',
};
export const EXTRA_ICON: Record<ExtraBonus, string> = {
  mhp: 'MHP', ac: 'AC', ini: 'INI', hit: 'attack', dc: 'save',
};

export const DAMAGE_TYPES = [
  'phy1', 'phy2', 'phy3', 'phy4',
  'ele1', 'ele2', 'ele3', 'ele4', 'ele5', 'ele6', 'ele7',
  'mag1', 'mag2', 'mag3', 'mag4',
  'heal', 'shield',
] as const;
export type DamageType = (typeof DAMAGE_TYPES)[number];

export const DAMAGE_LABEL: Record<DamageType, string> = {
  phy1: '挥砍', phy2: '穿刺', phy3: '钝击', phy4: '物理',
  ele1: '火焰', ele2: '寒冷', ele3: '闪电', ele4: '雷鸣', ele5: '强酸', ele6: '毒素', ele7: '自然',
  mag1: '光耀', mag2: '死灵', mag3: '力场', mag4: '心灵',
  heal: '治疗', shield: '临时生命值',
};

export const ACTIONS = ['main', 'react', 'passive'] as const;
export type Action = (typeof ACTIONS)[number];
export const ACTION_LABEL: Record<Action, string> = {
  main: '主要', react: '反应', passive: '总是生效',
};
export const ACTION_ICON: Partial<Record<Action, string>> = {
  main: 'main', react: 'reactive',
};

export const ATTACK_TYPES = ['melee', 'ranged', 'spell', 'AoE'] as const;
export type AttackType = (typeof ATTACK_TYPES)[number];
export const ATTACK_LABEL: Record<AttackType, string> = {
  melee: '近战', ranged: '远程', spell: '法术', AoE: '范围',
};
export const ATTACK_ICON: Record<AttackType, string> = {
  melee: 'melee', ranged: 'ranged', spell: 'spell', AoE: 'AoE',
};

export const ROLLS = ['hit', 'save', 'hitnsave'] as const;
export type Roll = (typeof ROLLS)[number];

export const SLOTS = ['b', 'm', 's1', 's2'] as const;
export type Slot = (typeof SLOTS)[number];
export const SLOT_LABEL: Record<Slot, string> = {
  b: '种族特性', m: '主要动作', s1: '潜质 1', s2: '潜质 2',
};

/** img/common 下真实存在、可用于内联标记的图标。缺失项故意留空，渲染时退化成色块。 */
export const AVAILABLE_ICONS = new Set([
  'phy4', 'ele1', 'ele2', 'ele3', 'ele7',
  'mag1', 'mag2', 'mag3', 'mag4', 'heal', 'shield',
  'STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA', 'MHP', 'AC', 'INI',
  'attack', 'save', 'main', 'reactive', 'melee', 'ranged', 'spell', 'AoE', 'dice', 'Dom',
]);

export const TEXT_COLORS = new Set([
  'pink', 'blue', 'lb', 'lgreen', 'orange', 'green', 'red', 'cur', 'comm', 'rare', 'epic', 'lege',
]);
