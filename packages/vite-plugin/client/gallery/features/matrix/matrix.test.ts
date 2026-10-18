import { describe, expect, it } from "vitest";
import { MAX_MATRIX_CELLS, matrixAxes, planMatrix } from "./matrix";

const controls = {
  label: { type: "text" as const, optional: false },
  disabled: { type: "boolean" as const, optional: false },
  size: { type: "select" as const, options: ["sm", "md", "lg"], optional: false },
  tone: { type: "radio" as const, options: ["info"], optional: false },
};
const base = { variantKey: "primary", overrides: { label: "Go" } };

describe("matrixAxes", () => {
  it("boolean과 선택지가 둘 이상인 union만 축", () => {
    expect(matrixAxes(controls)).toEqual([
      { name: "disabled", values: [false, true] },
      { name: "size", values: ["sm", "md", "lg"] },
    ]);
  });
});

describe("planMatrix", () => {
  const axes = matrixAxes(controls);

  it("고르지 않으면 앞의 두 축으로 행과 열, 바꾼 값과 variant 위에 축 값을 덮어씀", () => {
    const plan = planMatrix(axes, {}, base);
    if (plan.kind !== "ready") throw new Error(plan.kind);
    expect(plan.layout).toMatchObject({ kind: "grid", columns: 3 });
    if (plan.layout.kind !== "grid") throw new Error("grid");
    expect(plan.layout.cells).toHaveLength(6);
    expect(plan.layout.cells[1]).toEqual({
      key: "false|md",
      label: "disabled=false, size=md",
      variantKey: "primary",
      args: { label: "Go", disabled: false, size: "md" },
    });
  });

  it("열을 None으로 고르면 행 축 한 줄", () => {
    const plan = planMatrix(axes, { rows: "size", columns: null }, base);
    if (plan.kind !== "ready" || plan.layout.kind !== "grid") throw new Error("ready grid");
    expect(plan.layout.columns).toBe(1);
    expect(plan.layout.cells.map((cell) => cell.label)).toEqual(["size=sm", "size=md", "size=lg"]);
  });

  it("없는 축 이름은 앞의 축으로 대신하고 행과 열은 겹치지 않음", () => {
    const plan = planMatrix(axes, { rows: "size", columns: "size" }, base);
    if (plan.kind !== "ready") throw new Error(plan.kind);
    expect([plan.rows.name, plan.columns?.name]).toEqual(["size", "disabled"]);
  });

  it(`칸이 ${MAX_MATRIX_CELLS}개를 넘으면 그리지 않고 칸 수를 알림`, () => {
    const many = [
      { name: "a", values: ["1", "2", "3", "4", "5", "6", "7"] },
      { name: "b", values: ["1", "2", "3", "4", "5", "6"] },
    ];
    expect(planMatrix(many, {}, base)).toEqual({ kind: "tooMany", count: 42 });
  });

  it("축이 없으면 noAxis", () => {
    expect(planMatrix([], {}, base)).toEqual({ kind: "noAxis" });
  });
});
