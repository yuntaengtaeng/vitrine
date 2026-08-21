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
    const segments = entry.group ? entry.group.split("/").filter((segment) => segment.length > 0) : [];
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

  return roots;
}
