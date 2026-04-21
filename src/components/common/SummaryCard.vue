<script setup lang="ts">
/**
 * 상단 요약 카드 컴포넌트
 * - 전체/임박/만료 품목 수 표시
 */
defineProps<{
  total: number;
  soon: number;
  expired: number;
}>();
</script>

<template>
  <div class="summary">
    <div class="cell total">
      <div class="cell-icon">🍱</div>
      <div class="cell-content">
        <div class="value">{{ total }}</div>
        <div class="label">전체</div>
      </div>
    </div>
    <div class="cell warn">
      <div class="cell-icon">⏰</div>
      <div class="cell-content">
        <div class="value">{{ soon }}</div>
        <div class="label">임박</div>
      </div>
    </div>
    <div class="cell danger">
      <div class="cell-icon">🚮</div>
      <div class="cell-content">
        <div class="value">{{ expired }}</div>
        <div class="label">만료</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.cell {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 14px 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
  position: relative;
  overflow: hidden;
}
.cell::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}
.cell.total::before { background: var(--color-primary); }
.cell.warn::before { background: var(--color-soon); }
.cell.danger::before { background: var(--color-expired); }

.cell-icon {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  font-size: 16px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}
.cell.total .cell-icon { background: var(--color-primary-soft); }
.cell.warn .cell-icon { background: var(--color-soon-bg); }
.cell.danger .cell-icon { background: var(--color-expired-bg); }

.cell-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.value {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--color-text);
  letter-spacing: -0.5px;
}
.label {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

@media (max-width: 360px) {
  .cell { padding: 10px 8px; gap: 6px; }
  .cell-icon { width: 28px; height: 28px; font-size: 14px; }
  .value { font-size: 18px; }
}
</style>
