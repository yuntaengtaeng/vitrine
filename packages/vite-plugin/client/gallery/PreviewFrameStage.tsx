import { FRAME_ROUTE, type GalleryViewport } from "@vitrine/protocol";
import { useRef, useState, type CSSProperties } from "react";
import { COLOR } from "../tokens/color";
import { FONT_SIZE } from "../tokens/fontSize";
import { BACKGROUND_STYLE } from "./background/background";
import { Controls } from "./Controls";
import type { FrameRenderState } from "./frameLink";
import { displayedArgs, toOverrideValue } from "./frameStatus";
import { StageToolbar } from "./StageToolbar";
import type { StageSettings } from "./stageSettings";
import { useElementWidth } from "./useElementWidth";
import { usePreviewFrame } from "./usePreviewFrame";
import { VariantPicker } from "./VariantPicker";
import { findViewport } from "./viewport/viewport";

// frame이 높이를 알리기 전 깜빡임을 줄이는 최소 높이
const MIN_FRAME_HEIGHT = 80;

const Styled = {
  Toolbar: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.6rem 1rem",
    minHeight: 44,
    padding: "0.35rem 1.25rem",
    borderBottom: `1px solid ${COLOR.border}`,
    boxSizing: "border-box",
  } satisfies CSSProperties,
  Stage: {
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
  Frame: { outline: "1px dashed", outlineOffset: 0, borderRadius: 8, overflow: "hidden" } satisfies CSSProperties,
  Iframe: { display: "block", width: "100%", border: 0, background: "transparent" } satisfies CSSProperties,
};

/** 프리뷰 iframe과 그 상태를 조종하는 toolbar, 무대, Props 패널 */
export const PreviewFrameStage = (props: {
  entry: GalleryPreviewEntry;
  viewports: readonly GalleryViewport[];
  stage: StageSettings;
  onStageChange: (patch: Partial<StageSettings>) => void;
}) => {
  const [selection, setSelection] = useState<FrameRenderState | null>(null);
  const { iframeRef, status } = usePreviewFrame(selection);
  const frameRef = useRef<HTMLDivElement>(null);
  const frameWidth = useElementWidth(frameRef);
  const { ready } = status;

  // 첫 frameReady로 frame이 고른 초기 variant를 알게 되면 그때부터 Gallery가 상태를 소유
  if (ready && !selection) setSelection({ variantKey: ready.initialVariantKey, args: {} });

  const setVariant = (variantKey: string) => setSelection({ variantKey, args: {} });
  const setArg = (name: string, value: unknown) => {
    const next = toOverrideValue(value);
    if (next === undefined) return;
    setSelection((current) => current && { ...current, args: { ...current.args, [name]: next } });
  };

  const viewport = findViewport(props.stage.viewport, props.viewports);
  const { background } = props.stage;
  const src = `${FRAME_ROUTE}?id=${encodeURIComponent(props.entry.id)}`;

  return (
    <>
      <div style={Styled.Toolbar}>
        <VariantPicker variants={ready?.variants ?? []} activeKey={selection?.variantKey ?? undefined} onSelect={setVariant} />
        <StageToolbar settings={props.stage} viewports={props.viewports} onChange={props.onStageChange} />
      </div>
      <div style={Styled.Stage}>
        <div style={{ ...Styled.FrameSlot, width: viewport ? `${viewport.width}px` : "100%" }}>
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
              src={src}
              title={`${props.entry.name} preview`}
              style={{ ...Styled.Iframe, height: Math.max(status.height ?? 0, MIN_FRAME_HEIGHT) }}
              data-frame-state={status.phase}
            />
          </div>
        </div>
      </div>
      {ready && selection && (
        <Controls controls={ready.controls} args={displayedArgs(ready, selection.variantKey, selection.args)} onChange={setArg} />
      )}
    </>
  );
};
