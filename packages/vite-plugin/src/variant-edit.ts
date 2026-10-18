import { parse } from "@babel/parser";
import type * as t from "@babel/types";
import type { TextEdit } from "@vitrine/protocol";

const PREVIEW_MODULE = "vite-plugin-react-vitrine/preview";
const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export type VariantArgs = Record<string, string | number | boolean>;

export type VariantEditPlan = { ok: true; key: string; edits: TextEdit[] } | { ok: false; reason: string };

/** 표시 이름을 variants 객체의 key로, 식별자로 쓸 수 없는 문자는 단어 경계로 봄 */
export function variantKeyFor(name: string): string {
  const words = name.match(/[A-Za-z0-9]+/g) ?? [];
  const key = words
    .map((word, index) => (index === 0 ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1)))
    .join("");
  return /^[A-Za-z]/.test(key) ? key : `variant${key}`;
}

function objectLiteral(values: VariantArgs): string {
  const entries = Object.entries(values).map(
    ([name, value]) => `${IDENTIFIER.test(name) ? name : JSON.stringify(name)}: ${JSON.stringify(value)}`,
  );
  return entries.length > 0 ? `{ ${entries.join(", ")} }` : "{}";
}

const variantEntry = (key: string, name: string, args: VariantArgs) =>
  `${key}: { name: ${JSON.stringify(name)}, args: ${objectLiteral(args)} }`;

function propertyName(property: t.ObjectExpression["properties"][number]): string | null {
  if (property.type !== "ObjectProperty") return null;
  if (property.key.type === "Identifier") return property.key.name;
  if (property.key.type === "StringLiteral") return property.key.value;
  return null;
}

const exportedName = (node: t.Identifier | t.StringLiteral) => (node.type === "Identifier" ? node.name : node.value);

/** export 이름이 가리키는 파일 안의 지역 이름, 익명 default export면 null */
function localNameOf(program: t.Program, exportName: string): string | null {
  for (const statement of program.body) {
    if (exportName === "default" && statement.type === "ExportDefaultDeclaration") {
      const declaration = statement.declaration;
      if (declaration.type === "Identifier") return declaration.name;
      if ((declaration.type === "FunctionDeclaration" || declaration.type === "ClassDeclaration") && declaration.id) {
        return declaration.id.name;
      }
      return null;
    }
    if (statement.type !== "ExportNamedDeclaration") continue;
    for (const specifier of statement.specifiers) {
      if (specifier.type === "ExportSpecifier" && exportedName(specifier.exported) === exportName) {
        return specifier.local.name;
      }
    }
  }
  return exportName === "default" ? null : exportName;
}

/** 이 파일에서 preview 함수를 부르는 이름, import하지 않았으면 null */
function previewImportName(program: t.Program): string | null {
  for (const statement of program.body) {
    if (statement.type !== "ImportDeclaration" || statement.source.value !== PREVIEW_MODULE) continue;
    for (const specifier of statement.specifiers) {
      if (specifier.type === "ImportSpecifier" && exportedName(specifier.imported) === "preview") {
        return specifier.local.name;
      }
    }
  }
  return null;
}

function findPreviewConfig(program: t.Program, previewName: string, componentName: string): t.ObjectExpression | null {
  for (const statement of program.body) {
    if (statement.type !== "ExpressionStatement" || statement.expression.type !== "CallExpression") continue;
    const call = statement.expression;
    const [component, config] = call.arguments;
    if (
      call.callee.type === "Identifier" &&
      call.callee.name === previewName &&
      component?.type === "Identifier" &&
      component.name === componentName &&
      config?.type === "ObjectExpression"
    ) {
      return config;
    }
  }
  return null;
}

const lineIndent = (source: string, offset: number) => {
  const lineStart = source.lastIndexOf("\n", offset - 1) + 1;
  return /^[ \t]*/.exec(source.slice(lineStart))?.[0] ?? "";
};

/** 객체 리터럴 끝에 속성을 더함, property는 그 속성 줄의 들여쓰기를 받아 여러 줄도 맞춰 씀 */
function appendProperty(source: string, object: t.ObjectExpression, property: (indent: string) => string): TextEdit {
  const last = object.properties.at(-1);
  if (last?.start != null && last.end != null) {
    const indent = lineIndent(source, last.start);
    return { start: last.end, end: last.end, text: `,\n${indent}${property(indent)}` };
  }
  const open = object.start ?? 0;
  const outer = lineIndent(source, open);
  const indent = `${outer}  `;
  return { start: open + 1, end: open + 1, text: `\n${indent}${property(indent)},\n${outer}` };
}

/**
 * 프리뷰의 지금 args를 이름 붙은 variant로 저장하는 편집 계산 (Save as variant)
 * preview() 설정이 있으면 그 variants에 더하고, 없으면 이름 있는 export에 한해 preview() 호출을 만듦
 */
export function planVariantEdit(source: string, exportName: string, name: string, args: VariantArgs): VariantEditPlan {
  let program: t.Program;
  try {
    program = parse(source, { sourceType: "module", plugins: ["jsx", "typescript"] }).program;
  } catch {
    return { ok: false, reason: "The file has a syntax error. Fix it and try again" };
  }
  const componentName = localNameOf(program, exportName);
  if (!componentName) {
    return { ok: false, reason: "An anonymous default export cannot get variants. Give the component a name first" };
  }

  const key = variantKeyFor(name);
  const entry = variantEntry(key, name, args);
  const previewName = previewImportName(program);
  const config = previewName ? findPreviewConfig(program, previewName, componentName) : null;

  if (config) {
    const variants = config.properties.find((property) => propertyName(property) === "variants");
    if (!variants) {
      const edit = appendProperty(source, config, (indent) => `variants: {\n${indent}  ${entry},\n${indent}}`);
      return { ok: true, key, edits: [edit] };
    }
    if (variants.type !== "ObjectProperty" || variants.value.type !== "ObjectExpression") {
      return { ok: false, reason: "variants in preview() is not an object literal, so it cannot be edited" };
    }
    if (variants.value.properties.some((property) => propertyName(property) === key)) {
      return { ok: false, reason: `A variant named "${key}" already exists` };
    }
    return { ok: true, key, edits: [appendProperty(source, variants.value, () => entry)] };
  }

  const call = `${previewName ?? "preview"}(${componentName}, {\n  variants: {\n    ${entry},\n  },\n});\n`;
  const edits: TextEdit[] = [
    { start: source.length, end: source.length, text: source.endsWith("\n") ? `\n${call}` : `\n\n${call}` },
  ];
  if (!previewName) edits.unshift({ start: 0, end: 0, text: `import { preview } from "${PREVIEW_MODULE}";\n` });
  return { ok: true, key, edits };
}
