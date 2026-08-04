import type { CSSProperties } from "react";
import { COLOR } from "../tokens/color";
import { FONT_SIZE } from "../tokens/fontSize";
import { usePreviewSelectionSync } from "../hooks/usePreviewSelectionSync";
import { SidebarItem } from "./SidebarItem";
import { Canvas } from "./Canvas";

const Styled = {
  Root: {
    display: "flex",
    height: "100vh",
    margin: 0,
    fontFamily: "system-ui, sans-serif",
    background: "white",
  } satisfies CSSProperties,
  Sidebar: {
    width: 240,
    flexShrink: 0,
    overflowY: "auto",
    background: "white",
    borderRight: `1px solid ${COLOR.border}`,
    padding: "0.75rem",
    boxSizing: "border-box",
  } satisfies CSSProperties,
  SidebarLabel: {
    fontSize: FONT_SIZE.label,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: COLOR.label,
    padding: "0.4rem 0.7rem 0.7rem",
  } satisfies CSSProperties,
  CanvasWrapper: {
    flex: 1,
    overflow: "auto",
    padding: "2.5rem",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
  } satisfies CSSProperties,
  CanvasBody: {
    padding: "2rem",
    minWidth: 200,
    minHeight: 80,
    boxSizing: "border-box",
  } satisfies CSSProperties,
  EmptyState: {
    color: COLOR.muted,
    fontSize: FONT_SIZE.secondary,
    padding: "0 0.7rem",
  } satisfies CSSProperties,
};

export const App = (props: { entries: GalleryPreviewEntry[] }) => {
  const { entries } = props;
  const [activeId, setActiveId] = usePreviewSelectionSync(entries);
  const activeEntry = entries.find((entry) => entry.id === activeId);

  return (
    <div style={Styled.Root}>
      <div style={Styled.Sidebar}>
        <div style={Styled.SidebarLabel}>Previews</div>
        {entries.length === 0 && (
          <p style={Styled.EmptyState}>
            No @preview exports found yet. Add a `/** @preview */` comment above an export.
          </p>
        )}
        {entries.map((entry) => (
          <SidebarItem key={entry.id} entry={entry} isActive={entry.id === activeId} onSelect={setActiveId} />
        ))}
      </div>
      <div style={Styled.CanvasWrapper}>
        <div style={Styled.CanvasBody}>
          <Canvas entry={activeEntry} />
        </div>
      </div>
    </div>
  );
};
