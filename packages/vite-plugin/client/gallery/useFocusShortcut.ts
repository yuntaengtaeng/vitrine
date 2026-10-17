import { useEffect, type RefObject } from "react";

/** 키 입력을 가로채면 안 되는 편집 중인 요소인지 판단 */
export function isTypingTarget(target: EventTarget | null): boolean {
  const element = target as { tagName?: string; isContentEditable?: boolean } | null;
  if (!element?.tagName) return false;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName) || element.isContentEditable === true;
}

/** 편집 중이 아닐 때 지정한 키를 누르면 대상 요소로 focus 이동 */
export const useFocusShortcut = (ref: RefObject<HTMLElement | null>, key: string) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== key || event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      event.preventDefault();
      ref.current?.focus();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [ref, key]);
};
