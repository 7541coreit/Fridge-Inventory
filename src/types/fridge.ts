/**
 * 냉장고 재고 관련 타입 정의
 */

// 보관 위치 타입
export type FridgeLocation = '냉장' | '냉동' | '실온';

// 유통기한 상태 타입
// normal: 정상, soon: 임박, expired: 만료
export type FridgeStatus = 'normal' | 'soon' | 'expired';

// 재고 품목 타입
export interface FridgeItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  location: FridgeLocation;
  expiryDate: string; // YYYY-MM-DD
  memo?: string;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

// JSON 파일 내보내기/불러오기 루트 구조
export interface FridgeExportData {
  version: string;
  exportedAt: string;
  items: FridgeItem[];
}

// 화면 필터 상태
export interface FridgeFilter {
  keyword: string;
  location: FridgeLocation | 'all';
  status: FridgeStatus | 'all';
}
