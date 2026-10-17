const MAX_INLINE_LENGTH = 72;

function propSource(name: string, value: unknown): string | null {
  if (value === true) return name;
  if (value === false || typeof value === "number") return `${name}={${String(value)}}`;
  if (typeof value !== "string") return null;
  // 따옴표나 줄바꿈이 있으면 JSX 속성 문자열로 쓸 수 없어 표현식으로 감쌈
  return /["\n{}]/.test(value) ? `${name}={${JSON.stringify(value)}}` : `${name}="${value}"`;
}

/** Gallery가 아는 args로 프리뷰를 그리는 JSX */
export function jsxSnippet(componentName: string, args: Record<string, unknown>): string {
  const { children, ...rest } = args;
  const props = Object.entries(rest)
    .map(([name, value]) => propSource(name, value))
    .filter((prop): prop is string => prop !== null);
  const text = typeof children === "string" && children.length > 0 ? children : null;

  const inline = props.length > 0 ? ` ${props.join(" ")}` : "";
  const inlineTag = text ? `<${componentName}${inline}>${text}</${componentName}>` : `<${componentName}${inline} />`;
  if (inlineTag.length <= MAX_INLINE_LENGTH && !text?.includes("\n")) return inlineTag;

  const attributes = props.map((prop) => `  ${prop}`).join("\n");
  if (!text) return `<${componentName}\n${attributes}\n/>`;
  const opening = props.length > 0 ? `<${componentName}\n${attributes}\n>` : `<${componentName}>`;
  return `${opening}\n  ${text.split("\n").join("\n  ")}\n</${componentName}>`;
}
