import type { CSSProperties } from "react";
import type { PreviewWrapper } from "vite-plugin-react-vitrine/preview";
import { usePreviewCanvas } from "../hooks/usePreviewCanvas";
import { CanvasHeader } from "./CanvasHeader";
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
  Message: { padding: "1rem 1.25rem" } satisfies CSSProperties,
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
  canOpenInEditor: boolean;
}) => {
  const { Comp, config, error, controls, args, setArg, variants, variantKey, setVariant } =
    usePreviewCanvas(props.entry);
  if (!props.entry) return null;

  const displayError = props.setupError ?? error;
  const body = displayError ? (
    <div style={Styled.Message}>
      <ErrorText>{String(displayError.stack ?? displayError.message ?? displayError)}</ErrorText>
    </div>
  ) : props.setupLoading || !Comp ? null : (
    <>
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
    </>
  );

  return (
    <div style={Styled.Root}>
      <CanvasHeader entry={props.entry} canOpenInEditor={props.canOpenInEditor} />
      {body}
    </div>
  );
};
