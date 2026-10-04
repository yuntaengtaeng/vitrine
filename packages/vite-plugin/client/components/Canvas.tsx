import type { CSSProperties } from "react";
import type { PreviewWrapper } from "vite-plugin-react-vitrine/preview";
import { usePreviewCanvas } from "../hooks/usePreviewCanvas";
import { ErrorText } from "./ErrorText";
import { PreviewErrorBoundary } from "./PreviewErrorBoundary";
import { Controls } from "./Controls";
import { VariantPicker } from "./VariantPicker";
import { PreviewRenderer } from "./PreviewRenderer";

const Styled = {
  Root: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
  } satisfies CSSProperties,
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

export const Canvas = (props: {
  entry: GalleryPreviewEntry | undefined;
  previewWrapper: PreviewWrapper | undefined;
  setupError: Error | null;
  setupLoading: boolean;
}) => {
  const { Comp, config, error, controls, args, setArg, variants, variantKey, setVariant } =
    usePreviewCanvas(props.entry);

  const displayError = props.setupError ?? error;
  if (displayError) {
    return <ErrorText>{String(displayError.stack ?? displayError.message ?? displayError)}</ErrorText>;
  }
  if (props.setupLoading) return null;
  if (!Comp) return null;
  return (
    <div style={Styled.Root}>
      <VariantPicker variants={variants} activeKey={variantKey} onSelect={setVariant} />
      <div style={Styled.Preview}>
        <div style={Styled.PreviewBody}>
          <PreviewErrorBoundary>
            <PreviewRenderer
              component={Comp}
              args={args}
              globalWrapper={props.previewWrapper}
              wrapper={config.wrapper}
            />
          </PreviewErrorBoundary>
        </div>
      </div>
      <Controls controls={controls} args={args} onChange={setArg} />
    </div>
  );
};
