import type { FrameGlobalValues, FrameGridCell } from "@vitrine/protocol";
import type { PreviewWrapper } from "vite-plugin-react-vitrine/preview";
import { ErrorText } from "../ErrorText";
import { resolveFrameArgs } from "../bridge/frameMessages";
import { PreviewErrorBoundary } from "./PreviewErrorBoundary";
import { PreviewRenderer } from "./PreviewRenderer";
import { usePreviewModule } from "./usePreviewModule";

const ignore = () => {};

/** 옛 버전 모듈과 그 버전의 preview() 설정으로 칸 하나를 그림, 실패는 이 칸에만 표시 */
export const SnapshotPreview = (props: {
  entry: GalleryPreviewEntry;
  cell: FrameGridCell & { snapshot: number };
  setupWrapper: PreviewWrapper | undefined;
  globals: FrameGlobalValues;
}) => {
  const { preview, error } = usePreviewModule(props.entry, props.cell.snapshot);
  if (error) return <ErrorText>{error.message}</ErrorText>;
  if (!preview) return null;
  return (
    <PreviewErrorBoundary resetKey={JSON.stringify(props.cell)} onError={ignore} onRendered={ignore}>
      <PreviewRenderer
        component={preview.component}
        args={resolveFrameArgs(props.entry.controls, preview.config, props.cell)}
        globalWrapper={props.setupWrapper}
        wrapper={preview.config.wrapper}
        globals={props.globals}
      />
    </PreviewErrorBoundary>
  );
};
