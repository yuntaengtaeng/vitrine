import type { GalleryViewport } from "@vitrine/protocol";
import type { CSSProperties } from "react";
import { COLOR } from "../tokens/color";
import { ControlsPanel } from "./features/controls/ControlsPanel";
import { VariantPicker } from "./features/controls/VariantPicker";
import { usePreviewSession } from "./features/previewSession/usePreviewSession";
import { CanvasHeader } from "./features/header/CanvasHeader";
import { PreviewStage } from "./features/stage/PreviewStage";
import { StageToolbar } from "./features/stage/StageToolbar";
import type { StageSettings } from "./features/stage/stageSettings";

const Styled = {
  Root: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
  } satisfies CSSProperties,
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
};

/** 선택한 프리뷰 한 개의 머리말, toolbar, 무대, Props 패널 */
export const Canvas = (props: {
  entry: GalleryPreviewEntry;
  canOpenInEditor: boolean;
  viewports: readonly GalleryViewport[];
  stage: StageSettings;
  onStageChange: (patch: Partial<StageSettings>) => void;
}) => {
  const { entry } = props;
  const session = usePreviewSession();
  const { ready } = session.status;

  return (
    <div style={Styled.Root}>
      <CanvasHeader entry={entry} canOpenInEditor={props.canOpenInEditor} />
      <div style={Styled.Toolbar}>
        <VariantPicker
          variants={ready?.variants ?? []}
          activeKey={session.activeVariantKey}
          onSelect={session.selectVariant}
        />
        <StageToolbar settings={props.stage} viewports={props.viewports} onChange={props.onStageChange} />
      </div>
      <PreviewStage
        entry={entry}
        iframeRef={session.iframeRef}
        framePhase={session.status.phase}
        contentHeight={session.status.height}
        settings={props.stage}
        viewports={props.viewports}
      />
      {ready && session.args && (
        <ControlsPanel controls={ready.controls} args={session.args} onChange={session.changeArg} />
      )}
    </div>
  );
};
