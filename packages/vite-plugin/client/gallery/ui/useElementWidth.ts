import { useEffect, useState, type RefObject } from "react";

/** 요소의 렌더링 너비(px), 측정 전에는 null */
export const useElementWidth = (ref: RefObject<HTMLElement | null>): number | null => {
  const [width, setWidth] = useState<number | null>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setWidth(Math.round(element.getBoundingClientRect().width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
};
