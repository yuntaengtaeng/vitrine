import { FRAME_ERROR_MESSAGE_TYPE, FRAME_SIZE_MESSAGE_TYPE, type FrameRenderMessage } from "@vitrine/protocol";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ErrorText } from "./ErrorText";
import { PreviewErrorBoundary } from "./preview/PreviewErrorBoundary";
import { PreviewGrid } from "./preview/PreviewGrid";
import { PreviewRenderer } from "./preview/PreviewRenderer";
import { usePreviewModule } from "./preview/usePreviewModule";
import { usePreviewSetup, type PreviewSetupLoader } from "./preview/usePreviewSetup";
import { resolveCanvasView } from "./preview/canvasView";
import { buildFrameReady, resolveFrameArgs } from "./bridge/frameMessages";
import { sendToGallery, subscribeToGallery } from "./bridge/galleryBridge";
import { useReportedHeight } from "./bridge/useReportedHeight";

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

const ignoreCellError = () => {};

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
    if (entry && readyPreview) sendToGallery(buildFrameReady(entry.controls, readyPreview.config, readyPreview.component));
  }, [entry, readyPreview]);

  const failure = view.kind === "error" ? view.error : null;
  useEffect(() => {
    if (failure) reportError(failure);
  }, [failure]);

  // 실패 뒤 첫 성공은 ready로 알려야 Gallery가 복구로 봄 (ADR 007)
  const failedRef = useRef(false);
  const reportRenderError = (error: Error) => {
    failedRef.current = true;
    reportError(error);
  };
  const reportRendered = () => {
    if (!failedRef.current || !entry || !readyPreview) return;
    failedRef.current = false;
    sendToGallery(buildFrameReady(entry.controls, readyPreview.config, readyPreview.component));
  };

  return (
    <div ref={rootRef} style={Styled.Root} data-vitrine-frame={view.kind}>
      {view.kind === "error" && <ErrorText>{String(view.error.stack ?? view.error.message)}</ErrorText>}
      {view.kind === "ready" && entry && render?.layout.kind === "grid" && (
        <PreviewGrid
          cells={render.layout.cells}
          renderCell={(cell) => (
            // 칸 하나의 실패는 그 칸에만 표시하고 나머지 variant는 계속 보여줌
            <PreviewErrorBoundary resetKey={JSON.stringify(cell)} onError={ignoreCellError} onRendered={reportRendered}>
              <PreviewRenderer
                component={view.preview.component}
                args={resolveFrameArgs(entry.controls, view.preview.config, cell)}
                globalWrapper={setup.wrapper}
                wrapper={view.preview.config.wrapper}
              />
            </PreviewErrorBoundary>
          )}
        />
      )}
      {view.kind === "ready" && entry && render?.layout.kind !== "grid" && (
        <PreviewErrorBoundary resetKey={JSON.stringify(render)} onError={reportRenderError} onRendered={reportRendered}>
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
