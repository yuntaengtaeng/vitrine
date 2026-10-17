import { FRAME_ERROR_MESSAGE_TYPE, FRAME_SIZE_MESSAGE_TYPE, type FrameRenderMessage } from "@vitrine/protocol";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ErrorText } from "./ErrorText";
import { PreviewErrorBoundary } from "./PreviewErrorBoundary";
import { PreviewRenderer } from "./PreviewRenderer";
import { usePreviewModule } from "./usePreviewModule";
import { usePreviewSetup, type PreviewSetupLoader } from "./usePreviewSetup";
import { resolveCanvasView } from "./canvasView";
import { buildFrameReady, resolveFrameArgs } from "./frameState";
import { sendToGallery, subscribeToGallery } from "./galleryBridge";
import { useReportedHeight } from "./useReportedHeight";

const Styled = {
  // 작은 컴포넌트는 무대 가운데에 보이고, 너비 100% 컴포넌트는 frame 너비를 채움
  Root: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "2rem",
    boxSizing: "border-box",
  } satisfies CSSProperties,
};

const reportHeight = (height: number) => sendToGallery({ type: FRAME_SIZE_MESSAGE_TYPE, height });

const reportError = (error: Error) =>
  sendToGallery({ type: FRAME_ERROR_MESSAGE_TYPE, message: error.message, stack: error.stack });

/** iframe 안에서 setup file과 프리뷰 하나를 로드하고 Gallery가 보낸 상태로 렌더링 */
export const FrameApp = (props: {
  entry: GalleryPreviewEntry | undefined;
  previewId: string | null;
  loadPreviewSetup: PreviewSetupLoader;
}) => {
  const { entry } = props;
  const setup = usePreviewSetup(props.loadPreviewSetup);
  const previewModule = usePreviewModule(entry);
  const [render, setRender] = useState<FrameRenderMessage | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeToGallery(setRender), []);
  useReportedHeight(rootRef, reportHeight);

  const missing = entry ? null : new Error(`No @preview export with id "${props.previewId ?? ""}"`);
  const view = resolveCanvasView({
    setupError: missing ?? setup.error,
    setupLoading: setup.loading,
    loadError: previewModule.error,
    preview: previewModule.preview,
  });

  const readyPreview = view.kind === "ready" ? view.preview : null;
  useEffect(() => {
    if (entry && readyPreview) sendToGallery(buildFrameReady(entry.controls, readyPreview.config));
  }, [entry, readyPreview]);

  const failure = view.kind === "error" ? view.error : null;
  useEffect(() => {
    if (failure) reportError(failure);
  }, [failure]);

  return (
    <div ref={rootRef} style={Styled.Root} data-vitrine-frame={view.kind}>
      {view.kind === "error" && <ErrorText>{String(view.error.stack ?? view.error.message)}</ErrorText>}
      {view.kind === "ready" && entry && (
        <PreviewErrorBoundary onError={reportError}>
          <PreviewRenderer
            component={view.preview.component}
            args={resolveFrameArgs(entry.controls, view.preview.config, render)}
            globalWrapper={setup.wrapper}
            wrapper={view.preview.config.wrapper}
          />
        </PreviewErrorBoundary>
      )}
    </div>
  );
};
