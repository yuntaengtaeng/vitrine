import fs from "node:fs";
import path from "node:path";
import type { ControlOption, PropControl, PropControls } from "@vitrine/protocol";
import ts from "typescript";

export type { ControlOption, PropControl, PropControls } from "@vitrine/protocol";

export interface TypeContext {
  program: ts.Program;
  checker: ts.TypeChecker;
}

/** 루트의 tsconfig로 prop 타입 분석용 ts.Program 생성, tsconfig가 없으면 빈 Program */
export function createTypeContext(root: string): TypeContext {
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


export interface PropAnalysis {
  controls: PropControls;
  /** Gallery가 호출을 기록할 함수 prop 이름 */
  actions: string[];
}

const NO_PROPS: PropAnalysis = { controls: {}, actions: [] };

// Storybook 기본 규칙과 같이 on으로 시작하는 함수만, ComponentType 같은 render prop은 호출 기록 대상이 아님
const ACTION_NAME = /^on[A-Z]/;

/** export된 컴포넌트의 props 타입에서 Gallery control과 action prop을 추론 */
export function analyzeProps(file: string, exportName: string, context: TypeContext): PropAnalysis {
  const source = context.program.getSourceFile(file);
  const moduleSymbol = source && context.checker.getSymbolAtLocation(source);
  if (!source || !moduleSymbol) return NO_PROPS;

  const exported = context.checker
    .getExportsOfModule(moduleSymbol)
    .find((symbol) => symbol.name === exportName);
  if (!exported) return NO_PROPS;

  const symbol = exported.flags & ts.SymbolFlags.Alias
    ? context.checker.getAliasedSymbol(exported)
    : exported;
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  if (!declaration) return NO_PROPS;

  const componentType = context.checker.getTypeOfSymbolAtLocation(symbol, declaration);
  const signature = componentType.getCallSignatures()[0];
  const parameter = signature?.getParameters()[0];
  if (!parameter) return NO_PROPS;

  const parameterDeclaration = parameter.valueDeclaration ?? parameter.declarations?.[0] ?? declaration;
  const propsType = context.checker.getTypeOfSymbolAtLocation(parameter, parameterDeclaration);
  const controls: PropControls = {};
  const actions: string[] = [];

  for (const prop of context.checker.getPropertiesOfType(propsType)) {
    const propDeclaration = prop.valueDeclaration ?? prop.declarations?.[0] ?? parameterDeclaration;
    const propType = context.checker.getTypeOfSymbolAtLocation(prop, propDeclaration);
    if (ACTION_NAME.test(prop.name) && isFunctionType(propType)) {
      actions.push(prop.name);
      continue;
    }
    const optional = Boolean(prop.flags & ts.SymbolFlags.Optional);
    const control = toControl(propType, optional, context.checker);
    if (control) controls[prop.name] = control;
  }

  return { controls, actions };
}

function isFunctionType(type: ts.Type): boolean {
  const members = type.isUnion()
    ? type.types.filter((member) => !(member.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)))
    : [type];
  return members.length > 0 && members.every((member) => member.getCallSignatures().length > 0);
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
  if (literal !== undefined) {
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
