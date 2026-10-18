import { describe, expect, it } from "vitest";
import { groupSegments } from "./previewGroup";

describe("groupSegments", () => {
  it("빈 구간을 버리고 / 경로를 group 이름 목록으로 분리", () => {
    expect(groupSegments("Inputs//Forms/")).toEqual(["Inputs", "Forms"]);
  });

  it("group이 없으면 빈 목록", () => {
    expect(groupSegments(undefined)).toEqual([]);
  });
});
