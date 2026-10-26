/** 由结构化数据推导筛选类与标签区，杜绝手写 class 的漂移。 */
import {
  ACTION_LABEL, ACTION_ICON, ATTACK_LABEL, ATTACK_ICON,
  STAT_LABEL, type Action, type AttackType, type Stat,
} from './taxonomy';

export type BonusEntry =
  | { stat: string; amount: number }
  | { resist: string }
  | { immune: string }
  | { text: string };

export type Damage = { dice: string; type: string; stat: Stat };

export type Ability = {
  name: string;
  action?: Action;
  text: string;
  damage?: Damage;
  bonus: BonusEntry[];
  damageStat?: Stat;
  dcStat?: Stat;
  attackTypes: AttackType[];
  hitStat?: Stat;
  save?: { stat: Stat; dc: number; dcStat?: Stat };
  effects: { name: string; text: string }[];
};

/** 「命中/豁免」派生出 hit / save / hitnsave */
export function rollIds(a: Ability): string[] {
  const hit = !!a.hitStat;
  const save = !!a.save;
  if (hit && save) return ['hitnsave'];
  if (hit) return ['hit'];
  if (save) return ['save'];
  return [];
}

/** 一张部件卡的完整筛选类（不含 lv/race） */
export function abilityTagIds(a: Ability): string[] {
  const out: string[] = [];
  if (a.action) out.push(`act_${a.action}`);
  for (const b of a.bonus) if ('stat' in b) out.push(`bon_${b.stat}`);
  if (a.damage) out.push(`tag_${a.damage.type}`);
  if (a.damageStat) out.push(`mult_${a.damageStat}`);
  if (a.save?.dcStat) out.push(`dc_${a.save.dcStat}`);
  out.push(...a.attackTypes);
  out.push(...rollIds(a));
  return [...new Set(out)];
}

/** 展示用标签行：动作 / 加值 / 攻击类型 / 命中检定 / 豁免检定 */
export type TagRow = { label: string; icon?: string; parts: { icon?: string; text: string }[] };

export function tagRows(a: Ability): TagRow[] {
  const rows: TagRow[] = [];
  if (a.action) {
    rows.push({
      label: '动作',
      parts: [{ icon: ACTION_ICON[a.action], text: ACTION_LABEL[a.action] }],
    });
  }
  if (a.damageStat) {
    rows.push({
      label: '加值',
      parts: [{ icon: STAT_LABEL[a.damageStat] && iconOfStat(a.damageStat), text: `基于${STAT_LABEL[a.damageStat]}` }],
    });
  }
  if (a.attackTypes.length) {
    rows.push({
      label: '攻击类型',
      parts: a.attackTypes.map((t) => ({ icon: ATTACK_ICON[t], text: ATTACK_LABEL[t] })),
    });
  }
  if (a.hitStat) {
    rows.push({ label: '命中检定', icon: 'attack', parts: [{ text: STAT_LABEL[a.hitStat] }] });
  }
  if (a.save) {
    const parts: { icon?: string; text: string }[] = [
      { text: `${STAT_LABEL[a.save.stat]} / DC ${a.save.dc}` },
    ];
    if (a.save.dcStat) parts.push({ icon: iconOfStat(a.save.dcStat), text: '' });
    rows.push({ label: '豁免检定', icon: 'save', parts });
  }
  return rows;
}

function iconOfStat(s: Stat): string {
  const m: Record<Stat, string> = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };
  return m[s];
}

/** 卡片 DOM 类 */
export function cardClasses(monster: { level: number; race: string }, a?: Ability): string {
  const ids = [`lv${monster.level}`, monster.race, ...(a ? abilityTagIds(a) : [])];
  return `ft_list ${[...new Set(ids)].join(' ')}`;
}
/**
 * data-tags：卡片的所有可筛选键，空格分隔。
 * 部件卡额外带 `part_m` / `part_s1` / `part_s2`（种族特性 b 不参与类型筛选）。
 */
export function dataTags(
  monster: { level: number; race: string },
  a?: Ability,
  slot?: 'b' | 'm' | 's1' | 's2',
): string {
  const ids = [`lv${monster.level}`, monster.race, ...(a ? abilityTagIds(a) : [])];
  if (slot && slot !== 'b') ids.push(`part_${slot}`);
  return [...new Set(ids)].join(' ');
}

import { DAMAGE_LABEL, STAT_LABEL as SL, EXTRA_LABEL as EL } from './taxonomy';

/** 加成条目 → 内联标记字符串 */
export function bonusLine(b: BonusEntry): string {
  if ('stat' in b) {
    const label = b.stat === 'dc' ? '法术豁免难度' : ((SL as any)[b.stat] ?? (EL as any)[b.stat] ?? b.stat);
    return `${label}+${b.amount}`;
  }
  if ('resist' in b) return `抵抗{${b.resist}|${(DAMAGE_LABEL as any)[b.resist] ?? b.resist}伤害}`;
  if ('immune' in b) return `免疫${(DAMAGE_LABEL as any)[b.immune] ?? b.immune}`;
  return b.text;
}
