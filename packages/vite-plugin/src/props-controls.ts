import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

export type ControlOption = string | number;

export interface PropControl {
  type: "text" | "number" | "boolean" | "select";
  options?: ControlOption[];
  optional: boolean;
  defaultValue?: string | number | boolean;
}

export type PropControls = Record<string, PropControl>;

export interface TypeContext {
  program: ts.Program;
  checker: ts.TypeChecker;
}

function buildTypeContext(root: string): TypeContext {
  const configPath = ts.findConfigFile(root, fs.existsSync, "tsconfig.json");
  if (!configPath) {
    const program = ts.createProgram([], { jsx: ts.JsxEmit.ReactJSX, allowJs: true });
    return { program, checker: program.getTypeChecker() };
  }

  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath));
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  return { program, checker: program.getTypeChecker() };
}

// ts.createProgram()이 tsconfig 전체를 다시 읽어들이는 비용이 커서(예제 9개
// 파일 기준 Babel 스캔의 17배), 루트별로 한 번 만든 프로그램을 재사용하고
// invalidateTypeContext로 명시적으로 무효화될 때만 다시 만듦
const typeContextCache = new Map<string, TypeContext>();

/** 루트 기준 캐시된 ts.Program, 없으면 새로 만들어 캐시 */
export function getTypeContext(root: string): TypeContext {
  const cached = typeContextCache.get(root);
  if (cached) return cached;
  const context = buildTypeContext(root);
  typeContextCache.set(root, context);
  return context;
}

/** 루트의 캐시된 ts.Program 무효화, 다음 getTypeContext 호출에서 재생성 */
export function invalidateTypeContext(root: string): void {
  typeContextCache.delete(root);
}

export function getPropControls(file: string, exportName: string, context: TypeContext): PropControls {
  const source = context.program.getSourceFile(file);
  const moduleSymbol = source && context.checker.getSymbolAtLocation(source);
  if (!source || !moduleSymbol) return {};

  const exported = context.checker
    .getExportsOfModule(moduleSymbol)
    .find((symbol) => symbol.name === exportName);
  if (!exported) return {};

  const symbol = exported.flags & ts.SymbolFlags.Alias
    ? context.checker.getAliasedSymbol(exported)
    : exported;
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  if (!declaration) return {};

  const componentType = context.checker.getTypeOfSymbolAtLocation(symbol, declaration);
  const signature = componentType.getCallSignatures()[0];
  const parameter = signature?.getParameters()[0];
  if (!parameter) return {};

  const parameterDeclaration = parameter.valueDeclaration ?? parameter.declarations?.[0] ?? declaration;
  const propsType = context.checker.getTypeOfSymbolAtLocation(parameter, parameterDeclaration);
  const controls: PropControls = {};

  for (const prop of context.checker.getPropertiesOfType(propsType)) {
    const propDeclaration = prop.valueDeclaration ?? prop.declarations?.[0] ?? parameterDeclaration;
    const propType = context.checker.getTypeOfSymbolAtLocation(prop, propDeclaration);
    const optional = Boolean(prop.flags & ts.SymbolFlags.Optional);
    const control = toControl(propType, optional, context.checker);
    if (control) controls[prop.name] = control;
  }

  return controls;
}

function toControl(type: ts.Type, optional: boolean, checker: ts.TypeChecker): PropControl | null {
  const members = type.isUnion()
    ? type.types.filter((member) => !(member.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)))
    : [type];

  const options = members.map(literalValue);
  if (members.length > 1 && options.every((value) => value !== undefined)) {
    const values = options as ControlOption[];
    return {
      type: "select",
      options: values,
      optional,
      ...(!optional && values.length > 0 ? { defaultValue: values[0] } : {}),
    };
  }

  const effective = members[0] ?? type;
  const literal = literalValue(effective);
  if (typeof literal === "string") {
    return { type: "select", options: [literal], optional, ...(!optional ? { defaultValue: literal } : {}) };
  }
  if (typeof literal === "number") {
    return { type: "select", options: [literal], optional, ...(!optional ? { defaultValue: literal } : {}) };
  }
  if (effective.flags & ts.TypeFlags.BooleanLike) {
    return { type: "boolean", optional, ...(!optional ? { defaultValue: false } : {}) };
  }
  if (effective.flags & ts.TypeFlags.StringLike) {
    return { type: "text", optional, ...(!optional ? { defaultValue: "" } : {}) };
  }
  if (effective.flags & ts.TypeFlags.NumberLike) {
    return { type: "number", optional, ...(!optional ? { defaultValue: 0 } : {}) };
  }

  // Resolve enum aliases to their literal union when TypeScript exposes one.
  const apparent = checker.getApparentType(effective);
  if (apparent !== effective) return toControl(apparent, optional, checker);
  return null;
}

function literalValue(type: ts.Type): ControlOption | undefined {
  if (type.isStringLiteral()) return type.value;
  if (type.isNumberLiteral()) return type.value;
  return undefined;
}
