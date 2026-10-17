import type { CSSProperties } from "react";
import { COLOR } from "../tokens/color";
import { usePreviewSelectionSync } from "../hooks/usePreviewSelectionSync";
import { usePreviewSetup } from "../hooks/usePreviewSetup";
import { Sidebar } from "./Sidebar";
import { Canvas } from "./Canvas";

const Styled = {
  Root: {
    display: "flex",
    height: "100vh",
    fontFamily: "system-ui, sans-serif",
    background: COLOR.surface,
  } satisfies CSSProperties,
  CanvasWrapper: {
    flex: 1,
    overflow: "auto",
    boxSizing: "border-box",
  } satisfies CSSProperties,
};

export const App = (props: {
  entries: GalleryPreviewEntry[];
  loadPreviewSetup: (() => Promise<{ default?: unknown }>) | undefined;
}) => {
  const { entries, loadPreviewSetup } = props;
  const previewSetup = usePreviewSetup(loadPreviewSetup);
  const [activeId, setActiveId] = usePreviewSelectionSync(entries);
  const activeEntry = entries.find((entry) => entry.id === activeId);

  return (
    <div style={Styled.Root}>
      <Sidebar entries={entries} activeId={activeId} onSelect={setActiveId} />
      <div style={Styled.CanvasWrapper}>
        <Canvas
          key={activeEntry?.id ?? "empty"}
          entry={activeEntry}
          previewWrapper={previewSetup.wrapper}
          setupError={previewSetup.error}
          setupLoading={previewSetup.loading}
        />
      </div>
    </div>
  );
};
