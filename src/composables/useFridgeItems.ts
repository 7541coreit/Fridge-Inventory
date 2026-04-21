/**
 * 재고 품목 상태 관리 composable
 * - 메모리 내 items 배열 관리
 * - localStorage 자동 저장 (변경 감지 시)
 * - 앱 시작 시 자동 복원
 */

import { ref, watch } from 'vue';
import type { FridgeItem } from '../types/fridge';
import { generateId } from '../utils/file';

// localStorage 저장 키
const STORAGE_KEY = 'fridge-app:items:v1';

// 전역 단일 상태 (모듈 스코프 공유)
const items = ref<FridgeItem[]>([]);
let initialized = false;

/**
 * localStorage에서 저장된 items를 로드한다.
 * 파싱 실패 시 빈 배열로 초기화한다.
 * @returns 없음
 */
function loadFromStorage(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      items.value = parsed;
    }
  } catch {
    // 손상된 데이터는 무시하고 빈 상태 유지
    items.value = [];
  }
}

/**
 * 현재 items를 localStorage에 저장한다.
 * @returns 없음
 */
function saveToStorage(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value));
  } catch {
    // 저장 실패는 조용히 무시 (할당량 초과 등)
  }
}

/**
 * 재고 품목 composable.
 * 최초 호출 시 localStorage 복원과 자동 저장 watcher를 등록한다.
 * @returns 상태 및 CRUD 함수
 */
export function useFridgeItems() {
  if (!initialized) {
    loadFromStorage();
    // deep watch로 배열 내부 속성 변경까지 감지
    watch(items, saveToStorage, { deep: true });
    initialized = true;
  }

  /**
   * 신규 품목을 추가한다.
   * @param input id, createdAt, updatedAt을 제외한 품목 정보
   * @returns 생성된 품목
   */
  function addItem(input: Omit<FridgeItem, 'id' | 'createdAt' | 'updatedAt'>): FridgeItem {
    const now = new Date().toISOString();
    const item: FridgeItem = {
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    items.value.push(item);
    return item;
  }

  /**
   * 기존 품목을 수정한다.
   * @param id 수정 대상 품목 ID
   * @param patch 변경할 필드
   * @returns 수정 성공 여부
   */
  function updateItem(id: string, patch: Partial<Omit<FridgeItem, 'id' | 'createdAt'>>): boolean {
    const idx = items.value.findIndex((it) => it.id === id);
    if (idx < 0) return false;
    items.value[idx] = {
      ...items.value[idx],
      ...patch,
      updatedAt: new Date().toISOString()
    };
    return true;
  }

  /**
   * 품목을 삭제한다.
   * @param id 삭제 대상 품목 ID
   * @returns 삭제 성공 여부
   */
  function removeItem(id: string): boolean {
    const before = items.value.length;
    items.value = items.value.filter((it) => it.id !== id);
    return items.value.length !== before;
  }

  /**
   * 전체 품목을 주어진 배열로 교체한다. (JSON 불러오기용)
   * @param newItems 교체할 품목 배열
   * @returns 없음
   */
  function replaceAll(newItems: FridgeItem[]): void {
    items.value = [...newItems];
  }

  /**
   * 전체 품목을 삭제한다.
   * @returns 없음
   */
  function clearAll(): void {
    items.value = [];
  }

  return {
    items,
    addItem,
    updateItem,
    removeItem,
    replaceAll,
    clearAll
  };
}
