# vite-plugin-react-vitrine

[English](https://github.com/yuntaengtaeng/vitrine/tree/main/packages/vite-plugin#readme)

[공식 사이트](https://vitrine-4kr.pages.dev/ko) · [문서](https://vitrine-4kr.pages.dev/ko/docs) · [VS Code 확장](https://marketplace.visualstudio.com/items?itemName=yuntaengtaeng.vitrine)

React 컴포넌트 프리뷰를 프로젝트의 Vite dev server에서 바로 렌더링합니다.

컴포넌트 export 위에 `/** @preview */`를 붙이면 `/__vitrine`의 실시간 갤러리에 나타납니다.
stories 파일도, 별도 빌드도, 추가 서버도 필요 없습니다.

```tsx
/** @preview */
export const PrimaryButton = () => <Button variant="primary">Save</Button>;
```

## 설치

```bash
npm install -D vite-plugin-react-vitrine
# 또는
pnpm add -D vite-plugin-react-vitrine
```

## 설정

React plugin 옆에 추가합니다.

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vitrine from "vite-plugin-react-vitrine";

export default defineConfig({
  plugins: [react(), vitrine()],
});
```

평소처럼 dev server를 실행하고 `http://localhost:5173/__vitrine`을 엽니다.

이 plugin은 dev 모드(`vite serve`)에서만 동작합니다. production 빌드에는 아무것도 추가하지 않습니다.

## 프리뷰 선언

```tsx
/** @preview */
export const PrimaryButton = () => <Button variant="primary" />;

/** @preview name="Inputs/Danger button" */
export function DangerButton() {
  return <Button variant="danger" />;
}

/** @preview */
export default () => <Button variant="primary" />;
```

- 주석은 `export const`, `export function`, `export default` 바로 위에 둡니다.
- 사이드바 이름은 export 이름입니다. `name="..."`으로 바꿀 수 있고, 값은 따옴표로 감싸야 합니다.
- 이름에 `/`를 넣으면 사이드바 그룹이 됩니다. `name="Inputs/Danger button"`은 "Inputs" 그룹 안의
  "Danger button"으로 표시됩니다.
- 이름 없는 default export는 파일 이름으로 표시됩니다.

## Controls와 variants

컴포넌트의 prop 타입으로 controls를 자동 생성합니다. 다른 파일에서 import한 타입도 해석합니다.
지원하는 타입은 `string`, `number`, `boolean`, 문자열이나 숫자 리터럴 유니온, 문자열 enum입니다.
객체, 함수, 배열, `ReactNode` 같은 다른 타입의 prop에는 control이 생기지 않으므로 `args`로 샘플
값을 넘깁니다.

필수 prop의 초기값은 빈 문자열, `0`, `false` 또는 유니온의 첫 리터럴이고 선택 prop은 값 없이
시작합니다. Prop 타입은 `tsconfig.json`으로 읽으므로 그 `include` 밖의 컴포넌트 파일에는
control이 생기지 않습니다.

샘플 값, 다른 종류의 control, 이름 붙은 variant가 필요하면 `preview()`를 사용합니다.

```tsx
import { preview } from "vite-plugin-react-vitrine/preview";

/** @preview */
export const Button = (props: ButtonProps) => <button>{props.children}</button>;

preview(Button, {
  args: { variant: "primary", children: "Save" },
  controls: { variant: "radio" },
  variants: {
    primary: { name: "Primary", args: { variant: "primary" } },
    danger: { name: "Danger", args: { variant: "danger" } },
  },
  defaultVariant: "primary",
});
```

| 옵션 | 설명 |
| --- | --- |
| `args` | prop 초기값 |
| `controls` | prop별 control: `"text"`, `"number"`, `"boolean"`, `"select"`, `"radio"` 또는 `{ type, options }` |
| `variants` | 갤러리에서 전환할 수 있는 이름 붙은 args 묶음 |
| `defaultVariant` | 처음 선택되는 variant. 기본값은 `variants`의 첫 번째 키 |
| `wrapper` | 이 컴포넌트 프리뷰를 감싸는 router나 provider 같은 React wrapper |

Wrapper는 프리뷰에만 적용되며 export한 컴포넌트는 바꾸지 않습니다.

## Provider, context와 전역 CSS

프리뷰는 각자 별도 frame에서 렌더링되므로 앱의 provider와 전역 CSS를 상속하지 않습니다.
`main.tsx`에서 import한 폰트, CSS reset, Tailwind 스타일은 프리뷰에 적용되지 않고 글자는 브라우저
기본 폰트로 보입니다. 모든 프리뷰에 같은 provider나 stylesheet가 필요하면 setup file을 추가합니다.

```tsx
// src/vitrine.preview.tsx
import type { PreviewWrapperProps } from "vite-plugin-react-vitrine/preview";
import { DarkModeProvider } from "./DarkModeProvider";
import "./index.css";

export default function PreviewSetup({ children }: PreviewWrapperProps) {
  return <DarkModeProvider>{children}</DarkModeProvider>;
}
```

Vite root 기준 경로로 등록합니다.

```ts
vitrine({ setupFile: "./src/vitrine.preview.tsx" });
```

경로에는 확장자를 포함합니다. 파일은 Vite root 안에 있어야 하며 경로에 `#`, `?`, `%`를 쓸 수
없습니다. 경로가 잘못되었거나 파일이 아직 없어도 앱은 계속 실행되고, gallery와 터미널에 해석된
경로와 Vite root가 표시됩니다. 파일을 만들거나 파일의 오류를 고치면 gallery가 자동으로 다시
로드됩니다.

같은 프리뷰의 control이 prop을 바꾸는 동안 wrapper는 마운트 상태를 유지하므로 stateful provider의
상태도 유지됩니다. 다른 프리뷰를 선택하면 새로운 프리뷰 tree가 마운트됩니다. 한 컴포넌트에만
provider가 필요하면 `preview(Component, { wrapper: ComponentWrapper })`를 사용합니다.

## Globals

Globals는 테마나 언어처럼 앱 전체의 provider가 정하는 값입니다. setup file에 선언해 두면 파일을
고치지 않고 gallery toolbar에서 값을 바꿔 볼 수 있습니다.

```tsx
// src/vitrine.preview.tsx
import type { PreviewGlobals, PreviewWrapperProps } from "vite-plugin-react-vitrine/preview";

export const globals = {
  locale: { label: "Locale", options: ["en", "ko"], default: "en" },
} as const satisfies PreviewGlobals;

// prop 이름을 globals로 받으면 typeof globals가 자기 자신을 가리키므로 다른 이름으로 받음
export default function PreviewSetup({ children, globals: selected }: PreviewWrapperProps<typeof globals>) {
  return <LocaleProvider locale={selected.locale}>{children}</LocaleProvider>;
}
```

선택지는 문자열이고, `default`가 없으면 첫 선택지를 씁니다. `preview(Component, { wrapper })`의
wrapper도 같은 `globals` prop을 받습니다. 값을 바꾸면 wrapper를 새로 마운트하므로 처음 마운트할
때만 값을 읽는 provider에도 새 값이 반영됩니다. 고른 값은 프리뷰를 바꾸거나 새로고침해도
유지됩니다.

프리뷰나 variant가 global을 고정할 수 있습니다. 고정한 값은 toolbar에 표시되고 바꿀 수 없습니다.

```ts
preview(Greeting, {
  globals: { locale: "en" },
  variants: { korean: { globals: { locale: "ko" } } },
});
```

## Plugin 옵션

```ts
vitrine({
  // @preview를 찾을 glob 패턴, Vite root 기준
  include: ["src/**/*.{tsx,jsx}"],
  // 모든 프리뷰를 감싸는 default export module
  setupFile: "./src/vitrine.preview.tsx",
  // gallery viewport 프리셋 변경 (실험 단계)
  viewports: (defaults) => [...defaults, { name: "Breakpoint", width: 800 }],
});
```

`include` 기본값은 `["src/**/*.{tsx,jsx}"]`입니다. 컴포넌트가 `src/` 밖에 있는데 gallery에
프리뷰가 없다고 나오면 해당 폴더를 `include`에 추가합니다.

프리뷰는 iframe 안에서 렌더링되므로 미디어 쿼리는 선택한 viewport 너비를 따릅니다. 기본
프리셋은 Mobile 375px, Tablet 768px, Desktop 1280px입니다. `viewports`는 이 목록을 받아 보여줄
목록을 돌려주므로 추가, 삭제, 교체가 모두 가능합니다. 무대를 채우는 Responsive는 항상
제공됩니다. 이름이 겹치거나 너비가 양의 정수가 아니면 경고를 남기고 기본 목록을 씁니다.

## VS Code

[Vitrine for VS Code](https://marketplace.visualstudio.com/items?itemName=yuntaengtaeng.vitrine)를 설치하면 갤러리를 에디터 옆에 열 수 있습니다. 패널은 커서를 따라
작업 중인 프리뷰로 바뀝니다. 확장 없이도 갤러리는 어느 브라우저에서나 동작합니다.

```bash
code --install-extension yuntaengtaeng.vitrine
```

확장이 dev server를 찾을 수 있도록 plugin은 프로젝트 root의 `.vitrine/port.json`에 포트를 기록합니다.
이 폴더는 자체 `.gitignore`로 스스로를 제외하므로 커밋에 포함되지 않습니다.

## 호환성

| 패키지 | 지원 버전 |
| --- | --- |
| React | 18, 19 |
| Vite | 6.4+, 7, 8 |

## 라이선스

[MIT](https://github.com/yuntaengtaeng/vitrine/blob/main/LICENSE)
