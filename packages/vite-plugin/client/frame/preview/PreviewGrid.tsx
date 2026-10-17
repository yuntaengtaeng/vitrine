import type { FrameGridCell } from "@vitrine/protocol";
import type { CSSProperties, ReactNode } from "react";

const Styled = {
  Grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "1.5rem",
    width: "100%",
  } satisfies CSSProperties,
  Cell: { display: "grid", alignContent: "start", gap: "0.6rem", minWidth: 0 } satisfies CSSProperties,
  Label: { color: "#5f6368", fontFamily: "system-ui, sans-serif", fontSize: "0.75rem" } satisfies CSSProperties,
  // 칸보다 넓은 컴포넌트는 잘라내지 않고 그 칸 안에서 가로로 스크롤
  Content: { overflowX: "auto" } satisfies CSSProperties,
};

export const PreviewGrid = (props: {
  cells: FrameGridCell[];
  columns?: number;
  renderCell: (cell: FrameGridCell) => ReactNode;
}) => (
  <div
    style={
      props.columns
        ? { ...Styled.Grid, gridTemplateColumns: `repeat(${props.columns}, minmax(160px, 1fr))` }
        : Styled.Grid
    }
  >
    {props.cells.map((cell) => (
      <section key={cell.key} style={Styled.Cell} aria-label={cell.label} data-grid-cell={cell.key}>
        <div style={Styled.Label}>{cell.label}</div>
        <div style={Styled.Content}>{props.renderCell(cell)}</div>
      </section>
    ))}
  </div>
);
