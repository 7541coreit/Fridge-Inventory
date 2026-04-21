<script setup lang="ts">
/**
 * 메인 화면 View
 * - 요약/검색/필터/목록/등록 버튼
 * - 등록/수정 모달 관리
 * - JSON Import/Export 메뉴 관리
 */
import { computed, ref } from 'vue';
import SummaryCard from '../components/common/SummaryCard.vue';
import FilterTabs from '../components/common/FilterTabs.vue';
import FridgeItemCard from '../components/item/FridgeItemCard.vue';
import FridgeItemForm from '../components/item/FridgeItemForm.vue';
import { useFridgeItems } from '../composables/useFridgeItems';
import { useJsonExport } from '../composables/useJsonExport';
import { useJsonImport } from '../composables/useJsonImport';
import type { FridgeItem } from '../types/fridge';
import { getDaysUntilExpiry, getStatus } from '../utils/date';

const { items, addItem, updateItem, removeItem, replaceAll, clearAll } = useFridgeItems();
const { exportJson } = useJsonExport();
const { importJson } = useJsonImport();

// 필터 상태
const keyword = ref('');
const locationFilter = ref<'all' | '냉장' | '냉동' | '실온'>('all');
const statusFilter = ref<'all' | 'normal' | 'soon' | 'expired'>('all');

// 화면 모드
const showForm = ref(false);
const editingItem = ref<FridgeItem | null>(null);
const showMenu = ref(false);

// 파일 input 참조
const fileInputRef = ref<HTMLInputElement | null>(null);

const locationOptions = [
  { value: 'all', label: '전체' },
  { value: '냉장', label: '냉장' },
  { value: '냉동', label: '냉동' },
  { value: '실온', label: '실온' }
];

const statusOptions = [
  { value: 'all', label: '전체' },
  { value: 'soon', label: '임박' },
  { value: 'expired', label: '만료' },
  { value: 'normal', label: '정상' }
];

// 필터 적용된 품목 목록 (유통기한 오름차순)
const filteredItems = computed<FridgeItem[]>(() => {
  const kw = keyword.value.trim().toLowerCase();
  return items.value
    .filter((it) => {
      if (locationFilter.value !== 'all' && it.location !== locationFilter.value) return false;
      if (statusFilter.value !== 'all' && getStatus(it.expiryDate) !== statusFilter.value) return false;
      if (kw && !it.name.toLowerCase().includes(kw)) return false;
      return true;
    })
    .slice()
    .sort((a, b) => getDaysUntilExpiry(a.expiryDate) - getDaysUntilExpiry(b.expiryDate));
});

// 요약 카운트
const summary = computed(() => {
  let soon = 0;
  let expired = 0;
  for (const it of items.value) {
    const s = getStatus(it.expiryDate);
    if (s === 'soon') soon += 1;
    else if (s === 'expired') expired += 1;
  }
  return { total: items.value.length, soon, expired };
});

/**
 * 등록 버튼 클릭. 신규 폼을 연다.
 * @returns 없음
 */
function onClickAdd(): void {
  editingItem.value = null;
  showForm.value = true;
}

/**
 * 카드 클릭. 수정 폼을 연다.
 * @param item 수정 대상 품목
 * @returns 없음
 */
function onEdit(item: FridgeItem): void {
  editingItem.value = item;
  showForm.value = true;
}

/**
 * 폼 저장. 수정 모드이면 update, 아니면 add 처리.
 * @param data 폼에서 입력된 데이터
 * @returns 없음
 */
function onSave(data: Omit<FridgeItem, 'id' | 'createdAt' | 'updatedAt'>): void {
  if (editingItem.value) {
    if (!window.confirm('수정하시겠습니까?')) return;
    updateItem(editingItem.value.id, data);
  } else {
    if (!window.confirm('등록하시겠습니까?')) return;
    addItem(data);
  }
  closeForm();
}

/**
 * 폼 삭제. 대상 품목을 제거.
 * @param id 삭제할 품목 ID
 * @returns 없음
 */
function onDelete(id: string): void {
  removeItem(id);
  closeForm();
}

/**
 * 폼을 닫는다.
 * @returns 없음
 */
function closeForm(): void {
  showForm.value = false;
  editingItem.value = null;
}

/**
 * JSON 내보내기 처리
 * @returns 없음
 */
function onExport(): void {
  if (items.value.length === 0) {
    window.alert('내보낼 데이터가 없습니다.');
    return;
  }
  exportJson(items.value);
  showMenu.value = false;
}

/**
 * JSON 불러오기 버튼 처리. 파일 선택 다이얼로그를 연다.
 * @returns 없음
 */
function onClickImport(): void {
  fileInputRef.value?.click();
}

/**
 * 파일 선택 변경 이벤트. 파일을 읽고 검증 후 적용.
 * @param e input change 이벤트
 * @returns 없음
 */
async function onFileChange(e: Event): Promise<void> {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const imported = await importJson(file);
    if (items.value.length > 0) {
      if (!window.confirm('기존 데이터를 덮어씁니다. 진행할까요?')) {
        input.value = '';
        return;
      }
    }
    replaceAll(imported);
    window.alert(`${imported.length}건을 불러왔습니다.`);
    showMenu.value = false;
  } catch (err) {
    const msg = err instanceof Error ? err.message : '불러오기에 실패했습니다.';
    window.alert(`불러오기 실패: ${msg}`);
  } finally {
    input.value = '';
  }
}

/**
 * 전체 삭제 처리
 * @returns 없음
 */
function onClearAll(): void {
  if (items.value.length === 0) return;
  if (!window.confirm('전체 품목을 삭제하시겠습니까?')) return;
  clearAll();
  showMenu.value = false;
}
</script>

<template>
  <div class="home">
    <header class="header">
      <div class="header-top">
        <div class="brand">
          <div class="brand-icon">❄</div>
          <div class="brand-text">
            <h1>냉장고 재고</h1>
            <p class="brand-sub">오늘도 신선하게</p>
          </div>
        </div>
        <button class="menu-btn" type="button" @click="showMenu = !showMenu" aria-label="메뉴">
          <span class="dots">⋮</span>
        </button>
      </div>

      <div v-if="showMenu" class="menu-backdrop" @click="showMenu = false"></div>
      <div v-if="showMenu" class="menu-dropdown">
        <button type="button" class="menu-item" @click="onExport">
          <span class="menu-ico">⬇</span>JSON 내보내기
        </button>
        <button type="button" class="menu-item" @click="onClickImport">
          <span class="menu-ico">⬆</span>JSON 불러오기
        </button>
        <div class="menu-divider"></div>
        <button type="button" class="menu-item danger" @click="onClearAll">
          <span class="menu-ico">🗑</span>전체 삭제
        </button>
      </div>
      <input
        ref="fileInputRef"
        type="file"
        accept="application/json,.json"
        hidden
        @change="onFileChange"
      />
    </header>

    <main class="main">
      <SummaryCard :total="summary.total" :soon="summary.soon" :expired="summary.expired" />

      <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input
          v-model="keyword"
          type="search"
          class="search"
          placeholder="품목명 검색"
        />
      </div>

      <div class="filter-group">
        <FilterTabs v-model="locationFilter" :options="locationOptions" />
        <FilterTabs v-model="statusFilter" :options="statusOptions" />
      </div>

      <div class="list">
        <div v-if="filteredItems.length === 0" class="empty">
          <div class="empty-icon">{{ items.length === 0 ? '📦' : '🔎' }}</div>
          <p class="empty-text">
            {{ items.length === 0 ? '등록된 품목이 없습니다' : '조건에 맞는 품목이 없어요' }}
          </p>
          <p class="empty-sub">
            {{ items.length === 0 ? '우측 하단의 + 버튼으로 등록하세요' : '검색어나 필터를 바꿔 보세요' }}
          </p>
        </div>
        <FridgeItemCard
          v-for="it in filteredItems"
          :key="it.id"
          :item="it"
          @edit="onEdit"
        />
      </div>
    </main>

    <button class="fab" type="button" @click="onClickAdd" aria-label="품목 등록">
      <span class="fab-plus">＋</span>
    </button>

    <div v-if="showForm" class="modal" @click.self="closeForm">
      <div class="modal-panel">
        <FridgeItemForm
          :item="editingItem"
          @save="onSave"
          @cancel="closeForm"
          @delete="onDelete"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--color-bg);
  position: relative;
}

/* 헤더 */
.header {
  position: sticky;
  top: 0;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  padding: calc(var(--safe-top) + 16px) 20px 20px;
  z-index: 10;
  color: #fff;
  box-shadow: var(--shadow-md);
}
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.brand-icon {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  font-size: 22px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-md);
  backdrop-filter: blur(8px);
}
.brand-text h1 {
  font-size: 18px;
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.3px;
}
.brand-sub {
  font-size: 12px;
  margin: 2px 0 0;
  opacity: 0.85;
}

.menu-btn {
  border: none;
  background: rgba(255, 255, 255, 0.15);
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: #fff;
  display: grid;
  place-items: center;
}
.dots { font-size: 22px; line-height: 1; font-weight: 700; }

.menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 19;
  animation: fade-in 0.15s ease;
}
.menu-dropdown {
  position: absolute;
  top: calc(var(--safe-top) + 68px);
  right: 16px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 20;
  min-width: 200px;
  padding: 6px;
  animation: fade-in 0.15s ease;
}
.menu-item {
  background: transparent;
  border: none;
  text-align: left;
  padding: 12px 14px;
  font-size: 14px;
  cursor: pointer;
  color: var(--color-text);
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: var(--radius-sm);
}
.menu-item:active { background: var(--color-border-light); }
.menu-item.danger { color: var(--color-expired); }
.menu-ico { font-size: 14px; width: 18px; text-align: center; }
.menu-divider {
  height: 1px;
  background: var(--color-border);
  margin: 4px 8px;
}

/* 메인 */
.main { flex: 1; padding: 16px 16px calc(var(--safe-bottom) + 100px); }

/* 검색 */
.search-wrap {
  position: relative;
  margin: 14px 0 12px;
}
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  pointer-events: none;
  opacity: 0.5;
}
.search {
  width: 100%;
  padding: 13px 14px 13px 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 15px;
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.search:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

/* 목록 */
.list { margin-top: 4px; }
.empty {
  text-align: center;
  padding: 60px 20px;
}
.empty-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.7; }
.empty-text {
  font-size: 15px;
  color: var(--color-text);
  font-weight: 600;
  margin: 0 0 6px;
}
.empty-sub {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
}

/* FAB */
.fab {
  position: fixed;
  right: 20px;
  bottom: calc(var(--safe-bottom) + 20px);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #fff;
  box-shadow: var(--shadow-fab);
  cursor: pointer;
  z-index: 5;
  display: grid;
  place-items: center;
}
.fab-plus {
  font-size: 28px;
  line-height: 1;
  font-weight: 300;
  margin-top: -2px;
}

/* 모달 */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.55);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 50;
  animation: fade-in 0.2s ease;
  backdrop-filter: blur(2px);
}
.modal-panel {
  background: var(--color-surface);
  width: 100%;
  max-width: 640px;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  max-height: 92vh;
  overflow-y: auto;
  padding-bottom: var(--safe-bottom);
  animation: slide-up 0.25s cubic-bezier(0.2, 0.9, 0.3, 1);
}

@media (min-width: 600px) {
  .modal { align-items: center; padding: 20px; }
  .modal-panel { border-radius: var(--radius-xl); }
}
</style>
