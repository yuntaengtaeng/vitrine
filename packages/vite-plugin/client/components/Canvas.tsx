import type { CSSProperties } from "react";
import { usePreviewModule } from "../hooks/usePreviewModule";
import type { PreviewSetupState } from "../hooks/usePreviewSetup";
import { resolveCanvasView } from "../preview/canvasView";
import { CanvasHeader } from "./CanvasHeader";
import { ErrorText } from "./ErrorText";
import { PreviewStage } from "./PreviewStage";

const Styled = {
  Root: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
  } satisfies CSSProperties,
  Message: { padding: "1rem 1.25rem" } satisfies CSSProperties,
};

export const Canvas = (props: {
  entry: GalleryPreviewEntry | undefined;
  previewSetup: PreviewSetupState;
  canOpenInEditor: boolean;
}) => {
  const { entry, previewSetup } = props;
  const previewModule = usePreviewModule(entry);
  if (!entry) return null;

  const view = resolveCanvasView({
    setupError: previewSetup.error,
    setupLoading: previewSetup.loading,
    loadError: previewModule.error,
    preview: previewModule.preview,
  });

  return (
    <div style={Styled.Root}>
      <CanvasHeader entry={entry} canOpenInEditor={props.canOpenInEditor} />
      {view.kind === "error" && (
        <div style={Styled.Message}>
          <ErrorText>{String(view.error.stack ?? view.error.message ?? view.error)}</ErrorText>
        </div>
      )}
      {view.kind === "ready" && (
        <PreviewStage
          preview={view.preview}
          inferredControls={entry.controls}
          globalWrapper={previewSetup.wrapper}
        />
      )}
    </div>
  );
};
