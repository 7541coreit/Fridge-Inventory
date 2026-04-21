/**
 * 파일 다운로드 및 읽기 유틸
 */

/**
 * 문자열 내용을 파일로 다운로드한다.
 * @param content 파일 내용 (문자열)
 * @param filename 다운로드 파일명
 * @param mimeType MIME 타입 (기본값 application/json)
 * @returns 없음
 */
export function downloadTextFile(
  content: string,
  filename: string,
  mimeType: string = 'application/json'
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * File 객체를 텍스트로 읽는다.
 * @param file 파일 객체
 * @returns 파일 내용 문자열 Promise
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
    reader.readAsText(file);
  });
}

/**
 * 현재 날짜 기반 파일명을 생성한다.
 * 예: fridge-data-20260421.json
 * @param prefix 파일명 접두사
 * @returns 생성된 파일명
 */
export function makeDateFilename(prefix: string = 'fridge-data'): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${prefix}-${y}${m}${d}.json`;
}

/**
 * 고유 ID를 생성한다.
 * @returns item-xxxx 형식의 문자열
 */
export function generateId(): string {
  const rand = Math.random().toString(36).slice(2, 8);
  const time = Date.now().toString(36);
  return `item-${time}-${rand}`;
}
