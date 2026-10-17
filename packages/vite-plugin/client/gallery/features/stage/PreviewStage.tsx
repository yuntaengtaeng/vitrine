import { FRAME_ROUTE, type GalleryViewport } from "@vitrine/protocol";
import { useRef, type ReactNode, type RefObject } from "react";
import { useElementWidth } from "../../shared/ui/useElementWidth";
import { frame as frameBackground } from "./background/background.css";
import * as styles from "./PreviewStage.css";
import type { StageSettings } from "./stageSettings";
import { findViewport } from "./viewport/viewport";

// frame이 높이를 알리기 전 깜빡임을 줄이는 최소 높이
const MIN_FRAME_HEIGHT = 80;

export const PreviewStage = (props: {
  entry: GalleryPreviewEntry;
  iframeRef: RefObject<HTMLIFrameElement>;
  framePhase: string;
  /** frame이 보고한 내용 높이(px), 보고 전에는 null */
  contentHeight: number | null;
  settings: StageSettings;
  viewports: readonly GalleryViewport[];
  /** 프레임 대신 보여줄 내용, iframe은 숨기기만 해서 복구되면 frame이 다시 알릴 수 있음 */
  fallback?: ReactNode;
  /** 프레임 위에 겹쳐 보여줄 내용, iframe은 그대로 보임 */
  overlay?: ReactNode;
}) => {
  const { entry, iframeRef } = props;
  const frameRef = useRef<HTMLDivElement>(null);
  const frameWidth = useElementWidth(frameRef);
  const viewport = findViewport(props.settings.viewport, props.viewports);
  const { background } = props.settings;

  return (
    <div className={styles.root}>
      {props.fallback}
      <div
        className={styles.frameSlot}
        style={{ width: viewport ? `${viewport.width}px` : "100%" }}
        hidden={Boolean(props.fallback)}
      >
        {frameWidth !== null && (
          <span className={styles.widthLabel} data-stage-width-label>
            {frameWidth}px
          </span>
        )}
        <div
          ref={frameRef}
          className={`${styles.frame} ${frameBackground[background]}`}
          data-stage-frame
          data-background={background}
        >
          <iframe
            ref={iframeRef}
            src={`${FRAME_ROUTE}?id=${encodeURIComponent(entry.id)}`}
            title={`${entry.name} preview`}
            className={styles.iframe}
            style={{ height: Math.max(props.contentHeight ?? 0, MIN_FRAME_HEIGHT) }}
            data-frame-state={props.framePhase}
          />
          {props.overlay}
        </div>
      </div>
    </div>
  );
};
