/**
 * 날짜 처리 유틸
 * 시간대 오차를 방지하기 위해 YYYY-MM-DD 문자열 비교 기반으로 구현한다.
 */

import type { FridgeStatus } from '../types/fridge';

/**
 * 오늘 날짜를 YYYY-MM-DD 문자열로 반환한다.
 * 로컬 시간대 기준으로 처리한다.
 * @returns YYYY-MM-DD 형식 문자열
 */
export function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * YYYY-MM-DD 문자열을 로컬 시간 자정(Date)으로 변환한다.
 * @param dateStr YYYY-MM-DD 형식 문자열
 * @returns Date 객체 (유효하지 않으면 null)
 */
export function parseDateString(dateStr: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  if (
    dt.getFullYear() !== y ||
    dt.getMonth() !== m - 1 ||
    dt.getDate() !== d
  ) {
    return null;
  }
  return dt;
}

/**
 * 유통기한까지 남은 일수를 계산한다.
 * @param expiryDate 유통기한 (YYYY-MM-DD)
 * @param today 비교 기준일 (YYYY-MM-DD, 기본값 오늘)
 * @returns 남은 일수 (음수이면 이미 만료)
 */
export function getDaysUntilExpiry(expiryDate: string, today?: string): number {
  const expiry = parseDateString(expiryDate);
  const base = parseDateString(today ?? getTodayString());
  if (!expiry || !base) return 0;
  const diffMs = expiry.getTime() - base.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * 유통기한 기준 상태를 판정한다.
 * expired: 오늘보다 이전
 * soon: 오늘 포함 3일 이내
 * normal: 그 외
 * @param expiryDate 유통기한 (YYYY-MM-DD)
 * @param today 비교 기준일 (기본값 오늘)
 * @returns 상태 문자열
 */
export function getStatus(expiryDate: string, today?: string): FridgeStatus {
  const days = getDaysUntilExpiry(expiryDate, today);
  if (days < 0) return 'expired';
  if (days <= 3) return 'soon';
  return 'normal';
}
