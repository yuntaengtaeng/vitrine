const NEXT_KEYS = new Set(["ArrowRight", "ArrowDown"]);
const PREVIOUS_KEYS = new Set(["ArrowLeft", "ArrowUp"]);

/** 방향키 입력에 따른 다음 radio index 계산 (양 끝에서 순환, 방향키가 아니면 null) */
export function nextRadioIndex(currentIndex: number, key: string, count: number): number | null {
  if (count === 0) return null;
  if (NEXT_KEYS.has(key)) return (currentIndex + 1) % count;
  if (PREVIOUS_KEYS.has(key)) return (currentIndex - 1 + count) % count;
  return null;
}

/** Tab으로 진입할 radio index 반환 (선택값이 없으면 첫 항목) */
export function focusableRadioIndex(selectedIndex: number): number {
  return selectedIndex >= 0 ? selectedIndex : 0;
}
