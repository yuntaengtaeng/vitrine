import type { ControlOption, FrameControl } from "@vitrine/protocol";

// 옵션이 많으면 이름 칸을 넘치므로 앞 몇 개와 남은 개수만 표시
const MAX_LISTED_OPTIONS = 3;

const optionLiteral = (option: ControlOption) => (typeof option === "string" ? `"${option}"` : String(option));

/** 값을 비울 수 있는지 판단, 타입으로 확인된 optional이거나 처음 값이 없는 control */
export function canUnset(control: FrameControl): boolean {
  // 직접 선언한 control은 기본값이 없어 첫 선택지를 고른 것처럼 보이지만 실제 값은 비어 있음
  return control.optional || control.defaultValue === undefined;
}

/** prop 이름 아래 보여줄 TypeScript 형태의 타입 */
export function controlTypeLabel(control: FrameControl): string {
  if (control.type === "text") return "string";
  if (control.type === "number" || control.type === "boolean") return control.type;

  const options = control.options ?? [];
  const listed = options.slice(0, MAX_LISTED_OPTIONS).map(optionLiteral);
  const rest = options.length - listed.length;
  return rest > 0 ? `${listed.join(" | ")} | ${rest} more` : listed.join(" | ");
}
