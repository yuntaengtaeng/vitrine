---
name: vitrine-dev
description: Vitrine의 제품 코드, build, package, test를 구현하거나 리팩터링할 때 사용하는 개발 절차와 검증 checklist. 일반 문서 작성만 하는 작업에는 사용하지 않음
---

# Vitrine 개발 절차

이 문서는 Vitrine의 제품 코드, build, package 또는 test를 변경할 때 사용하는 공통 개발 절차와
검증 기준이다.

## 먼저 읽기

코드를 쓰기 전에 [`code-philosophy.md`](../../../docs/code-philosophy.md)를 전부 읽고 적용한다.
이 프로젝트의 코드 구조 판단 기준이며 아래 절차보다 우선한다. 그 밖에
[`architecture.md`](../../../docs/architecture.md), 변경과 관련된
[`adr/`](../../../docs/adr/), 재현된 실패가 관련되면
[`troubleshooting.md`](../../../docs/troubleshooting.md)를 확인한다.

공통 architecture나 과거 버그를 skill에 복사하지 않는다. 코드와 문서가 다르면 코드를 확인한
뒤 책임을 가진 canonical 문서를 갱신한다.

## 작업 전 판단

변경 전에 다음을 판별한다.

1. 어느 runtime에서 실행되는가?
2. 구현이나 값을 소비하는 주체는 누구인가?
3. HTTP, `postMessage`, filesystem 경계를 넘는 계약인가?
4. 독립 build 또는 배포가 필요한가?
5. 현재 module에 둘 때 의존 방향이 어떻게 되는가?

현재 경로를 그대로 따르는 것을 기본 목표로 삼지 않는다. 반대로 두 번째 소비자나 독립 배포
근거 없이 package를 추가하지도 않는다. 구조 선택은 관련 ADR의 재검토 조건에 비춰 판단한다.

Generated asset은 직접 수정하지 않고 source와 build pipeline을 수정한다.

## 코드 구조 판단

위치를 정한 뒤 함수, component, module의 구조는
[`code-philosophy.md`](../../../docs/code-philosophy.md)의 Agent Decision Rule 순서로 판단한다. 테스트 작성이
어렵다면 mock이나 setup을 늘리기 전에 순수 판단 로직과 side effect의 경계를 먼저 검토한다.
완료 전에는 같은 문서의 최종 체크로 가독성과 행동 테스트 용이성을 확인한다.

## 검증 선택 원칙

작업 완료를 모든 검증 명령의 일괄 실행과 동일하게 보지 않는다. 변경이 영향을 주는 가장 작은
검증을 먼저 실행하고, runtime 경계나 배포 범위가 넓을 때만 상위 검증으로 확장한다.

1. 수정 중에는 관련 test file, package build처럼 빠른 검증으로 feedback을 얻는다.
2. 완료 시에는 실제 회귀 가능성이 있는 runtime과 소비 경계를 기준으로 명령을 선택한다.
3. 실행하지 않은 고비용 검증이 변경 범위와 무관하면 미실행 자체를 검증 공백으로 보지 않는다.
4. 원인을 격리하기 어려운 root 설정, 공용 config, protocol 변경은 영향받는 소비자까지 넓힌다.
5. Release 직전이나 사용자가 전체 검증을 요청하면 변경 범위와 별개로 전체 suite를 실행한다.

## 현재 검증 명령

| 명령 | 검증 경계 |
| --- | --- |
| `pnpm run lint` | 전체 source와 config의 정적 규칙 |
| `pnpm run test` | Protocol, scanner, gallery helper, extension 순수 helper의 Vitest suite |
| `pnpm run build` | Protocol, Vite plugin, Gallery의 type-check와 배포 asset build |
| `pnpm run build:extension` | VS Code extension type-check와 bundle build |
| `pnpm run test:package` | Plugin tarball 단독 설치 소비자의 Gallery, manifest, 공개 타입 경계 |
| `pnpm run test:extension-package` | Extension self-contained bundle과 실제 VSIX 생성, 포함 파일 |
| `pnpm run test:compat` | 고정된 React, Vite, TypeScript 조합의 plugin 통합 동작 |

별도 root 통합 type-check script는 없다. Plugin과 Extension의 type-check는 각 build에 포함되고,
example과 fixture는 각 package의 build script에서 type-check한다.

## 변경 유형별 검증

- Scanner와 props 분석: 관련 Vitest부터 실행하고 완료 시 `pnpm run test`, `pnpm run build` 실행
  Annotation fallback과 line range가 바뀌면 정상 case와 오탐 방지 case를 함께 확인
- Gallery UI와 state: 관련 Vitest와 `pnpm run build` 실행. 배포 asset 경계를 바꾸지 않은 국소 UI
  변경에는 `test:package`와 `test:compat`을 기본으로 요구하지 않음
- Gallery build와 npm 배포: `pnpm run build`, `pnpm run test:package` 실행
- Protocol: `pnpm run test`, `pnpm run build`, `pnpm run build:extension` 실행. 배포 dependency나
  bundle 포함 방식도 바뀌면 두 package smoke test 실행
- Extension: 관련 helper test와 `pnpm run build:extension` 실행. 배포 구성이 바뀌면
  `pnpm run test:extension-package`, webview/message가 바뀌면 가능하면 Extension Development Host 확인
- ESLint와 TypeScript 공용 config: `pnpm run lint`와 영향받는 package build 실행
- Example과 fixture: 해당 project build 실행. 제품 지원 범위를 검증하는 대신 개발용 사용 경로를
  확인하는 목적임
- 문서만 변경: link와 현재 상태 표현을 확인하고 `git diff --check`로 기능 코드가 바뀌지 않았는지
  확인

## `test:compat` 실행 조건

다음 변경은 지원 버전 조합에서 실제 plugin이 기동하는지 확인해야 하므로 `pnpm run test:compat`을
실행한다.

- `vite-plugin-react-vitrine`의 React 또는 Vite peer dependency 지원 범위 변경
- Compatibility lane 추가, 삭제 또는 고정 버전 변경
- Vite hook, middleware, virtual module, module loading처럼 Vite major별 차이가 생길 수 있는 통합 변경
- Scanner나 props 분석에 사용하는 TypeScript 최소 지원 버전 또는 compiler API 사용 변경
- Workspace install, lockfile, package dependency 해석 변경이 compatibility package에 영향을 줌

다음 작업에는 별도 호환성 영향이 발견되지 않는 한 `test:compat`을 실행하지 않는다.

- 문서, 주석, formatting만 변경
- Extension에만 한정된 변경
- 기존 계약을 바꾸지 않는 순수 helper와 국소 UI 변경
- 호환성 package가 소비하지 않는 개발 도구 설정 변경

`test:compat`은 세 lane마다 plugin build, TypeScript 검사와 실제 Vite server lifecycle을 반복하는
통합 검증이다. 따라서 일반 완료 checklist가 아니라 호환성 경계 변경과 release 전 검증으로
사용한다.
