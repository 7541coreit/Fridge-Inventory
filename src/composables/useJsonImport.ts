/**
 * JSON 불러오기 composable
 */

import type { FridgeItem } from '../types/fridge';
import { readFileAsText } from '../utils/file';
import { validateImportJson } from '../utils/validation';

/**
 * JSON 불러오기 composable.
 * @returns importJson 함수
 */
export function useJsonImport() {
  /**
   * 파일을 읽고 검증 후 품목 배열을 반환한다.
   * @param file 사용자가 선택한 JSON 파일
   * @returns 성공 시 품목 배열, 실패 시 Error throw
   */
  async function importJson(file: File): Promise<FridgeItem[]> {
    const text = await readFileAsText(file);
    const result = validateImportJson(text);
    if (!result.ok) {
      throw new Error(result.error);
    }
    return result.data.items;
  }

  return { importJson };
}
