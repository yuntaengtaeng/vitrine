export type ExhibitTone = "primary" | "danger" | "ghost";

export interface Exhibit {
  id: string;
  name: string;
  group: string;
  tone: ExhibitTone;
  label: string;
}

/** Hero 진열장에 차례로 전시되는 프리뷰, 에디터의 @preview 선언과 1:1로 대응 */
export const EXHIBITS: Exhibit[] = [
  { id: "primary", name: "Primary", group: "Inputs", tone: "primary", label: "Save" },
  { id: "danger", name: "Danger", group: "Inputs", tone: "danger", label: "Delete" },
  { id: "ghost", name: "Ghost", group: "Inputs", tone: "ghost", label: "Cancel" },
];

/** 전시품 번호 표기, 1부터 시작하는 두 자리 */
export function exhibitNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}
