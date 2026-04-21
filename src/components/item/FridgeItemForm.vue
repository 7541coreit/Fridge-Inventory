<script setup lang="ts">
/**
 * 재고 품목 등록/수정 폼 컴포넌트
 * - item prop이 있으면 수정 모드, 없으면 신규 등록 모드
 * - 저장/취소/삭제 이벤트 발생
 */
import { ref, watch } from 'vue';
import type { FridgeItem, FridgeLocation } from '../../types/fridge';
import { getTodayString } from '../../utils/date';

// 컴포넌트 Props 정의
const props = defineProps<{
  item?: FridgeItem | null;
}>();

// 컴포넌트 이벤트 정의
const emit = defineEmits<{
  (e: 'save', data: Omit<FridgeItem, 'id' | 'createdAt' | 'updatedAt'>): void;
  (e: 'cancel'): void;
  (e: 'delete', id: string): void;
}>();

// 보관 위치 선택지
const locations: FridgeLocation[] = ['냉장', '냉동', '실온'];

// 입력 폼 상태
const name = ref('');
const quantity = ref<number>(1);
const unit = ref('개');
const location = ref<FridgeLocation>('냉장');
const expiryDate = ref<string>(getTodayString());
const memo = ref<string>('');

// 오류 메시지 상태
const error = ref<string>('');

/**
 * 입력 폼을 item 값으로 초기화한다.
 * @returns 없음
 */
function resetForm(): void {
  if (props.item) {
    name.value = props.item.name;
    quantity.value = props.item.quantity;
    unit.value = props.item.unit;
    location.value = props.item.location;
    expiryDate.value = props.item.expiryDate;
    memo.value = props.item.memo ?? '';
  } else {
    name.value = '';
    quantity.value = 1;
    unit.value = '개';
    location.value = '냉장';
    expiryDate.value = getTodayString();
    memo.value = '';
  }
  error.value = '';
}

watch(() => props.item, resetForm, { immediate: true });

/**
 * 저장 버튼 처리. 필수값 검증 후 save 이벤트 발생.
 * @returns 없음
 */
function onSave(): void {
  const trimmedName = name.value.trim();
  if (!trimmedName) {
    error.value = '품목명을 입력해 주세요.';
    return;
  }
  if (!Number.isFinite(quantity.value) || quantity.value <= 0) {
    error.value = '수량은 1 이상이어야 합니다.';
    return;
  }
  if (!expiryDate.value) {
    error.value = '유통기한을 선택해 주세요.';
    return;
  }

  emit('save', {
    name: trimmedName,
    quantity: quantity.value,
    unit: unit.value.trim() || '개',
    location: location.value,
    expiryDate: expiryDate.value,
    memo: memo.value.trim() || undefined
  });
}

/**
 * 삭제 버튼 처리. 확인 후 delete 이벤트 발생.
 * @returns 없음
 */
function onDelete(): void {
  if (!props.item) return;
  if (!window.confirm('삭제하시겠습니까?')) return;
  emit('delete', props.item.id);
}
</script>

<template>
  <div class="form-wrap">
    <div class="drag-handle"></div>

    <div class="form-header">
      <h2>{{ props.item ? '품목 수정' : '품목 등록' }}</h2>
      <button type="button" class="close-btn" @click="emit('cancel')" aria-label="닫기">×</button>
    </div>

    <div class="form-body">
      <label class="field">
        <span class="field-label">품목명</span>
        <input v-model="name" type="text" placeholder="예: 우유" maxlength="30" />
      </label>

      <div class="row">
        <label class="field">
          <span class="field-label">수량</span>
          <input v-model.number="quantity" type="number" min="1" step="1" />
        </label>
        <label class="field">
          <span class="field-label">단위</span>
          <input v-model="unit" type="text" maxlength="5" placeholder="개" />
        </label>
      </div>

      <div class="field">
        <span class="field-label">보관 위치</span>
        <div class="seg">
          <button
            v-for="loc in locations"
            :key="loc"
            type="button"
            class="seg-btn"
            :class="{ active: location === loc }"
            @click="location = loc"
          >
            {{ loc }}
          </button>
        </div>
      </div>

      <label class="field">
        <span class="field-label">유통기한</span>
        <input v-model="expiryDate" type="date" />
      </label>

      <label class="field">
        <span class="field-label">메모 <span class="optional">(선택)</span></span>
        <textarea v-model="memo" rows="2" maxlength="100" placeholder="예: 저지방, 개봉 후 3일 이내" />
      </label>

      <p v-if="error" class="error">{{ error }}</p>
    </div>

    <div class="actions">
      <button
        v-if="props.item"
        type="button"
        class="btn btn-delete"
        @click="onDelete"
      >
        삭제
      </button>
      <button type="button" class="btn btn-save" @click="onSave">
        {{ props.item ? '수정 완료' : '등록하기' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.form-wrap {
  padding: 0 20px 20px;
  position: relative;
}

.drag-handle {
  width: 36px;
  height: 4px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  margin: 10px auto 8px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0 20px;
}
h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.3px;
}
.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--color-border-light);
  color: var(--color-text-secondary);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  display: grid;
  place-items: center;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: block;
}
.field-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 8px;
}
.optional {
  color: var(--color-text-muted);
  font-weight: 400;
  font-size: 12px;
}

.field input[type='text'],
.field input[type='number'],
.field input[type='date'],
.field textarea {
  width: 100%;
  padding: 13px 14px;
  font-size: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-sizing: border-box;
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field input:focus,
.field textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}
.field textarea {
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
}

.row { display: flex; gap: 10px; }
.row .field { flex: 1; }

.seg {
  display: flex;
  gap: 6px;
  background: var(--color-bg);
  padding: 4px;
  border-radius: var(--radius-md);
}
.seg-btn {
  flex: 1;
  min-height: 44px;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: background-color 0.15s, color 0.15s, box-shadow 0.15s;
}
.seg-btn.active {
  background: var(--color-surface);
  color: var(--color-primary);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}

.error {
  color: var(--color-expired);
  font-size: 13px;
  margin: 0;
  padding: 10px 12px;
  background: var(--color-expired-bg);
  border-radius: var(--radius-sm);
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}
.btn {
  flex: 1;
  min-height: 52px;
  border-radius: var(--radius-md);
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: -0.2px;
}
.btn-save {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #fff;
  flex: 2;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
}
.btn-delete {
  background: var(--color-expired-bg);
  color: var(--color-expired);
}
</style>
