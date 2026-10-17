import { describe, expect, it } from "vitest";
import { buildSidebarTree, countSidebarEntries, filterSidebarTree, groupSegments } from "./sidebarGroups";

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

describe("filterSidebarTree", () => {
  const entries = [
    makeEntry("Badge"),
    makeEntry("Primary", "Inputs/Buttons"),
    makeEntry("Danger", "Inputs/Buttons"),
    makeEntry("TextField", "Inputs"),
  ];
  const tree = buildSidebarTree(entries);

  it("빈 검색어는 트리를 그대로 반환", () => {
    expect(filterSidebarTree(tree, "  ")).toBe(tree);
  });

  it("entry 이름을 대소문자 구분 없이 찾고 상위 group 경로는 유지", () => {
    expect(filterSidebarTree(tree, "danger")).toEqual([
      {
        type: "group",
        key: "Inputs",
        label: "Inputs",
        children: [
          { type: "group", key: "Inputs/Buttons", label: "Buttons", children: [{ type: "entry", entry: entries[2] }] },
        ],
      },
    ]);
  });

  it("group 이름이 맞으면 그 group의 entry를 모두 유지", () => {
    expect(countSidebarEntries(filterSidebarTree(tree, "buttons"))).toBe(2);
  });

  it("맞는 entry가 없는 group은 제거", () => {
    expect(filterSidebarTree(tree, "badge")).toEqual([{ type: "entry", entry: entries[0] }]);
  });

  it("아무것도 맞지 않으면 빈 트리 반환", () => {
    expect(filterSidebarTree(tree, "missing")).toEqual([]);
  });
});

describe("countSidebarEntries", () => {
  it("중첩 group 안의 entry까지 셈", () => {
    const tree = buildSidebarTree([makeEntry("A"), makeEntry("B", "X/Y"), makeEntry("C", "X")]);
    expect(countSidebarEntries(tree)).toBe(3);
  });
});

describe("groupSegments", () => {
  it("빈 구간을 버리고 / 경로를 group 이름 목록으로 분리", () => {
    expect(groupSegments("Inputs//Forms/")).toEqual(["Inputs", "Forms"]);
  });

  it("group이 없으면 빈 목록", () => {
    expect(groupSegments(undefined)).toEqual([]);
  });
});
