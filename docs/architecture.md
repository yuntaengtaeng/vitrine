# Architecture

이 문서는 Vitrine의 현재 구조와 합의된 목표 구조를 구분해 기록한다. 경로를 설명하는 내용은
현재 구현의 지도이며, 별도 ADR이 invariant로 정하지 않은 한 영구 배치 규칙이 아니다.

## Runtime 지도

Vitrine의 기본 사용 경로는 Vite plugin과 Gallery만으로 완결된다. VS Code를 사용할 때는
extension host와 webview wrapper가 선택적인 editor integration으로 추가된다.

```text
Standalone
browser의 gallery runtime
  -> 사용자의 Vite dev server와 component modules

VS Code
VS Code extension host
  -> VS Code webview wrapper
    -> iframe의 gallery browser runtime
      -> 사용자의 Vite dev server와 component modules
```

- Node/Vite runtime은 preview scan, virtual module, gallery/manifest HTTP route, file watch,
  port file lifecycle을 담당한다.
- Gallery browser runtime은 sidebar, canvas, controls, variants와 preview selection 상태를
  담당한다.
- Extension host와 webview는 dev server 탐색, panel, cursor selection, iframe message relay를
  담당한다. 이 기능들은 standalone Gallery 동작의 전제 조건이 아니다.

렌더링 책임을 Vite에 두는 이유는
[`adr/001-vite-runtime.md`](./adr/001-vite-runtime.md)에 기록한다.

## 현재 workspace와 module 구조

Runtime 제품과 공용 도구 설정, 예제와 호환성 검증 환경을 하나의 pnpm workspace에서 관리한다.

```text
apps/
  vscode-extension/
    src/                 VS Code adapter와 webview orchestration
packages/
  protocol/
    src/                 runtime 중립 계약과 validator
  brand/
    src/                 Klein 팔레트, gallery와 website가 공유 (private, 소스 그대로 소비)
  vite-plugin/
    src/                 Vite adapter, scanner, props 분석, port-file 구현
    client/              gallery source
    scripts/             plugin과 gallery esbuild 작업, package smoke test
    dist/gallery/        build 시 생성되는 gallery bundle
  eslint-config/          base, Node, React 공용 lint preset
  typescript-config/      base, library, Node, React 공용 tsconfig
examples/
  react-basic/            단일 React 프로젝트 사용 예시
fixtures/
  multi-project/          두 Vite 프로젝트를 함께 여는 개발 fixture
tests/
  compat/                 고정된 React, Vite, TypeScript 호환성 lane
```

`protocol`은 route, virtual module ID, manifest DTO, message, port-file schema를 소유하며 ESM과
CJS entry를 함께 build한다. Node, React, Vite, VS Code API에는 의존하지 않는다.

현재 `packages/vite-plugin/src/index.ts`는 Vite lifecycle과 HTTP/HMR orchestration을 맡는다.
세부 로직은 다음 모듈이 맡는다.

- `scan.ts`: `createPreviewScanner()`가 파일별 스캔 결과와 prop 타입 분석용 ts.Program 캐시를 소유
- `props-controls.ts`: prop 타입에서 control 추론
- `preview-tracker.ts`: 마지막 스캔 결과를 보관하고, Gallery 가상 모듈과 manifest가 같은 결과를 쓰게 함
- `previews-module.ts`: Gallery 가상 모듈 생성. 줄 번호를 넣지 않아 export 위 코드가 밀려도 Gallery가
  reload되지 않음
- `open-in-editor.ts`: 브라우저 Gallery의 에디터 열기 요청을 Vite 내장 `/__open-in-editor`로 연결
- `port-file.ts`: port file 기록

Gallery는 별도 browser source root와 type-check/build 단계를 갖지만 workspace package는 아니다.
`client/`는 두 bundle과 공유 token으로 나눈다.

- `frame/`: iframe 안에서 사용자 module을 불러 렌더링. `preview/`는 프리뷰 module과 setup file
  로드, 렌더링, 에러 경계를, `bridge/`는 Gallery와 주고받는 message와 높이 보고를 맡음
- `gallery/`: 사용자 코드를 import하지 않고 `@vitrine/protocol` data만 사용. `sidebar/`, `header/`,
  `frameLink/`(iframe 연결과 variant, 바꾼 값), `stage/`(배경, viewport, iframe 무대),
  `controls/`(Props 패널과 variant 선택), 여러 기능이 쓰는 `ui/`로 나누고 `Canvas`가 조합
- `tokens/`: 두 bundle이 공유하는 색, 글자 크기, 패턴

`gallery/`는 `frame/`을 import하지 않고, 기능 폴더끼리는 `ui/`와 gallery 최상위 공용 module만
공유한다.

각 runtime project 내부는 다음 원칙으로 정리한다. 구체적인 디렉터리 이름은 이 원칙을 구현하는
현재 선택이며 영구 규칙이 아니다.

- Public entry와 composition root는 공개 API 노출과 lifecycle 조합만 맡고, parsing, I/O, HTML
  생성, state synchronization은 책임을 가진 내부 module로 내린다.
- 한 package가 여러 runtime을 포함하면 runtime 차이를 경로나 build config로 드러낸다.
- Runtime 내부는 변경 이유가 다른 책임(scanner, props 분석, port lifecycle, panel, webview
  relay, server discovery 등) 기준으로 나눈다. Repository나 use case가 없는 adapter에
  `api/domain/data` 같은 형식적 계층을 만들지 않는다.
- 일관성은 같은 폴더 이름이 아니라 public surface, 의존 방향, build/test 진입점으로 판단한다.

`apps/vscode-extension/src/extension.ts`는 command, panel, webview HTML/message relay,
cursor event를 조합한다. `port-discovery.ts`와 `preview-lookup.ts`는 `vscode`에 의존하지 않는
순수 모듈로 분리되어 있다.

`eslint-config`와 `typescript-config`는 private workspace package다. 실행 runtime에는 포함되지
않으며 각 project가 같은 기본 설정을 상속하되 Node와 React 환경 차이를 명시적으로 선택하게
한다. 공통 dependency version은 `pnpm-workspace.yaml`의 역할별 named catalog에서 관리한다.

Vite plugin은 공개 entry인 `index`와 `preview`를 esbuild로 번들한다. 배포 dependency에 없는
`@vitrine/protocol`은 번들에 포함되고, declaration은 공개 entry의 `.d.ts`만 배포한다. Package
smoke test는 Plugin tarball 하나만 설치한 소비자에서 protocol 참조가 남지 않았는지 확인한다.

## 현재 runtime 계약

다음 계약은 `@vitrine/protocol`에서 공유한다.

- `/__vitrine`, `/__vitrine/manifest` route
- `virtual:vitrine-previews`, `virtual:vitrine-preview-gallery` module id
- manifest entry의 전송 필드
- `.vitrine/port.json`의 파일명과 `{ port, pid }` 형식
- `previewSelected`, `selectPreview`, `switchProject` message
- Vite plugin이 Gallery에만 보내는 `vitrine:setup-recover` HMR custom event

HTTP, filesystem, `postMessage`로 받은 값은 protocol validator로 확인한다. 정적 import와
type-check되지 않는 webview inline relay처럼 package 상수를 직접 사용할 수 없는 위치는 build 시
protocol 값을 주입하거나 package smoke test로 실제 계약과의 일치를 검증한다.

## 합의된 runtime 구조

배포되거나 독립 실행되는 runtime project는 다음 경계를 유지한다.

```text
packages/
  protocol/             runtime 간 공유 계약
  vite-plugin/          Vite adapter, scanner orchestration, gallery 배포
apps/
  vscode-extension/     editor adapter와 webview orchestration
```

공식 사이트는 같은 monorepo의 `apps/website`에 둔다. 문서와 코드 변경을 한 PR에서 함께 검토하기 위한
결정이다. React 19, React Router(prerender, `ssr: false`), vanilla-extract로 만들고 배포 방식은 아직 정하지 않았다.
스타일은 컴포넌트와 같은 폴더의 `.css.ts`에 두고, 공용 컴포넌트는 `app/components`, 화면 단위 코드는
`app/features/<이름>`, theme, global, layout 토큰은 `app/styles`가 소유한다. React Router v8은 React 19.2.7 이상이
필요해 사이트는 `react19` catalog를 쓰고, 예제와 plugin의 React 18 기준은 유지한다.
사이트는 제품 runtime과 공개 package tarball에 포함되지 않는다.

의존 방향은 다음과 같다.

```text
vite-plugin      -> protocol
gallery target   -> protocol
vscode-extension app -> protocol
```

- `protocol`은 Node, React, Vite, VS Code API에 의존하지 않는 순수 TypeScript 계약이다.
- Scanner는 현재 `vite-plugin` 내부 모듈로 유지한다.
- Gallery는 독립 browser build target으로 관리하지만 `vite-plugin`과 함께 배포한다.
- Gallery의 최종 asset은 `vite-plugin/dist` 아래에 두어 package tarball에 포함한다.
- 공개 npm package는 `vite-plugin-react-vitrine` 하나만 제공하고 `protocol`은 private workspace
  package로 유지한다.

Protocol과 공개 package 경계의 결정은
[`adr/002-protocol-and-public-package.md`](./adr/002-protocol-and-public-package.md),
Gallery 배포 단위는 [`adr/003-gallery-build-target.md`](./adr/003-gallery-build-target.md)에 기록한다.

## 호환성 검증 구조

일반 example과 fixture는 named catalog의 기본 개발 버전을 사용한다. 사용자를 대상으로 보장하는
버전 조합은 `tests/compat/<react>-<vite>-<typescript>/package.json`에 정확한 버전으로 고정한다.
각 compatibility package는 독립적인 `node_modules` 해석 경계를 제공하며 package manifest가
설치 버전과 기대 버전의 단일 원본이다.

`scripts/test-vite-compat.mjs`는 lane을 자동 탐색해 TypeScript 검사, Vite dev server 기동,
Gallery와 virtual module 응답, manifest 계약, React component module loading을 검증한다.
새 major를 지원할 때 기존 lane의 의미를 바꾸지 않고 새 고정 버전 lane을 추가한다. 결정 근거와
실행 조건은 [`adr/004-versioned-compatibility-matrix.md`](./adr/004-versioned-compatibility-matrix.md)와
`vitrine-dev` skill에서 관리한다.

## 소유권 경계

| 경계 | 소유하는 것 | 소유하지 않는 것 |
| --- | --- | --- |
| protocol | route, 전송 DTO, message, port-file schema와 parser | AST 모델, UI state, adapter I/O |
| scanner 내부 모듈 | annotation/export/props 분석, 중립 scan 결과 | Vite server, VS Code API, React UI |
| gallery target | gallery UI, controls/variants, browser message adapter | package discovery, VS Code lifecycle |
| vite-plugin adapter | Vite hook, HTTP/HMR, port lifecycle, gallery asset 제공 | editor state |
| vscode-extension adapter | command, dev server 선택, cursor 연결, webview | React parsing/rendering/bundling |

## 중요한 현재 동작

- Gallery는 앱과 별도 React root를 사용하므로 앱의 Provider 상태를 자동으로 상속하지 않는다.
  `vitrine({ setupFile })`에 지정한 Vite root 기준 설정 파일의 default export로 모든 프리뷰를
  감싸고, `preview(Component, { wrapper })`로 컴포넌트별 Provider를 추가한다. 설정 파일과
  Provider는 사용자의 Vite module graph에서 실행된다. 같은 프리뷰의 controls 변경은 Provider
  상태를 유지하고, 다른 프리뷰 선택은 Provider 상태를 초기화한다.
- 설정 파일의 경로 오류, 누락, 변환 실패는 사용자 앱 dev server를 멈추지 않고 Gallery와 터미널에만
  표시한다. 복구 신호도 full-reload broadcast가 아니라 Gallery 전용 HMR custom event로 보낸다.
  재현 조건과 피해야 할 대응은 [`troubleshooting.md`](./troubleshooting.md)가 소유한다.
- Manifest route는 gallery route보다 먼저 등록한다. Connect middleware가 prefix로
  match하므로 순서를 바꾸면 `/__vitrine`가 manifest 요청을 가로챈다.
- Preview 목록 watcher의 비교 baseline은 server 구성 시 미리 만든다. 첫 file event에서
  lazy 초기화하면 첫 실제 변경을 놓친다.
- Extension은 port file 존재 여부가 아니라 기록된 PID의 생존 여부로 실행 중인 server를
  판단한다.
- Cursor tracking은 panel이 현재 보여주는 project 안에서만 동작한다. 이는 수동
  Switch Project 선택과 충돌하지 않게 한 현재 UX 결정이다.
- Gallery bundle은 generated artifact다. 현재 경로는
  `packages/vite-plugin/dist/gallery/gallery-client.js`이며 직접 수정하지 않는다.
- VS Code extension은 protocol runtime을 `dist/extension.js`에 bundle한다. Extension이 선택적인
  adapter라는 경계를 유지하고 배포 산출물에서 workspace runtime dependency가 누락되지 않게 한다.

증상, 원인과 변경 시 확인법은 [`troubleshooting.md`](./troubleshooting.md)에만 상세히
기록한다.

## Package 승격 재검토 조건

다음 조건이 생기면 scanner 또는 gallery를 별도 workspace package로 승격할 수 있다.

- Vite plugin 밖의 실제 두 번째 소비자가 생김
- adapter-neutral public API와 독립 version 정책이 필요함
- 독립 배포 또는 release 주기가 필요함
- 팀 ownership을 package 경계로 강제할 필요가 생김
- 내부 모듈보다 package contract test가 실질적으로 유지비를 낮춤
