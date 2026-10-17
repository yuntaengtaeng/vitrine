/** entry.group의 / 경로를 빈 구간 없이 group 이름 목록으로 분리, sidebar 트리와 머리말 경로가 공유 */
export function groupSegments(group: string | undefined): string[] {
  return group ? group.split("/").filter((segment) => segment.length > 0) : [];
}
