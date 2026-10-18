import { createElement } from "react";
import { act, create } from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";
import { useActionArgs } from "./useActionArgs";
import type { Args } from "./previewConfig";

const names = ["onSave"];

const Probe = (props: { args: Args; onAction: (name: string, values: unknown[]) => void; expose: (args: Args) => void }) => {
  props.expose(useActionArgs(props.args, names, props.onAction));
  return null;
};

describe("useActionArgs", () => {
  it("호출을 알리고 args로 넘긴 함수도 실행해 결과를 돌려줌", () => {
    const onAction = vi.fn();
    const own = vi.fn(() => "saved");
    let args: Args = {};
    act(() => {
      create(createElement(Probe, { args: { label: "Go", onSave: own }, onAction, expose: (next) => (args = next) }));
    });

    const result = (args.onSave as (value: number) => unknown)(3);

    expect(onAction).toHaveBeenCalledWith("onSave", [3]);
    expect(own).toHaveBeenCalledWith(3);
    expect(result).toBe("saved");
    expect(args.label).toBe("Go");
  });

  it("args에 함수가 없어도 기록만 하고, 다시 렌더해도 같은 함수", () => {
    const onAction = vi.fn();
    const seen: Args[] = [];
    let renderer!: ReturnType<typeof create>;
    act(() => {
      renderer = create(createElement(Probe, { args: {}, onAction, expose: (next) => seen.push(next) }));
    });
    act(() => {
      renderer.update(createElement(Probe, { args: { label: "x" }, onAction, expose: (next) => seen.push(next) }));
    });

    (seen[0].onSave as () => void)();
    expect(onAction).toHaveBeenCalledWith("onSave", []);
    expect(seen[1].onSave).toBe(seen[0].onSave);
  });
});
