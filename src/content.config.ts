import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import {
  RACES, STATS, DAMAGE_TYPES, ACTIONS, ATTACK_TYPES, ROLLS, SLOTS,
} from './lib/taxonomy';

const stat = z.enum(STATS);
const damageType = z.enum(DAMAGE_TYPES);

const bonusEntry = z.union([
  // 属性加成 → 自动生成 `bon_*` 筛选类与「力量+1」文案
  z.object({ stat: stat.or(z.enum(['mhp', 'ac', 'ini', 'hit', 'dc'])), amount: z.number().int() }),
  // 抗性 / 免疫：只影响展示，不参与筛选
  z.object({ resist: damageType }),
  z.object({ immune: damageType }),
  // 兜底自由文案（仍用内联标记）
  z.object({ text: z.string() }),
]);

const damage = z.object({
  dice: z.string().regex(/^\d+d\d+([+-]\d+)?$/, '骰子写法应为 1d8 / 2d6+1'),
  type: damageType,
  stat: stat,
});

const save = z.object({
  stat: stat,
  dc: z.number().int().positive(),
  dcStat: stat.optional(),
});

const effect = z.object({
  name: z.string(),
  text: z.string(),
});

const ability = z.object({
  name: z.string(),
  action: z.enum(ACTIONS).optional(),
  /** 触发条件 / 用途说明，如「友军受到攻击时作为反应」 */
  text: z.string().default(''),
  damage: damage.optional(),
  bonus: z.array(bonusEntry).default([]),
  damageStat: stat.optional(),
  dcStat: stat.optional(),
  attackTypes: z.array(z.enum(ATTACK_TYPES)).default([]),
  hitStat: stat.optional(),
  save: save.optional(),
  effects: z.array(effect).default([]),
});

const part = ability.extend({
  slot: z.enum(SLOTS),
});

const monsters = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/monsters' }),
  schema: z.object({
    id: z.string().regex(/^(BST|ELM|UDD)\d{3}$/, 'id 必须是 BST/ELM/UDD + 三位数字'),
    name: z.string(),
    race: z.enum(RACES),
    level: z.number().int().min(1).max(9),
    dominance: z.number().int().min(0).default(1),
    stats: z.object({
      str: z.number(), dex: z.number(), con: z.number(),
      int: z.number(), wis: z.number(), cha: z.number(),
    }),
    statAdvantage: stat.optional(),
    hp: z.number().int().positive(),
    ac: z.number().int().positive(),
    basic: ability,
    parts: z.array(part).length(4, '每只怪固定 b/m/s1/s2 共 4 个部件'),
  }),
});

export const collections = { monsters };
