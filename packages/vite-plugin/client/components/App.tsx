import { useState, type CSSProperties } from "react";
import { COLOR } from "../tokens/color";
import { usePreviewSelectionSync } from "../hooks/usePreviewSelectionSync";
import { usePreviewSetup } from "../hooks/usePreviewSetup";
import { Sidebar } from "./Sidebar";
import { Canvas } from "./Canvas";
import { isEmbeddedInFrame } from "./editorLink";

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
  // VS Code panel 안에서는 옆에 에디터가 있고, 바깥에서 에디터를 실행하면 새 창이 뜰 수 있어 숨김
  const [canOpenInEditor] = useState(() => !isEmbeddedInFrame(window));

  return (
    <div style={Styled.Root}>
      <Sidebar entries={entries} activeId={activeId} onSelect={setActiveId} />
      <div style={Styled.CanvasWrapper}>
        <Canvas
          key={activeEntry?.id ?? "empty"}
          entry={activeEntry}
          previewSetup={previewSetup}
          canOpenInEditor={canOpenInEditor}
        />
      </div>
    </div>
  );
};
