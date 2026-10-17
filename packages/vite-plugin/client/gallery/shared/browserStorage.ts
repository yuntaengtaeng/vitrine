// 비공개 창이나 막힌 저장소에서는 접근 자체가 throw할 수 있어 저장 없이 동작
export function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // 저장 실패는 이번 세션 설정에 영향 없음
  }
}
