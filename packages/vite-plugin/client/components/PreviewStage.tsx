import type { CSSProperties } from "react";
import type { PreviewWrapper } from "vite-plugin-react-vitrine/preview";
import { usePreviewArgs } from "../hooks/usePreviewArgs";
import type { LoadedPreview } from "../preview/previewConfig";
import { Controls } from "./Controls";
import { PreviewErrorBoundary } from "./PreviewErrorBoundary";
import { PreviewRenderer } from "./PreviewRenderer";
import { VariantPicker } from "./VariantPicker";

const Styled = {
  Preview: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    overflow: "auto",
    padding: "2.5rem",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    boxSizing: "border-box",
  } satisfies CSSProperties,
  PreviewBody: { padding: "2rem", minWidth: 200, minHeight: 80, boxSizing: "border-box" } satisfies CSSProperties,
};

/** 로드가 끝난 프리뷰의 variant 선택, 렌더링, controls 영역 */
export const PreviewStage = (props: {
  preview: LoadedPreview;
  inferredControls: Record<string, GalleryPropControl>;
  globalWrapper: PreviewWrapper | undefined;
}) => {
  const { component, config } = props.preview;
  const { controls, args, setArg, variants, variantKey, setVariant } = usePreviewArgs(props.inferredControls, config);

  return (
    <>
      <VariantPicker variants={variants} activeKey={variantKey} onSelect={setVariant} />
      <div style={Styled.Preview}>
        <div style={Styled.PreviewBody}>
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
      <Controls controls={controls} args={args} onChange={setArg} />
    </>
  );
};
