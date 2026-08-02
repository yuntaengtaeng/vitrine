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
pnpm run test                # Vitest 스위트 실행
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

dev server의 포트는 자동으로 감지되므로 따로 설정할 값이 없습니다. Vite
플러그인이 서버 시작 시 실제 포트를 `<project-root>/.vitrine/port.json`에
기록하고(해당 폴더는 스스로 `.gitignore` 처리) 확장은 활성 에디터 파일에서
위로 올라가며 대상 프로젝트를 찾고, 없으면 워크스페이스 전체를 스캔합니다
(동시에 여러 dev server가 떠 있으면 선택 목록을 띄웁니다). 패널 안
**Switch Project** 버튼으로 지금 어떤 파일을 보고 있든 상관없이 다른 실행
중인 프로젝트로 언제든 전환할 수 있습니다.

## 커서 위치를 따라가는 프리뷰

에디터 커서를 `@preview` export 위로 옮기면 클릭 없이도 패널이 자동으로 그
프리뷰로 전환됩니다. 단, 지금 패널이 보여주는 프로젝트 안에서만 반응하며,
다른 프로젝트 파일로 커서를 옮겨도 아무 일도 일어나지 않습니다(먼저
**Switch Project**로 전환해야 함). 아래 알려진 이슈 참고.

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

dev server 포트 자동 감지는 Vite 플러그인 쪽을 실제로 라이브 검증했습니다
(서버 시작 시 포트/PID 파일 기록, 정상 종료 시 삭제, 강제 종료된 프로세스의
PID가 정확히 죽은 것으로 감지됨). 플러그인의 파일 기록 로직과 확장의 탐색
로직(상위 탐색, 워크스페이스 스캔, `node_modules` 제외, PID 생존 확인)은
Vitest 스위트로도 커버했습니다. 여러 dev server가 동시에 떠 있을 때 뜨는
확장 쪽 선택 목록 UI와 Switch Project 버튼은 dev server 두 개를 동시에
띄운 Extension Development Host 세션에서 직접 확인했습니다.

커서 위치를 따라가는 프리뷰는 같은 프로젝트 안에서 라이브로 end-to-end
검증했습니다: 같은 파일 안 `@preview` export 사이로 커서를 옮기면 패널이
자동으로 전환됩니다. 라인 범위 스캔(`scan.ts`)과 커서-엔트리 매칭
(`preview-lookup.ts`)은 Vitest로, `/__vitrine/manifest` 엔드포인트는 실제
dev server를 대상으로 직접 확인했습니다.

## 알려진 이슈

- **커서 추적은 프로젝트를 넘나들지 않습니다.** 패널이 프로젝트 A를 보여주는
  중에 프로젝트 B의 파일로 커서를 옮겨도 아무 반응이 없습니다 — 커서 추적은
  일부러 지금 보여주는 프로젝트로만 범위를 제한해서, 사용자가 직접 고르는
  **Switch Project**와 충돌하지 않게 했습니다. 다른 프로젝트를 보려면 먼저
  Switch Project로 전환하면, 그 다음부터는 새 프로젝트 안에서 커서 추적이
  다시 동작합니다. 버그가 아니라 스코프 결정이며, 실사용에서 불편하면 다시
  검토할 항목입니다.

## 앞으로의 방향 (아직 구현 안 됨)

아래 항목들은 검토했지만 의도적으로 미룬 것들이며, 잊은 게 아닙니다:

- 자동 컴포넌트 탐색 (`@preview` 주석 없이도 동작)
- 매니페스트 HMR (전체 리로드 없이 `@preview` 추가/삭제 반영)
- TypeScript prop 타입으로부터 자동 생성되는 props 컨트롤
- 테마 / 반응형 / 줌 토글
- Provider 자동 감지 (Router / QueryClient / ThemeProvider) 및 목(mock) 처리
- 프리뷰별 iframe 격리
