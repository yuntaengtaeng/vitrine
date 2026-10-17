import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveEditorTarget, toViteOpenInEditorUrl } from "./open-in-editor.js";

const root = path.resolve("/project");
const entries = [
  { id: "src/Button.tsx#Button", file: "src/Button.tsx", startLine: 12 },
  { id: "src/Card.tsx#default", file: "src/Card.tsx", startLine: 3 },
];

describe("resolveEditorTarget", () => {
  it("preview id를 Vite root 기준 절대 경로와 시작 줄, 열로 변환", () => {
    expect(resolveEditorTarget(entries, root, "src/Button.tsx#Button")).toBe(
      `${path.resolve(root, "src/Button.tsx")}:12:1`,
    );
  });

  it("목록에 없는 id는 null", () => {
    expect(resolveEditorTarget(entries, root, "src/Missing.tsx#Missing")).toBeNull();
  });
});

describe("toViteOpenInEditorUrl", () => {
  it("id query를 Vite 내장 경로의 file query로 변환", () => {
    const url = toViteOpenInEditorUrl("/__vitrine/open-in-editor?id=src%2FCard.tsx%23default", entries, root);
    expect(url).toBe(`/__open-in-editor?file=${encodeURIComponent(`${path.resolve(root, "src/Card.tsx")}:3:1`)}`);
  });

  it("id가 없거나 모르는 preview면 null", () => {
    expect(toViteOpenInEditorUrl("/__vitrine/open-in-editor", entries, root)).toBeNull();
    expect(toViteOpenInEditorUrl("/__vitrine/open-in-editor?id=nope", entries, root)).toBeNull();
  });
});
