const BASE = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : import.meta.env.BASE_URL + '/';

/** /img/common/<file>.webp —— 构建期由 scripts/build-images.ts 生成 */
export const iconUrl = (file: string) => `${BASE}img/common/${file}.webp`;
/** /img/characters/<id>.webp */
export const charUrl = (id: string) => `${BASE}img/characters/${id}.webp`;
