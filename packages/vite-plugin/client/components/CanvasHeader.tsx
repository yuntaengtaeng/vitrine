import type { CSSProperties } from "react";
import { COLOR } from "../tokens/color";
import { FONT_SIZE } from "../tokens/fontSize";
import { FIELD_BORDER, FIELD_BORDER_RADIUS } from "./controls/fieldStyle";
import { openInEditor } from "./editorLink";
import { groupSegments } from "./sidebarGroups";

const Styled = {
  Root: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "0.8rem 1.25rem",
    borderBottom: `1px solid ${COLOR.border}`,
  } satisfies CSSProperties,
  Titles: { display: "grid", gap: 2, minWidth: 0 } satisfies CSSProperties,
  Group: { fontSize: FONT_SIZE.label, color: COLOR.label } satisfies CSSProperties,
  Name: { margin: 0, fontSize: "1rem", fontWeight: 650, color: COLOR.body } satisfies CSSProperties,
  Meta: { display: "flex", alignItems: "center", gap: "0.6rem", marginLeft: "auto", minWidth: 0 } satisfies CSSProperties,
  File: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: FONT_SIZE.label,
    color: COLOR.muted,
  } satisfies CSSProperties,
  Button: {
    flexShrink: 0,
    padding: "0.3rem 0.7rem",
    border: FIELD_BORDER,
    borderRadius: FIELD_BORDER_RADIUS,
    background: COLOR.surface,
    color: COLOR.body,
    fontFamily: "inherit",
    fontSize: FONT_SIZE.label,
    cursor: "pointer",
  } satisfies CSSProperties,
};

export const CanvasHeader = (props: { entry: GalleryPreviewEntry; canOpenInEditor: boolean }) => {
  const { entry } = props;
  const groups = groupSegments(entry.group);
  return (
    <header style={Styled.Root}>
      <div style={Styled.Titles}>
        {groups.length > 0 && <span style={Styled.Group}>{groups.join(" / ")}</span>}
        <h1 style={Styled.Name}>{entry.name}</h1>
      </div>
      <div style={Styled.Meta}>
        <code style={Styled.File} title={entry.file}>
          {entry.file}
        </code>
        {props.canOpenInEditor && (
          <button type="button" style={Styled.Button} onClick={() => openInEditor(entry.id)}>
            Open in editor
          </button>
        )}
      </div>
    </header>
  );
};
