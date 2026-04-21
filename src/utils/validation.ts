/**
 * JSON Import 유효성 검증 유틸
 */

import type { FridgeExportData, FridgeItem, FridgeLocation } from '../types/fridge';
import { parseDateString } from './date';

const VALID_LOCATIONS: FridgeLocation[] = ['냉장', '냉동', '실온'];

/**
 * 임의 객체가 FridgeItem 구조에 부합하는지 검증한다.
 * @param obj 검증 대상 객체
 * @returns 유효하면 true
 */
function isValidItem(obj: any): obj is FridgeItem {
  if (!obj || typeof obj !== 'object') return false;
  if (typeof obj.id !== 'string' || obj.id.trim() === '') return false;
  if (typeof obj.name !== 'string' || obj.name.trim() === '') return false;
  if (typeof obj.quantity !== 'number' || obj.quantity < 0) return false;
  if (typeof obj.unit !== 'string') return false;
  if (!VALID_LOCATIONS.includes(obj.location)) return false;
  if (typeof obj.expiryDate !== 'string' || !parseDateString(obj.expiryDate)) return false;
  if (obj.memo !== undefined && typeof obj.memo !== 'string') return false;
  if (typeof obj.createdAt !== 'string') return false;
  if (typeof obj.updatedAt !== 'string') return false;
  return true;
}

/**
 * JSON 문자열을 파싱하고 FridgeExportData 구조인지 검증한다.
 * @param jsonText JSON 문자열
 * @returns 성공 시 데이터 객체, 실패 시 오류 메시지
 */
export function validateImportJson(
  jsonText: string
): { ok: true; data: FridgeExportData } | { ok: false; error: string } {
  let parsed: any;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return { ok: false, error: 'JSON 파싱에 실패했습니다. 파일 형식을 확인해 주세요.' };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: '루트 구조가 올바르지 않습니다.' };
  }

  if (!Array.isArray(parsed.items)) {
    return { ok: false, error: 'items 배열이 존재하지 않습니다.' };
  }

  for (let i = 0; i < parsed.items.length; i += 1) {
    if (!isValidItem(parsed.items[i])) {
      return { ok: false, error: `${i + 1}번째 품목의 형식이 올바르지 않습니다.` };
    }
  }

  return {
    ok: true,
    data: {
      version: typeof parsed.version === 'string' ? parsed.version : '1.0.0',
      exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : new Date().toISOString(),
      items: parsed.items
    }
  };
}
