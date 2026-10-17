import { groupSegments } from "../../shared/previewGroup";

export interface SidebarGroupNode {
  type: "group";
  key: string;
  label: string;
  children: SidebarNode[];
}

export interface SidebarEntryNode {
  type: "entry";
  entry: GalleryPreviewEntry;
}

export type SidebarNode = SidebarGroupNode | SidebarEntryNode;

/** entry.group의 / 경로를 따라 중첩 그룹 트리 구성, group 없는 entry는 최상위에 그대로 남음 */
export function buildSidebarTree(entries: GalleryPreviewEntry[]): SidebarNode[] {
  const roots: SidebarNode[] = [];
  const groupsByPath = new Map<string, SidebarGroupNode>();

  for (const entry of entries) {
    const segments = groupSegments(entry.group);
    let children = roots;
    let path = "";

    for (const segment of segments) {
      path = path ? `${path}/${segment}` : segment;
      let group = groupsByPath.get(path);
      if (!group) {
        group = { type: "group", key: path, label: segment, children: [] };
        groupsByPath.set(path, group);
        children.push(group);
      }
      children = group.children;
    }

    children.push({ type: "entry", entry });
  }

  return entriesBeforeGroups(roots);
}

// 파일과 폴더처럼 같은 단계에서 group 없는 entry를 먼저 모아 섞여 보이지 않게 함
function entriesBeforeGroups(nodes: SidebarNode[]): SidebarNode[] {
  const entries = nodes.filter((node) => node.type === "entry");
  const groups = nodes
    .filter((node) => node.type === "group")
    .map((group) => ({ ...group, children: entriesBeforeGroups(group.children) }));
  return [...entries, ...groups];
}

/** 검색어가 entry 이름이나 group 이름에 포함된 node만 남긴 트리 반환 (group 이름이 맞으면 하위 전체 유지) */
export function filterSidebarTree(nodes: SidebarNode[], query: string): SidebarNode[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return nodes;
  const matches = (text: string) => text.toLowerCase().includes(needle);

  return nodes.flatMap((node): SidebarNode[] => {
    if (node.type === "entry") return matches(node.entry.name) ? [node] : [];
    if (matches(node.label)) return [node];
    const children = filterSidebarTree(node.children, needle);
    return children.length > 0 ? [{ ...node, children }] : [];
  });
}

/** 트리 안의 entry 수 */
export function countSidebarEntries(nodes: SidebarNode[]): number {
  return nodes.reduce((count, node) => count + (node.type === "entry" ? 1 : countSidebarEntries(node.children)), 0);
}
