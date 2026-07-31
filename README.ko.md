# vitrine

[English](./README.md)

> 에디터를 벗어나지 않고, Jetpack Compose Preview 경험을 React로 가져옵니다.

Vitrine은 컴포넌트 export 위에 `/** @preview */` 주석을 달아두면, 편집 중인
파일 바로 옆 VS Code 패널에서 실시간으로 렌더링된 모습을 볼 수 있게 해줍니다.
`.stories.tsx` 파일도, 별도 브라우저 탭도, 수동 등록 과정도 필요 없습니다.

## 철학

- **에디터가 주 인터페이스입니다.** 브라우저 탭은 대체 수단일 뿐, 목표로 하는
  경험이 아닙니다.
- **분리된 파일보다 인라인을.** Storybook / Ladle / Histoire와의 차별점은,
  프리뷰가 관리해야 할 별도 파일이 아니라 미리보기 대상 export 바로 위에 붙는
  주석이라는 점입니다.
- **렌더링은 항상 Vite가 담당합니다.** VS Code 확장은 스스로 번들링하거나
  렌더링하지 않습니다. webview를 열고, Vite dev server가 서빙하는 갤러리
  페이지를 `<iframe>`으로 가리킬 뿐입니다.

### 하지 않는 것 (Non-goals)

- Storybook 대체가 아닙니다 (문서화, 컨트롤, 시각적 회귀 테스트, 애드온 없음).
- dev server를 자동으로 시작하지 않습니다 — 프로젝트의 `vite dev`는 직접
  실행해야 합니다.
- 멀티 프레임워크를 지원하지 않습니다 (Vue/Svelte 프리뷰는 범위 밖).
- 컴포넌트를 자동으로 찾아주지 않습니다 — 프리뷰는 `@preview`를 통해
  명시적으로 선언해야 합니다.

## 동작 방식

```
VS Code 커맨드  →  Webview 패널  →  <iframe src="…/​__vitrine">
                                              │
                                     Vite dev server
                                    (@vitrine/vite-plugin)
                                              │
                                  @preview export를 스캔하고,
                                  갤러리 페이지를 서빙
```

두 개의 패키지, 두 가지 역할:

- **`packages/vite-plugin`** (`@vitrine/vite-plugin`) — 실제 엔진 역할.
  `@babel/parser`를 이용해 (문자열 검색이 아니라) 소스에서 `@preview` 주석이
  달린 export를 스캔하고, 개발 모드에서 `/__vitrine` 경로에 갤러리 페이지를
  서빙합니다.
- **`packages/vscode-extension`** (`vitrine`) — 의도적으로 얇게 유지.
  `Vitrine: Open Preview` 커맨드 하나로, dev server의 `/__vitrine` 경로를
  가리키는 `<iframe>`이 담긴 webview 패널을 엽니다.

## 프리뷰 선언하기

```tsx
export function Button({ variant }: { variant: "primary" | "danger" }) {
  /* ... */
}

/** @preview */
export const PrimaryButton = () => <Button variant="primary" />;

/** @preview name=Danger button */
export const DangerButton = () => <Button variant="danger" />;
```

- 주석은 `export const` 또는 `export function` 바로 위에 붙는 블록 주석이어야
  합니다.
- `name=...`은 선택 사항입니다. 생략하면 export 식별자가 라벨로 사용됩니다.
  값은 주석 끝까지 이어지므로 공백을 포함할 수 있습니다
  (`name=Danger button` → 라벨 "Danger button").

## 사용법

```bash
pnpm install
pnpm run build              # @vitrine/vite-plugin 빌드
pnpm run dev:example        # example 앱의 Vite dev server 시작
```

이후 브라우저에서 `http://localhost:5173/__vitrine`을 열어 갤러리를 바로
확인하거나, VS Code 확장을 실행합니다:

```bash
pnpm run build:extension    # packages/vscode-extension 빌드
```

이 폴더를 VS Code로 열고 **F5**(`.vscode/launch.json` 사용)를 눌러 Extension
Development Host를 실행한 뒤, 커맨드 팔레트에서 **Vitrine: Open Preview**를
실행하세요. dev server가 이미 실행 중이어야 하며, 그렇지 않으면 빈 화면 대신
안내 메시지가 표시됩니다.

`vitrine.devServerUrl` (VS Code 설정)으로 대상 URL을 지정할 수 있으며, 기본값은
`http://localhost:5173/__vitrine`입니다.

## 현재까지 검증된 내용

Vite 플러그인 쪽은 실제 dev server를 대상으로 end-to-end 검증을 마쳤습니다:
`/__vitrine` 경로, `\0`이 접두어로 붙는 데이터 virtual module
(`virtual:vitrine-previews`), 접두어 없는 갤러리 엔트리 모듈
(`virtual:vitrine-preview-gallery`), 그리고 AST 스캔(공백이 포함된
`name=...` 옵션 포함)까지 모두 정상적으로 resolve/서빙됨을 확인했습니다.

VS Code 확장 쪽(webview CSP, iframe 렌더링, F5 디버깅)도 실제 Extension
Development Host 세션에서 검증을 마쳤습니다: `Vitrine: Open Preview`
커맨드를 실행하면 webview 패널이 열리고 dev server의 example 앱 프리뷰가
정상적으로 렌더링됩니다.

## 앞으로의 방향 (아직 구현 안 됨)

아래 항목들은 검토했지만 의도적으로 미룬 것들이며, 잊은 게 아닙니다:

- 자동 컴포넌트 탐색 (`@preview` 주석 없이도 동작)
- 커서 위치를 따라가는 프리뷰 (현재 에디터 선택 영역 추적)
- 매니페스트 HMR (전체 리로드 없이 `@preview` 추가/삭제 반영)
- TypeScript prop 타입으로부터 자동 생성되는 props 컨트롤
- 테마 / 반응형 / 줌 토글
- Provider 자동 감지 (Router / QueryClient / ThemeProvider) 및 목(mock) 처리
- 프리뷰별 iframe 격리
- dev server의 실제 포트 자동 감지 (5173이 이미 사용 중이면 Vite가 다른
  포트로 올라가는데, `vitrine.devServerUrl` 기본값은 그걸 못 따라감). 유력한
  방식: vite-plugin이 서버 시작 시 실제 resolve된 URL을 파일로 써두고,
  확장이 그 파일을 먼저 읽고 없으면 설정값으로 폴백.
