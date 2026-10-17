import type { GalleryConfig } from "@vitrine/protocol";
import { useState, type CSSProperties } from "react";
import { COLOR } from "../tokens/color";
import { usePreviewSelectionSync } from "./usePreviewSelectionSync";
import { useStageSettings } from "./features/stage/useStageSettings";
import { Sidebar } from "./features/sidebar/Sidebar";
import { Canvas } from "./Canvas";
import { isEmbeddedInFrame } from "./features/header/editorLink";

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

/** Gallery UI, 사용자 코드는 실행하지 않고 프리뷰 렌더링은 iframe frame에 맡김 (ADR 007) */
export const App = (props: { entries: GalleryPreviewEntry[]; config: GalleryConfig }) => {
  const { entries } = props;
  const [activeId, setActiveId] = usePreviewSelectionSync(entries);
  const activeEntry = entries.find((entry) => entry.id === activeId);
  // VS Code panel 안에서는 옆에 에디터가 있고, 바깥에서 에디터를 실행하면 새 창이 뜰 수 있어 숨김
  const [canOpenInEditor] = useState(() => !isEmbeddedInFrame(window));
  // 프리뷰를 바꿔도 같은 배경과 너비로 비교할 수 있게 Canvas 밖에서 보관
  const [stage, updateStage] = useStageSettings();

  return (
    <div style={Styled.Root}>
      <Sidebar entries={entries} activeId={activeId} onSelect={setActiveId} />
      <div style={Styled.CanvasWrapper}>
        {activeEntry && (
          // 프리뷰마다 frame 연결과 variant, 바꾼 값을 새로 시작
          <Canvas
            key={activeEntry.id}
            entry={activeEntry}
            canOpenInEditor={canOpenInEditor}
            viewports={props.config.viewports}
            stage={stage}
            onStageChange={updateStage}
          />
        )}
      </div>
    </div>
  );
};
