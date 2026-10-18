import { useEffect, useState, type RefObject } from "react";

/**
 * 요소가 화면에 들어와 있는지 조회, 보이지 않는 동안 자동 재생을 멈추는 데 사용
 * @param ref 관찰할 요소
 * @param threshold 보인다고 볼 면적 비율
 */
export function useInView(ref: RefObject<HTMLElement | null>, threshold = 0.35): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return inView;
}
