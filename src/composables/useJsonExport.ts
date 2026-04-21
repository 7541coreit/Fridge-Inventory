/**
 * JSON 내보내기 composable
 */

import type { FridgeExportData, FridgeItem } from '../types/fridge';
import { downloadTextFile, makeDateFilename } from '../utils/file';

/**
 * JSON 내보내기 composable.
 * @returns exportJson 함수
 */
export function useJsonExport() {
  /**
   * 품목 배열을 JSON 파일로 다운로드한다.
   * @param items 내보낼 품목 배열
   * @returns 없음
   */
  function exportJson(items: FridgeItem[]): void {
    const data: FridgeExportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      items
    };
    const json = JSON.stringify(data, null, 2);
    downloadTextFile(json, makeDateFilename(), 'application/json');
  }

  return { exportJson };
}
