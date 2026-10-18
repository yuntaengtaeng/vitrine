# Vitrine 기여 가이드

[English](CONTRIBUTING.md)

Vitrine에 관심을 가져 주셔서 감사합니다. 이 문서는 변경을 제안하기 전에 알아야 할 제품 범위,
깨뜨리면 안 되는 runtime 원칙, PR 기준을 설명합니다. 개발 환경 설정과 실행 명령은
[README의 개발 절](README.ko.md#개발)을 참고하세요.

## 제품 범위

Vitrine은 React component export에 `/** @preview */`를 붙여, 편집 중인 파일 옆의 VS Code
패널에서 Vite가 렌더링한 프리뷰를 보여주는 개발 도구입니다. 에디터가 주 인터페이스이고 프리뷰
선언은 별도 stories 파일이 아니라 대상 export 가까이에 둡니다.

TypeScript prop 분석 기반 controls, `preview()`의 args/control override와 variants를 지원합니다.
다만 범용 문서 플랫폼이나 시각적 회귀 테스트를 제공하는 Storybook 대체 제품을 목표로 하지는
않습니다.

현재 하지 않는 것은 다음과 같습니다.

- Vite dev server 자동 기동
- Vue, Svelte 등 멀티 프레임워크 지원
- `@preview` 없는 component 자동 탐색
- Storybook 수준의 문서화, 시각적 회귀

일부 사용자만 필요한 기능은 코어를 키우는 대신 Vitrine plugin으로 제공하며, 누구나 자기 plugin을
만들 수 있습니다. 첫 공식 plugin인 `vitrine-plugin-static`이 갤러리를 정적 파일로 만듭니다. 자세한 결정은 [`docs/adr/005-plugin-architecture.md`](docs/adr/005-plugin-architecture.md)에
있습니다. Plugin API는 Vitrine이 `0.x`인 동안 실험 단계입니다.

이 범위를 바꾸는 기능은 구현보다 제품 결정이 먼저입니다. PR 전에 issue로 먼저 논의해 주세요.

## Runtime 원칙

- 실제 component module loading, 변환, HMR, 렌더링은 사용자의 Vite runtime에서 수행합니다.
- `vite-plugin-react-vitrine`과 Gallery는 VS Code extension 없이 브라우저에서 독립적으로 동작합니다.
  Extension은 프로젝트 전환과 커서 동기화를 추가하는 선택적 editor adapter입니다.
- Extension은 React source를 분석, 번들링, 렌더링하지 않고 Vite dev server의 gallery를 webview
  iframe으로 보여줍니다.
- HTTP, filesystem, `postMessage`처럼 runtime 경계를 넘는 값은 `packages/protocol`의 명시적인
  계약으로 관리하고 외부 입력은 runtime에서 검증합니다.
- `@preview` 탐색은 문자열 검색이 아니라 parser가 판별하는 export annotation을 기준으로 합니다.

Package 수, 디렉터리, 생성 asset 경로는 이 원칙과 구분되는 현재 구현 선택입니다. 현재 구조는
[`docs/architecture.md`](docs/architecture.md), 결정 근거와 재검토 조건은 [`docs/adr/`](docs/adr/)에
있습니다.

## 변경할 때

- 새 코드를 놓기 전에 실행 runtime, 소비자, wire/filesystem 경계, 의존 방향을 확인합니다.
- 두 runtime이 함께 바뀌어야 하는 값은 protocol 후보로 보고, 한 구현만 쓰는 세부사항은 해당
  module 내부에 둡니다.
- 두 번째 소비자나 독립 release 요구가 없는 내부 module을 package로 미리 승격하지 않습니다.
- Generated artifact는 직접 수정하지 않고 source와 build pipeline을 수정합니다.
- 코드 구조는 [`docs/code-philosophy.md`](docs/code-philosophy.md)의 기준으로 판단합니다.
  단일 책임, 읽기 쉬움, 행동 테스트 용이성을 특정 패턴보다 우선합니다.
- 주석과 JSDoc은 [comment-style 규칙](.agents/skills/comment-style/SKILL.md)을 따릅니다.
- 재현된 장애와 주의사항은 [`docs/troubleshooting.md`](docs/troubleshooting.md)에 있습니다.

## 언어

Issue와 pull request는 영어나 한국어로 작성합니다. 코드 주석, 테스트 이름, `docs/` 문서는
한국어로 작성하며 새 주석도 같은 주석 규칙을 따릅니다.

## Pull request

- 변경으로 생길 수 있는 회귀를 증명하는 가장 작은 검증을 실행합니다. 변경 유형별 검증 명령은
  [개발 절차](.agents/skills/vitrine-dev/SKILL.md)에 있습니다.
- 배포되는 package의 사용자 동작이 바뀌면 `pnpm changeset`으로 changeset을 추가합니다. 기준은
  [`.changeset/README.md`](.changeset/README.md)에 있습니다.
- 구조 변경은 문서 설명만으로 끝내지 않고 build, test, package 소비 경계에서 검증합니다.

이 문서와 [`CONTRIBUTING.md`](CONTRIBUTING.md)는 같은 내용을 담으며 함께 갱신합니다.
