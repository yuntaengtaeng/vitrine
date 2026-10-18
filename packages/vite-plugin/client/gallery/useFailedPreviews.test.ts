import { describe, expect, it } from "vitest";
import { withPreviewFailure } from "./useFailedPreviews";

describe("withPreviewFailure", () => {
  it("실패하면 추가하고 복구되면 제거", () => {
    const failed = withPreviewFailure(new Set(), "Button", true);
    expect([...failed]).toEqual(["Button"]);
    expect([...withPreviewFailure(failed, "Button", false)]).toEqual([]);
  });

  it("상태가 같으면 같은 Set 반환", () => {
    const failed = new Set(["Button"]);
    expect(withPreviewFailure(failed, "Button", true)).toBe(failed);
    expect(withPreviewFailure(failed, "Badge", false)).toBe(failed);
  });
});
