<script setup lang="ts">
/**
 * 재고 품목 카드 컴포넌트
 * - 단일 품목 정보 표시
 * - 유통기한 상태 배지 표시
 * - 클릭 시 편집 이벤트 발생
 */
import { computed } from 'vue';
import type { FridgeItem } from '../../types/fridge';
import { getDaysUntilExpiry, getStatus } from '../../utils/date';

// 컴포넌트 Props 정의
const props = defineProps<{ item: FridgeItem }>();

// 컴포넌트 이벤트 정의
const emit = defineEmits<{
  (e: 'edit', item: FridgeItem): void;
}>();

// 남은 일수 계산
const days = computed(() => getDaysUntilExpiry(props.item.expiryDate));

// 상태 계산 (normal/soon/expired)
const status = computed(() => getStatus(props.item.expiryDate));

// 상태별 표시 라벨
const statusLabel = computed(() => {
  if (status.value === 'expired') return `${Math.abs(days.value)}일 경과`;
  if (days.value === 0) return '오늘까지';
  return `D-${days.value}`;
});

// 위치별 아이콘
const locationIcon = computed(() => {
  if (props.item.location === '냉장') return '🧊';
  if (props.item.location === '냉동') return '❄';
  return '🌡';
});

/**
 * 카드 클릭 시 편집 이벤트 발생
 * @returns 없음
 */
function onClick(): void {
  emit('edit', props.item);
}
</script>

<template>
  <div class="card" :class="`status-${status}`" @click="onClick">
    <div class="card-left">
      <div class="location-icon">{{ locationIcon }}</div>
    </div>

    <div class="card-main">
      <div class="card-title">
        <span class="name">{{ item.name }}</span>
        <span class="qty">{{ item.quantity }}{{ item.unit }}</span>
      </div>
      <div class="card-meta">
        <span class="location-badge">{{ item.location }}</span>
        <span class="dot">·</span>
        <span class="expiry">{{ item.expiryDate }}</span>
      </div>
      <div v-if="item.memo" class="memo">{{ item.memo }}</div>
    </div>

    <div class="status-badge" :class="`badge-${status}`">
      {{ statusLabel }}
    </div>
  </div>
</template>

<style scoped>
.card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  margin-bottom: 10px;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
  position: relative;
  overflow: hidden;
  transition: transform 0.1s ease, box-shadow 0.15s ease;
}
.card:active { transform: scale(0.98); }
.card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}
.card.status-expired::before { background: var(--color-expired); }
.card.status-soon::before { background: var(--color-soon); }
.card.status-normal::before { background: var(--color-normal); }

.card-left { flex-shrink: 0; }
.location-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  font-size: 22px;
  background: var(--color-border-light);
  border-radius: var(--radius-md);
}
.card.status-expired .location-icon { background: var(--color-expired-bg); }
.card.status-soon .location-icon { background: var(--color-soon-bg); }
.card.status-normal .location-icon { background: var(--color-normal-bg); }

.card-main { flex: 1; min-width: 0; }

.card-title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 3px;
}
.name {
  font-weight: 600;
  font-size: 15px;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: -0.2px;
}
.qty {
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  flex-shrink: 0;
}

.card-meta {
  display: flex;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-muted);
  align-items: center;
}
.location-badge {
  color: var(--color-text-secondary);
  font-weight: 500;
}
.dot { color: var(--color-text-muted); }
.expiry { color: var(--color-text-muted); }

.memo {
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: var(--radius-full);
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: -0.2px;
}
.badge-expired { background: var(--color-expired-bg); color: var(--color-expired); }
.badge-soon { background: var(--color-soon-bg); color: #b45309; }
.badge-normal { background: var(--color-normal-bg); color: #047857; }
</style>
