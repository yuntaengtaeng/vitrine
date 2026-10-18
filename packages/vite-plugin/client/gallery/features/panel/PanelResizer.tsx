import { useRef, type KeyboardEvent, type PointerEvent, type RefObject } from "react";
import { MIN_PANEL_HEIGHT, PANEL_RESIZE_STEP } from "./panelSize";
import * as styles from "./PanelResizer.css";

export const PanelResizer = ({
  panelRef,
  height,
  onResize,
  onCollapse,
}: {
  panelRef: RefObject<HTMLElement | null>;
  height: number;
  onResize: (height: number) => void;
  onCollapse: () => void;
}) => {
  const drag = useRef<{ startY: number; startHeight: number } | null>(null);
  // 저장한 높이보다 화면이 작으면 CSS가 줄여 보여주므로 실제 높이에서 시작해야 손잡이가 튀지 않음
  const renderedHeight = () => panelRef.current?.offsetHeight ?? height;

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    // 포인터가 프리뷰 iframe 위로 지나가도 이벤트를 놓치지 않게 붙잡음
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startY: event.clientY, startHeight: renderedHeight() };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    onResize(drag.current.startHeight + drag.current.startY - event.clientY);
  };

  const endDrag = () => {
    drag.current = null;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === "ArrowUp" ? PANEL_RESIZE_STEP : event.key === "ArrowDown" ? -PANEL_RESIZE_STEP : 0;
    if (step !== 0) {
      event.preventDefault();
      onResize(renderedHeight() + step);
    } else if (event.key === "Enter") {
      event.preventDefault();
      onCollapse();
    }
  };

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      aria-label="Resize panel"
      aria-valuenow={height}
      aria-valuemin={MIN_PANEL_HEIGHT}
      tabIndex={0}
      className={styles.resizer}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
    />
  );
};
