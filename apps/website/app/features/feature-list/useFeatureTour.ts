import { useReducedMotion } from "motion/react";
import { useEffect, useState, type RefObject } from "react";

const AUTOPLAY_MS = 4200;

/**
 * 보이는 동안 기능을 차례로 넘기다가, 사용자가 직접 고르면 그 자리에서 멈춤
 * @param order 넘길 순서의 기능 id
 * @param sectionRef 화면에 보일 때만 넘기도록 관찰할 영역
 */
export function useFeatureTour(order: readonly string[], sectionRef: RefObject<HTMLElement | null>) {
  const reducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(order[0]);
  const [chosen, setChosen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.4 });
    observer.observe(section);
    return () => observer.disconnect();
  }, [sectionRef]);

  const autoplay = visible && !chosen && !reducedMotion;
  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(
      () => setActiveId((current) => order[(order.indexOf(current) + 1) % order.length]),
      AUTOPLAY_MS,
    );
    return () => clearInterval(timer);
  }, [autoplay, order]);

  const choose = (id: string) => {
    setChosen(true);
    setActiveId(id);
  };

  return [activeId, choose] as const;
}
