import fs from "node:fs";
import path from "node:path";
import type { ControlOption, PropControl, PropControls } from "@vitrine/protocol";
import ts from "typescript";

export type { ControlOption, PropControl, PropControls } from "@vitrine/protocol";

interface ProjectTypes {
  program: ts.Program;
  checker: ts.TypeChecker;
}

export interface TypeContext {
  /** 파일을 포함한 tsconfig 프로젝트의 타입 정보 조회, 어느 프로젝트에도 없으면 undefined */
  forFile(file: string): ProjectTypes | undefined;
}

interface TsProject {
  fileNames: string[];
  options: ts.CompilerOptions;
  fileKeys: Set<string>;
}

/** 루트 tsconfig와 references로 이어진 프로젝트별 prop 타입 분석 context 생성 */
export function createTypeContext(root: string): TypeContext {
  const configPath = ts.findConfigFile(root, fs.existsSync, "tsconfig.json");
  const projects = configPath ? collectProjects(configPath, new Set()) : [];
  const created = new Map<TsProject, ProjectTypes>();

  return {
    forFile(file) {
      const key = toFileKey(file);
      const project = projects.find((candidate) => candidate.fileKeys.has(key));
      if (!project) return undefined;
      let types = created.get(project);
      if (!types) {
        // app과 node 설정처럼 lib, jsx 옵션이 달라 프로젝트마다 Program을 따로 만듦
        const program = ts.createProgram(project.fileNames, project.options);
        types = { program, checker: program.getTypeChecker() };
        created.set(project, types);
      }
      return types;
    },
  };
}

// createProgram의 projectReferences 옵션은 참조 프로젝트를 빌드 산출물(.d.ts)로 읽어
// 빌드 전 프로젝트에서 TS6305가 나므로, references를 직접 따라가 소스로 Program 구성
function collectProjects(configPath: string, visited: Set<string>): TsProject[] {
  const configKey = toFileKey(configPath);
  if (visited.has(configKey)) return [];
  visited.add(configKey);

  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (!config.config) return [];
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath), undefined, configPath);
  const own: TsProject[] = parsed.fileNames.length > 0
    ? [{ fileNames: parsed.fileNames, options: parsed.options, fileKeys: new Set(parsed.fileNames.map(toFileKey)) }]
    : [];
  // 디렉터리를 가리키는 reference는 그 안의 tsconfig.json으로 해석해야 함
  const referenced = (parsed.projectReferences ?? []).flatMap((reference) =>
    collectProjects(ts.resolveProjectReferencePath(reference), visited),
  );
  return [...own, ...referenced];
}

// Windows는 드라이브 문자 대소문자와 구분자가 호출 경로마다 달라 비교 전에 정규화
function toFileKey(file: string): string {
  const normalized = path.resolve(file).split(path.sep).join("/");
  return ts.sys.useCaseSensitiveFileNames ? normalized : normalized.toLowerCase();
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
  const types = context.forFile(file);
  if (!types) return NO_PROPS;
  const { program, checker } = types;
  const source = program.getSourceFile(file);
  const moduleSymbol = source && checker.getSymbolAtLocation(source);
  if (!source || !moduleSymbol) return NO_PROPS;

  const exported = checker
    .getExportsOfModule(moduleSymbol)
    .find((symbol) => symbol.name === exportName);
  if (!exported) return NO_PROPS;

  const symbol = exported.flags & ts.SymbolFlags.Alias
    ? checker.getAliasedSymbol(exported)
    : exported;
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  if (!declaration) return NO_PROPS;

  const componentType = checker.getTypeOfSymbolAtLocation(symbol, declaration);
  const signature = componentType.getCallSignatures()[0];
  const parameter = signature?.getParameters()[0];
  if (!parameter) return NO_PROPS;

  const parameterDeclaration = parameter.valueDeclaration ?? parameter.declarations?.[0] ?? declaration;
  const propsType = checker.getTypeOfSymbolAtLocation(parameter, parameterDeclaration);
  const controls: PropControls = {};
  const actions: string[] = [];

  for (const prop of checker.getPropertiesOfType(propsType)) {
    const propDeclaration = prop.valueDeclaration ?? prop.declarations?.[0] ?? parameterDeclaration;
    const propType = checker.getTypeOfSymbolAtLocation(prop, propDeclaration);
    if (ACTION_NAME.test(prop.name) && isFunctionType(propType)) {
      actions.push(prop.name);
      continue;
    }
    const optional = Boolean(prop.flags & ts.SymbolFlags.Optional);
    const control = toControl(propType, optional, checker);
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
