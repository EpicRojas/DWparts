<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import {
  activeKeys, matchesCard, splitTags, stateToQuery, queryToState, type FilterState,
} from '../lib/filterState';

const state = ref<FilterState>({});
const visible = ref(0);
const total = ref(0);
const activeCount = ref(0);
let root: HTMLElement | null = null;

/**
 * 筛选对象是「带 data-tags 的卡片」，而不是带某个 class 的卡片。
 * data-tags 才是筛选语义的载体；class 会被布局改动影响。
 */
function cards(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-tags]'));
}

function apply() {
  const keys = activeKeys(state.value);
  activeCount.value = keys.length;
  const list = cards();
  total.value = list.length;

  let n = 0;
  for (const el of list) {
    const ok = matchesCard(splitTags(el.dataset.tags), keys);
    if (ok) { el.removeAttribute('hidden'); n++; } else { el.setAttribute('hidden', ''); }
  }
  visible.value = n;

  const url = new URL(location.href);
  const q = stateToQuery(state.value);
  url.search = q ? `?${q}` : '';
  history.replaceState(null, '', url.pathname + url.search + url.hash);
}

function paint() {
  document.querySelectorAll<HTMLElement>('.ft_tag').forEach((t) => {
    const g = t.dataset.group ?? '';
    const k = t.dataset.key ?? null;
    const on = (state.value[g] ?? null) === k;
    t.classList.toggle('ft_tag_on', on);
    t.setAttribute('aria-pressed', String(on));
  });
}

function onClick(ev: Event) {
  const t = (ev.target as HTMLElement | null)?.closest<HTMLElement>('.ft_tag');
  if (!t) return;
  const g = t.dataset.group;
  if (!g) return;
  const k = t.dataset.key ?? null;
  if ((state.value[g] ?? null) === k) return; // 已选中，忽略
  state.value[g] = k;
  paint();
  apply();
}

function clearAll() {
  state.value = {};
  paint();
  apply();
}

onMounted(() => {
  root = document.querySelector('.btable');
  root?.addEventListener('click', onClick as EventListener);
  const groups = Array.from(document.querySelectorAll<HTMLElement>('.ft_tag[data-group]'))
    .map((t) => t.dataset.group!)
    .filter(Boolean);
  state.value = queryToState(location.search, Array.from(new Set(groups)));
  paint();
  apply();
});

onBeforeUnmount(() => root?.removeEventListener('click', onClick as EventListener));
</script>

<template>
  <div class="filter_status">
    <span class="fs_count">{{ visible }} / {{ total }} 张卡片</span>
    <button v-if="activeCount" class="fs_clear" type="button" @click="clearAll">
      清除筛选（{{ activeCount }}）
    </button>
    <span v-if="!visible" class="fs_empty">没有匹配的部件，试试放宽条件。</span>
  </div>
</template>
