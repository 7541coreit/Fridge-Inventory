<script setup lang="ts">
/**
 * 필터 탭 컴포넌트
 * - 주어진 선택지 중 하나를 선택
 * - v-model로 현재 값 양방향 바인딩
 */
defineProps<{
  options: { value: string; label: string }[];
  modelValue: string;
}>();

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>

<template>
  <div class="tabs hide-scrollbar" role="tablist">
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      role="tab"
      :aria-selected="modelValue === opt.value"
      class="tab"
      :class="{ active: modelValue === opt.value }"
      @click="$emit('update:modelValue', opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 2px;
  background: var(--color-surface);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
}
.tab {
  flex: 1 0 auto;
  min-height: 36px;
  padding: 0 16px;
  border: none;
  background: transparent;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  color: var(--color-text-secondary);
  transition: background-color 0.15s, color 0.15s;
}
.tab.active {
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(79, 70, 229, 0.3);
}
</style>
