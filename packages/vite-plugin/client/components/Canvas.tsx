import type { CSSProperties } from "react";
import { usePreviewCanvas } from "../hooks/usePreviewCanvas";
import { ErrorText } from "./ErrorText";
import { PreviewErrorBoundary } from "./PreviewErrorBoundary";
import { Controls } from "./Controls";

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

export const Canvas = (props: { entry: GalleryPreviewEntry | undefined }) => {
  const { Comp, error, controls, args, setArg } = usePreviewCanvas(props.entry);

  if (error) return <ErrorText>{String(error.stack ?? error.message ?? error)}</ErrorText>;
  if (!Comp) return null;
  return (
    <div style={Styled.Root}>
      <div style={Styled.Preview}>
        <div style={Styled.PreviewBody}>
          <PreviewErrorBoundary>
            <Comp {...args} />
          </PreviewErrorBoundary>
        </div>
      </div>
      <Controls controls={controls} args={args} onChange={setArg} />
    </div>
  );
};
