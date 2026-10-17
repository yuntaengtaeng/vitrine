# 공통 에이전트 지침

## 제품 목적

Vitrine은 React component export에 `/** @preview */`를 붙여, 편집 중인 파일 옆의 VS Code
패널에서 Vite가 렌더링한 프리뷰를 보여주는 개발 도구다. 에디터가 주 인터페이스이고 프리뷰
선언은 별도 stories 파일이 아니라 대상 export 가까이에 둔다.

현재 제품은 TypeScript prop 분석 기반 controls, `preview()`의 args/control override와
variants를 지원한다. 따라서 “controls가 없다”는 설명은 더 이상 제품 범위와 맞지 않는다.
다만 범용 문서 플랫폼, 시각적 회귀 테스트, addon 생태계를 제공하는 Storybook 대체 제품을
목표로 하지는 않는다.

현재 non-goal은 다음과 같다.

- Vite dev server 자동 기동
- Vue, Svelte 등 멀티 프레임워크 지원
- `@preview` 없는 component 자동 탐색
- Storybook 수준의 문서화, 시각적 회귀, addon 플랫폼

이 범위를 바꾸는 기능은 일반 구현 작업으로 추정하지 말고 제품 결정으로 다룬다.

## 안정적인 제품 및 runtime 원칙

- 실제 component module loading, 변환, HMR, 렌더링은 사용자의 Vite runtime에서 수행한다.
- `vite-plugin-react-vitrine`과 Gallery는 VS Code extension 없이 브라우저에서 독립적으로 사용할 수
  있다. Extension은 프로젝트 전환과 커서 동기화를 추가하는 선택적 editor adapter다.
- VS Code extension은 editor adapter와 webview orchestration을 담당하며 React source를 직접
  분석하거나 번들링하거나 렌더링하지 않는다.
- extension은 Vite dev server가 제공하는 gallery를 webview의 iframe으로 보여준다.
- HTTP, filesystem, `postMessage`처럼 runtime 경계를 넘는 값은 명시적인 wire contract로
  관리하고 외부 입력은 runtime에서 검증한다.
- `@preview` 탐색은 문자열 검색이 아니라 parser가 판별하는 명시적 export annotation을
  기준으로 한다.

현재 package 수, scanner/gallery의 디렉터리, webview script의 인라인 여부, 생성 asset의
구체적인 경로는 위 원칙과 구분되는 구현 선택이다. 현재 상태와 목표는
[`architecture.md`](./architecture.md), 결정 근거와 재검토 조건은 [`adr/`](./adr/)에서
확인한다.

## 공통 작업 원칙

1. 변경 전 관련 코드, 테스트, package script와 Git 상태를 확인한다.
2. 새 코드를 놓기 전에 실행 runtime, 소비자, wire/filesystem 경계, 독립 build/배포 필요,
   의존 방향을 확인한다.
3. 두 runtime이 함께 바뀌어야 하는 값은 protocol 후보로 보고, 한 구현만 쓰는 세부사항은
   해당 모듈 내부에 둔다.
4. 두 번째 소비자나 독립 release 요구가 없는 내부 모듈을 package로 미리 승격하지 않는다.
5. generated artifact는 직접 수정하지 않고 source와 build pipeline을 수정한다.
6. 기존 사용자 변경과 관련 없는 미추적 파일을 보존한다. 요청이 없으면 commit하지 않는다.
7. 구조 변경은 문서 설명만으로 끝내지 않고 build, test, package 소비 경계에서 검증한다.

## 코드 작성 원칙

코드를 작성하거나 수정할 때는 “읽는 사람이 편한가?”와 “중요한 행동을 테스트하기 쉬운가?”를
특정 아키텍처나 디자인 패턴보다 우선한다. 판단 기준, 순서와 과설계 경계는
[`code-philosophy.md`](./code-philosophy.md)가 소유한다. 이 원칙은 위의 제품 범위와 runtime
invariant 안에서 코드 구조를 고르는 기준이다.

재현된 correctness 제약과 안전한 진단 절차는
[`troubleshooting.md`](./troubleshooting.md)를 따른다.

## 검증

변경으로 생길 수 있는 회귀를 증명하는 가장 작은 검증부터 선택한다. 명령 목록과 변경 유형별
실행 조건은 `vitrine-dev` skill이 소유한다.
