import { describe, expect, it } from "vitest";
import { buildSidebarTree } from "./sidebarGroups";

function makeEntry(id: string, group?: string): GalleryPreviewEntry {
  return { id, name: id, group, file: `${id}.tsx`, exportName: "default", controls: {}, load: async () => ({}) };
}

describe("buildSidebarTree", () => {
  it("group 없는 entry는 최상위에 그대로 배치", () => {
    const entries = [makeEntry("Button"), makeEntry("Badge")];
    const tree = buildSidebarTree(entries);
    expect(tree).toEqual([
      { type: "entry", entry: entries[0] },
      { type: "entry", entry: entries[1] },
    ]);
  });

  it("같은 group의 entry를 하나의 그룹 노드로 묶음", () => {
    const entries = [makeEntry("Danger", "Inputs"), makeEntry("Primary", "Inputs")];
    const tree = buildSidebarTree(entries);
    expect(tree).toEqual([
      {
        type: "group",
        key: "Inputs",
        label: "Inputs",
        children: [
          { type: "entry", entry: entries[0] },
          { type: "entry", entry: entries[1] },
        ],
      },
    ]);
  });

  it("여러 / 는 중첩 그룹 트리로 구성", () => {
    const entries = [makeEntry("Danger", "Inputs/Forms")];
    const tree = buildSidebarTree(entries);
    expect(tree).toEqual([
      {
        type: "group",
        key: "Inputs",
        label: "Inputs",
        children: [
          {
            type: "group",
            key: "Inputs/Forms",
            label: "Forms",
            children: [{ type: "entry", entry: entries[0] }],
          },
        ],
      },
    ]);
  });

  it("group 있는 entry와 없는 entry가 섞이면 각자 위치 유지", () => {
    const entries = [makeEntry("Badge"), makeEntry("Danger", "Inputs")];
    const tree = buildSidebarTree(entries);
    expect(tree).toEqual([
      { type: "entry", entry: entries[0] },
      {
        type: "group",
        key: "Inputs",
        label: "Inputs",
        children: [{ type: "entry", entry: entries[1] }],
      },
    ]);
  });
});
