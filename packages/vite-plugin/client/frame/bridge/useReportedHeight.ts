import { useEffect, type RefObject } from "react";

/** 요소의 렌더링 높이가 바뀔 때마다 알림, iframe 문서 높이 대신 내용 요소를 재야 iframe보다 작은 내용도 잡힘 */
export const useReportedHeight = (ref: RefObject<HTMLElement | null>, onHeight: (height: number) => void) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(() => onHeight(Math.ceil(element.getBoundingClientRect().height)));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, onHeight]);
};
