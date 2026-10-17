import { FRAME_ROUTE, type GalleryViewport } from "@vitrine/protocol";
import { useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { COLOR } from "../../../tokens/color";
import { FONT_SIZE } from "../../../tokens/fontSize";
import { useElementWidth } from "../../shared/ui/useElementWidth";
import { BACKGROUND_STYLE } from "./background/background";
import type { StageSettings } from "./stageSettings";
import { findViewport } from "./viewport/viewport";

// frame이 높이를 알리기 전 깜빡임을 줄이는 최소 높이
const MIN_FRAME_HEIGHT = 80;

const Styled = {
  Root: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    overflow: "auto",
    padding: "2.25rem 2rem 2rem",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    boxSizing: "border-box",
    backgroundColor: COLOR.surface,
    backgroundImage: `radial-gradient(${COLOR.stageDot} 1px, transparent 1px)`,
    backgroundSize: "14px 14px",
  } satisfies CSSProperties,
  // 고정 너비는 무대보다 넓어도 줄어들지 않고 무대를 가로 스크롤
  FrameSlot: { position: "relative", flexShrink: 0 } satisfies CSSProperties,
  WidthLabel: {
    position: "absolute",
    right: 0,
    bottom: "100%",
    marginBottom: 4,
    fontSize: FONT_SIZE.label,
    color: COLOR.label,
    fontVariantNumeric: "tabular-nums",
  } satisfies CSSProperties,
  // border는 iframe 너비를 줄여 breakpoint 판정이 어긋나므로 너비에 포함되지 않는 outline 사용
  Frame: {
    position: "relative",
    outline: "1px dashed",
    outlineOffset: 0,
    borderRadius: 8,
    overflow: "hidden",
  } satisfies CSSProperties,
  Iframe: { display: "block", width: "100%", border: 0, background: "transparent" } satisfies CSSProperties,
};

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
    <div style={Styled.Root}>
      {props.fallback}
      <div
        style={{
          ...Styled.FrameSlot,
          width: viewport ? `${viewport.width}px` : "100%",
          display: props.fallback ? "none" : undefined,
        }}
      >
        {frameWidth !== null && (
          <span style={Styled.WidthLabel} data-stage-width-label>
            {frameWidth}px
          </span>
        )}
        <div
          ref={frameRef}
          style={{ ...Styled.Frame, ...BACKGROUND_STYLE[background].frame }}
          data-stage-frame
          data-background={background}
        >
          <iframe
            ref={iframeRef}
            src={`${FRAME_ROUTE}?id=${encodeURIComponent(entry.id)}`}
            title={`${entry.name} preview`}
            style={{ ...Styled.Iframe, height: Math.max(props.contentHeight ?? 0, MIN_FRAME_HEIGHT) }}
            data-frame-state={props.framePhase}
          />
          {props.overlay}
        </div>
      </div>
    </div>
  );
};
