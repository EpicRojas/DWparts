/** 给 filterKeys.ts 的纯定义补上图片 URL，供渲染使用。 */
import { FILTER_SECTIONS, ALL_FILTER_KEYS, type TagDef, type GroupDef, type SectionDef } from './filterKeys';
import { iconUrl } from './paths';

export type FilterTag = TagDef & { iconUrl?: string };
export type FilterGroup = Omit<GroupDef, 'tags'> & { tags: FilterTag[] };
export type FilterSection = Omit<SectionDef, 'groups'> & { groups: FilterGroup[] };

export const SECTIONS: FilterSection[] = FILTER_SECTIONS.map((s) => ({
  ...s,
  groups: s.groups.map((g) => ({
    ...g,
    tags: g.tags.map((t) => ({ ...t, iconUrl: t.icon ? iconUrl(t.icon) : undefined })),
  })),
}));

export { ALL_FILTER_KEYS };
