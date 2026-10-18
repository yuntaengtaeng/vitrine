import type { FrameArgValue, FrameArgs, FrameControl, FrameLayout } from "@vitrine/protocol";

// 칸마다 프리뷰를 하나씩 렌더링하므로 이보다 많으면 일부만 그리지 않고 거절
export const MAX_MATRIX_CELLS = 36;

export interface MatrixAxis {
  name: string;
  values: Exclude<FrameArgValue, null>[];
}

/** 고른 축 이름, 고르지 않았거나(undefined) 지금 프리뷰에 없으면 앞의 축으로 채움 */
export interface MatrixChoice {
  rows?: string;
  /** null은 열 없이 한 줄로 */
  columns?: string | null;
}

export type MatrixPlan =
  | { kind: "ready"; layout: FrameLayout; rows: MatrixAxis; columns: MatrixAxis | null }
  | { kind: "tooMany"; count: number }
  | { kind: "noAxis" };

/** union과 boolean prop만 축이 됨, 선택지가 하나뿐이면 축으로 쓸 의미가 없음 */
export function matrixAxes(controls: Record<string, FrameControl>): MatrixAxis[] {
  return Object.entries(controls).flatMap(([name, control]): MatrixAxis[] => {
    if (control.type === "boolean") return [{ name, values: [false, true] }];
    if ((control.type === "select" || control.type === "radio") && (control.options?.length ?? 0) > 1) {
      return [{ name, values: control.options ?? [] }];
    }
    return [];
  });
}

const label = (name: string, value: FrameArgValue) => `${name}=${String(value)}`;

/** 고른 축을 지금 프리뷰의 축으로 해석, 행과 열은 겹치지 않음 */
export function resolveMatrixAxes(
  axes: readonly MatrixAxis[],
  choice: MatrixChoice,
): { rows: MatrixAxis; columns: MatrixAxis | null } | null {
  const rows = axes.find((axis) => axis.name === choice.rows) ?? axes[0];
  if (!rows) return null;
  const others = axes.filter((axis) => axis.name !== rows.name);
  const columns =
    choice.columns === null ? null : (others.find((axis) => axis.name === choice.columns) ?? others[0] ?? null);
  return { rows, columns };
}

/** 고른 축으로 칸을 만들고 바꾼 값과 고른 variant 위에 축 값을 덮어씀 */
export function planMatrix(
  axes: readonly MatrixAxis[],
  choice: MatrixChoice,
  base: { variantKey: string | null; overrides: FrameArgs },
): MatrixPlan {
  const resolved = resolveMatrixAxes(axes, choice);
  if (!resolved) return { kind: "noAxis" };
  const { rows, columns } = resolved;

  const columnValues: (Exclude<FrameArgValue, null> | undefined)[] = columns ? columns.values : [undefined];
  const count = rows.values.length * columnValues.length;
  if (count > MAX_MATRIX_CELLS) return { kind: "tooMany", count };

  const cells = rows.values.flatMap((row) =>
    columnValues.map((column) => ({
      key: `${String(row)}|${String(column)}`,
      label: columns && column !== undefined ? `${label(rows.name, row)}, ${label(columns.name, column)}` : label(rows.name, row),
      variantKey: base.variantKey,
      args: { ...base.overrides, [rows.name]: row, ...(columns && column !== undefined ? { [columns.name]: column } : {}) },
    })),
  );
  return { kind: "ready", layout: { kind: "grid", cells, columns: columnValues.length }, rows, columns };
}
