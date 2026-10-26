/**
 * assets/raw/**\/*.png → public/img/**\/*.webp
 *
 * 用 cwebp 而非 sharp：像素画必须无损，cwebp -z 9 是当前最强的无损 WebP 编码，
 * 且与旧站点产出的文件字节级一致，零视觉回归风险。
 *
 * 用法：
 *   tsx scripts/build-images.ts           # 只转新增/变更
 *   tsx scripts/build-images.ts --force   # 全量重转
 *   tsx scripts/build-images.ts --prune   # 删除无源产物的 webp
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const RAW = path.join(ROOT, 'assets/raw');
const OUT = path.join(ROOT, 'public/img');
const CACHE = path.join(ROOT, '.cache/images.json');

const force = process.argv.includes('--force');
const prune = process.argv.includes('--prune');

if (!fs.existsSync(RAW)) {
  console.error(`缺少源目录：${RAW}`);
  process.exit(1);
}
try {
  execFileSync('cwebp', ['-version'], { stdio: 'ignore' });
} catch {
  console.error('未找到 cwebp，请先安装 webp 包（Debian: apt install webp）');
  process.exit(1);
}

type Cache = Record<string, { hash: string; out: string }>;
const cache: Cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};
const next: Cache = {};

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : e.name.endsWith('.png') ? [p] : [];
  });
}

const sources = walk(RAW);
let converted = 0;
let skipped = 0;

for (const src of sources) {
  const rel = path.relative(RAW, src).replace(/\.png$/, '.webp');
  const out = path.join(OUT, rel);
  const hash = createHash('sha1').update(fs.readFileSync(src)).digest('hex');
  next[src] = { hash, out: rel };

  const upToDate =
    !force && fs.existsSync(out) && cache[src]?.hash === hash;
  if (upToDate) {
    skipped++;
    continue;
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  execFileSync('cwebp', ['-quiet', '-lossless', '-z', '9', '-metadata', 'none', src, '-o', out]);
  converted++;
}

let pruned = 0;
if (prune) {
  for (const webp of walkOut()) {
    const rel = path.relative(OUT, webp);
    if (!fs.existsSync(path.join(RAW, rel.replace(/\.webp$/, '.png')))) {
      fs.rmSync(webp);
      console.log(`pruned ${rel}`);
      pruned++;
    }
  }
  function walkOut(): string[] {
    if (!fs.existsSync(OUT)) return [];
    return fs.readdirSync(OUT, { withFileTypes: true }).flatMap((e) => {
      const p = path.join(OUT, e.name);
      return e.isDirectory() ? walkOut() : e.name.endsWith('.webp') ? [p] : [];
    });
  }
}

fs.mkdirSync(path.dirname(CACHE), { recursive: true });
fs.writeFileSync(CACHE, JSON.stringify(next, null, 0));

// 生成 icon 清单，供构建期校验「文本引用了但图标不存在」
const available = {
  common: fs.existsSync(path.join(OUT, 'common'))
    ? fs.readdirSync(path.join(OUT, 'common')).filter((f) => f.endsWith('.webp')).map((f) => path.basename(f, '.webp')).sort()
    : [],
  characters: fs.existsSync(path.join(OUT, 'characters'))
    ? fs.readdirSync(path.join(OUT, 'characters')).filter((f) => f.endsWith('.webp')).map((f) => path.basename(f, '.webp')).sort()
    : [],
};
fs.writeFileSync(path.join(ROOT, '.cache/assets.json'), JSON.stringify(available, null, 2));

console.log(`converted: ${converted}  skipped: ${skipped}  pruned: ${pruned}`);
console.log(`common: ${available.common.length}  characters: ${available.characters.length}`);
