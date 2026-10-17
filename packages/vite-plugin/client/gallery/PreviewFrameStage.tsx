import { FRAME_ROUTE } from "@vitrine/protocol";
import { useState, type CSSProperties } from "react";
import { Controls } from "../components/Controls";
import { StageToolbar } from "../components/StageToolbar";
import { VariantPicker } from "../components/VariantPicker";
import { frameCssWidth, stageWidthLabel, type StageBackground, type StageSettings } from "../preview/stageSettings";
import { COLOR } from "../tokens/color";
import { FONT_SIZE } from "../tokens/fontSize";
import type { FrameRenderState } from "./frameLink";
import { displayedArgs, toOverrideValue } from "./frameStatus";
import { usePreviewFrame } from "./usePreviewFrame";

const FRAME_BACKGROUND: Record<StageBackground, CSSProperties> = {
  light: { background: COLOR.surface, borderColor: COLOR.frameBorder },
  dark: { background: COLOR.frameDarkBg, borderColor: COLOR.frameDarkBorder },
  transparent: {
    background: `repeating-conic-gradient(${COLOR.checkerDark} 0 25%, ${COLOR.checkerLight} 0 50%) 0 0 / 14px 14px`,
    borderColor: COLOR.frameBorder,
  },
};

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
  // 고정 px 너비는 무대보다 넓어도 줄어들지 않고 무대를 가로 스크롤
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
  Frame: { border: "1px dashed", borderRadius: 8, overflow: "hidden" } satisfies CSSProperties,
  Iframe: { display: "block", width: "100%", border: 0, background: "transparent" } satisfies CSSProperties,
};

/** 프리뷰 iframe과 그 상태를 조종하는 toolbar, 무대, Props 패널 */
export const PreviewFrameStage = (props: {
  entry: GalleryPreviewEntry;
  stage: StageSettings;
  onStageChange: (patch: Partial<StageSettings>) => void;
}) => {
  const [selection, setSelection] = useState<FrameRenderState | null>(null);
  const { iframeRef, status } = usePreviewFrame(selection);
  const { ready } = status;

  // 첫 frameReady로 frame이 고른 초기 variant를 알게 되면 그때부터 Gallery가 상태를 소유
  if (ready && !selection) setSelection({ variantKey: ready.initialVariantKey, args: {} });

  const setVariant = (variantKey: string) => setSelection({ variantKey, args: {} });
  const setArg = (name: string, value: unknown) => {
    const next = toOverrideValue(value);
    if (next === undefined) return;
    setSelection((current) => current && { ...current, args: { ...current.args, [name]: next } });
  };

  const { width, background } = props.stage;
  const src = `${FRAME_ROUTE}?id=${encodeURIComponent(props.entry.id)}`;

  return (
    <>
      <div style={Styled.Toolbar}>
        <VariantPicker variants={ready?.variants ?? []} activeKey={selection?.variantKey ?? undefined} onSelect={setVariant} />
        <StageToolbar settings={props.stage} onChange={props.onStageChange} />
      </div>
      <div style={Styled.Stage}>
        <div style={{ ...Styled.FrameSlot, width: width === "fit" ? "100%" : frameCssWidth(width) }}>
          {width !== "fit" && (
            <span style={Styled.WidthLabel} data-stage-width-label>
              {stageWidthLabel(width)}
            </span>
          )}
          <div style={{ ...Styled.Frame, ...FRAME_BACKGROUND[background] }} data-stage-frame data-background={background}>
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
