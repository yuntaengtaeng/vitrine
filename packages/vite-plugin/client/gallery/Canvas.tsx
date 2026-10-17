import type { CSSProperties } from "react";
import { PreviewFrameStage } from "./PreviewFrameStage";
import type { StageSettings } from "./stageSettings";
import { CanvasHeader } from "./CanvasHeader";

const Styled = {
  Root: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
  } satisfies CSSProperties,
};

export const Canvas = (props: {
  entry: GalleryPreviewEntry | undefined;
  canOpenInEditor: boolean;
  stage: StageSettings;
  onStageChange: (patch: Partial<StageSettings>) => void;
}) => {
  const { entry } = props;
  if (!entry) return null;

  return (
    <div style={Styled.Root}>
      <CanvasHeader entry={entry} canOpenInEditor={props.canOpenInEditor} />
      <PreviewFrameStage entry={entry} stage={props.stage} onStageChange={props.onStageChange} />
    </div>
  );
};
