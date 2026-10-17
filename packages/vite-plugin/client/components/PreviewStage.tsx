import type { CSSProperties } from "react";
import type { PreviewWrapper } from "vite-plugin-react-vitrine/preview";
import { usePreviewArgs } from "../hooks/usePreviewArgs";
import type { LoadedPreview } from "../preview/previewConfig";
import { frameCssWidth, stageWidthLabel, type StageBackground, type StageSettings } from "../preview/stageSettings";
import { COLOR } from "../tokens/color";
import { FONT_SIZE } from "../tokens/fontSize";
import { Controls } from "./Controls";
import { PreviewErrorBoundary } from "./PreviewErrorBoundary";
import { PreviewRenderer } from "./PreviewRenderer";
import { StageToolbar } from "./StageToolbar";
import { VariantPicker } from "./VariantPicker";

const FRAME_BACKGROUND: Record<StageBackground, CSSProperties> = {
  light: { background: COLOR.surface, borderColor: COLOR.frameBorder },
  dark: { background: COLOR.frameDarkBg, borderColor: COLOR.frameDarkBorder },
  transparent: {
    background: `repeating-conic-gradient(${COLOR.checkerDark} 0 25%, ${COLOR.checkerLight} 0 50%) 0 0 / 14px 14px`,
    borderColor: COLOR.frameBorder,
  },
};

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
  Frame: {
    minWidth: 200,
    minHeight: 80,
    padding: "2rem",
    border: "1px dashed",
    borderRadius: 8,
    boxSizing: "border-box",
  } satisfies CSSProperties,
};

/** 로드가 끝난 프리뷰의 toolbar, 무대 프레임, controls 영역 */
export const PreviewStage = (props: {
  preview: LoadedPreview;
  inferredControls: Record<string, GalleryPropControl>;
  globalWrapper: PreviewWrapper | undefined;
  stage: StageSettings;
  onStageChange: (patch: Partial<StageSettings>) => void;
}) => {
  const { component, config } = props.preview;
  const { controls, args, setArg, variants, variantKey, setVariant } = usePreviewArgs(props.inferredControls, config);
  const { width, background } = props.stage;

  return (
    <>
      <div style={Styled.Toolbar}>
        <VariantPicker variants={variants} activeKey={variantKey} onSelect={setVariant} />
        <StageToolbar settings={props.stage} onChange={props.onStageChange} />
      </div>
      <div style={Styled.Stage}>
        <div style={{ ...Styled.FrameSlot, width: frameCssWidth(width) }}>
          {width !== "fit" && (
            <span style={Styled.WidthLabel} data-stage-width-label>
              {stageWidthLabel(width)}
            </span>
          )}
          <div style={{ ...Styled.Frame, ...FRAME_BACKGROUND[background] }} data-stage-frame data-background={background}>
            <PreviewErrorBoundary>
              <PreviewRenderer
                component={component}
                args={args}
                globalWrapper={props.globalWrapper}
                wrapper={config.wrapper}
              />
            </PreviewErrorBoundary>
          </div>
        </div>
      </div>
      <Controls controls={controls} args={args} onChange={setArg} />
    </>
  );
};
