import type { ControlOption, FrameControl } from "@vitrine/protocol";

// 옵션이 많으면 이름 칸을 넘치므로 앞 몇 개와 남은 개수만 표시
const MAX_LISTED_OPTIONS = 3;

const optionLiteral = (option: ControlOption) => (typeof option === "string" ? `"${option}"` : String(option));

/** prop 이름 아래 보여줄 TypeScript 형태의 타입 */
export function controlTypeLabel(control: FrameControl): string {
  if (control.type === "text") return "string";
  if (control.type === "number" || control.type === "boolean") return control.type;

  const options = control.options ?? [];
  const listed = options.slice(0, MAX_LISTED_OPTIONS).map(optionLiteral);
  const rest = options.length - listed.length;
  return rest > 0 ? `${listed.join(" | ")} | ${rest} more` : listed.join(" | ");
}
