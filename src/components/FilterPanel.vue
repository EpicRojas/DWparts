<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';

type State = Record<string, string | null>;

const state = ref<State>({});
const visible = ref(0);
const total = ref(0);
const activeCount = ref(0);
let root: HTMLElement | null = null;

function cards(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('.ft_list'));
}

function apply() {
  const keys = Object.values(state.value).filter((k): k is string => !!k);
  activeCount.value = keys.length;
  const list = cards();
  total.value = list.length;
  if (!keys.length) {
    list.forEach((el) => el.removeAttribute('hidden'));
    visible.value = list.length;
  } else {
    const sel = keys.map((k) => `[data-tags~="${CSS.escape(k)}"]`).join('');
    let n = 0;
    list.forEach((el) => {
      const ok = el.matches(sel);
      if (ok) { el.removeAttribute('hidden'); n++; } else { el.setAttribute('hidden', ''); }
    });
    visible.value = n;
  }
  const url = new URL(location.href);
  url.search = '';
  for (const [g, k] of Object.entries(state.value)) if (k) url.searchParams.set(g, k);
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
  const q = new URLSearchParams(location.search);
  for (const [g, k] of q) state.value[g] = k;
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
