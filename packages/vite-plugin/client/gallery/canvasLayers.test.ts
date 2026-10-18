import { describe, expect, it } from "vitest";
import { canvasLayers } from "./canvasLayers";

const entry = (id: string): GalleryPreviewEntry => ({
  id,
  name: id,
  file: `${id}.tsx`,
  exportName: id,
  controls: {},
  load: async () => ({}),
});
const entries = [entry("A"), entry("B")];
const summary = (layers: ReturnType<typeof canvasLayers>) => layers.map((layer) => `${layer.entry.id}:${layer.pending}`);

describe("canvasLayers", () => {
  it("같은 프리뷰면 한 층만 보임", () => {
    expect(summary(canvasLayers(entries, "A", "A"))).toEqual(["A:false"]);
  });

  it("바꾸는 중이면 지금 화면을 두고 다음 프리뷰를 숨겨 띄움", () => {
    expect(summary(canvasLayers(entries, "A", "B"))).toEqual(["A:false", "B:true"]);
  });

  it("보이던 프리뷰가 사라졌거나 처음이면 바로 보여줌", () => {
    expect(summary(canvasLayers(entries, "gone", "B"))).toEqual(["B:false"]);
    expect(summary(canvasLayers(entries, null, "A"))).toEqual(["A:false"]);
    expect(summary(canvasLayers([], null, null))).toEqual([]);
  });
});
