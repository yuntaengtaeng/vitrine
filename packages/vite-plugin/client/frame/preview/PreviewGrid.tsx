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
  Labels: { display: "flex", gap: "1rem" } satisfies CSSProperties,
  Stack: { position: "relative", width: "100%" } satisfies CSSProperties,
  // 아래 칸과 어긋난 곳이 보이도록 위 칸을 반투명하게 겹침
  Above: { position: "absolute", inset: 0, opacity: 0.5, pointerEvents: "none" } satisfies CSSProperties,
};

export const PreviewGrid = (props: {
  cells: FrameGridCell[];
  columns?: number;
  overlay?: boolean;
  renderCell: (cell: FrameGridCell) => ReactNode;
}) => {
  if (props.overlay) {
    const [below, ...above] = props.cells;
    return (
      <div style={Styled.Cell}>
        <div style={Styled.Labels}>
          {props.cells.map((cell, index) => (
            <span key={cell.key} style={Styled.Label}>
              {index === 0 ? cell.label : `${cell.label}, 50% over`}
            </span>
          ))}
        </div>
        <div style={Styled.Stack}>
          {below && (
            <section aria-label={below.label} data-grid-cell={below.key}>
              {props.renderCell(below)}
            </section>
          )}
          {above.map((cell) => (
            <section key={cell.key} aria-label={cell.label} data-grid-cell={cell.key} style={Styled.Above}>
              {props.renderCell(cell)}
            </section>
          ))}
        </div>
      </div>
    );
  }

  return (
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
};
