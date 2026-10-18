# vite-plugin-react-vitrine

[English](https://github.com/yuntaengtaeng/vitrine/tree/main/packages/vite-plugin#readme)

[공식 사이트](https://vitrine-4kr.pages.dev/ko) · [라이브 데모](https://vitrine-4kr.pages.dev/demo/) · [문서](https://vitrine-4kr.pages.dev/ko/docs) · [VS Code 확장](https://marketplace.visualstudio.com/items?itemName=yuntaengtaeng.vitrine)

React 컴포넌트 프리뷰를 프로젝트의 Vite dev server에서 바로 렌더링합니다.

컴포넌트 export 위에 `/** @preview */`를 붙이면 `/__vitrine`의 실시간 갤러리에 나타납니다.
stories 파일도, 별도 빌드도, 추가 서버도 필요 없습니다.

```tsx
/** @preview */
export const PrimaryButton = () => <Button variant="primary">Save</Button>;
```

![Button 프리뷰와 Props 패널을 보여주는 Vitrine Gallery](https://raw.githubusercontent.com/yuntaengtaeng/vitrine/main/apps/website/public/screenshots/gallery.png)

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
갤러리를 정적 파일로 배포하려면 [갤러리 배포](#갤러리-배포)를 참고하세요.

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
| `globals` | 이 프리뷰에서 고정할 globals, [Globals](#globals) 참고 |

Wrapper는 프리뷰에만 적용되며 export한 컴포넌트는 바꾸지 않습니다.

`onClick`처럼 `on`과 대문자로 시작하는 함수 prop은 호출이 기록되어 gallery의 Actions 탭에
인자와 함께 표시됩니다. `args`로 넘긴 함수는 그대로 실행되고 반환값도 유지됩니다. render prop이나
컴포넌트 prop 같은 다른 함수 prop은 건드리지 않습니다.

## 갤러리 보기

| 보기 | 보여주는 것 |
| --- | --- |
| Single | 고른 variant로 프리뷰 하나 |
| Variants | 모든 variant를 나란히, 바꾼 prop은 모든 칸에 적용 |
| Matrix | 행과 열로 고른 prop 두 개의 모든 조합 (boolean과 union, 36칸까지) |
| History | 지금 버전과 이전 저장본을 나란히 또는 겹쳐서. [스냅샷 히스토리](#스냅샷-히스토리) 참고 |

![버튼 tone을 행으로, size를 열로 펼친 Matrix 보기](https://raw.githubusercontent.com/yuntaengtaeng/vitrine/main/apps/website/public/screenshots/matrix-crop.png)

주소가 갤러리 상태를 따라갑니다. 프리뷰, variant, 바꾼 prop, globals를 담고 있어 새로고침하거나
**Copy link**로 공유한 링크를 열면 같은 상태로 열립니다.

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
  // 스냅샷 히스토리 설정, false면 끔 (실험 단계)
  snapshots: { limit: 20 },
  // 정적 빌드 같은 선택 기능 (실험 단계)
  plugins: [],
});
```

`include` 기본값은 `["src/**/*.{tsx,jsx}"]`입니다. 컴포넌트가 `src/` 밖에 있는데 gallery에
프리뷰가 없다고 나오면 해당 폴더를 `include`에 추가합니다.

프리뷰는 iframe 안에서 렌더링되므로 미디어 쿼리는 선택한 viewport 너비를 따릅니다. 기본
프리셋은 Mobile 375px, Tablet 768px, Desktop 1280px입니다. `viewports`는 이 목록을 받아 보여줄
목록을 돌려주므로 추가, 삭제, 교체가 모두 가능합니다. 무대를 채우는 Responsive는 항상
제공됩니다. 이름이 겹치거나 너비가 양의 정수가 아니면 경고를 남기고 기본 목록을 씁니다.

### 스냅샷 히스토리

dev server가 켜져 있는 동안 `@preview`가 있는 파일을 저장할 때마다 메모리에 보관하므로, gallery의
History 보기에서 옛 버전을 지금 버전 옆에 나란히 또는 겹쳐서 볼 수 있습니다. Snapshot 1은 서버를
켤 때, 또는 파일에 `@preview`가 생긴 때의 내용입니다. 문법 오류가 있거나 내용이 같은 저장은
건너뜁니다. 파일마다 Snapshot 1과 최근 저장본을 합쳐 기본 20개를 보관합니다. 서버를 끄거나 파일을
지우거나 `@preview`가 사라지면 기록도 사라지고, 이름을 바꾼 파일은 새 기록으로 시작합니다.

옛 버전은 import하는 다른 파일의 지금 버전과 함께 그려집니다. 옛 버전에 프리뷰 export가 없으면 그
칸에 안내가 나옵니다.

입력마다 저장하는 에디터에서는 기록이 빨리 찹니다. `shouldRecord`로 저장을 남길지 정할 수 있습니다.

```ts
vitrine({
  snapshots: {
    limit: 30,
    // 3초에 한 번까지만 기록
    shouldRecord: ({ lastRecordedAt, now }) => lastRecordedAt === null || now - lastRecordedAt > 3000,
  },
});
```

## 갤러리 배포

[`vitrine-plugin-static`](https://www.npmjs.com/package/vitrine-plugin-static)이 내 Vite 설정으로
갤러리를 정적 파일로 만듭니다. 평소 `vite build`는 그대로입니다.

```ts
import vitrineStatic from "vitrine-plugin-static";

vitrine({ plugins: [vitrineStatic()] });
```

```bash
npx vitrine-static build   # vitrine-static/에 생성
```

[라이브 데모](https://vitrine-4kr.pages.dev/demo/)도 이렇게 만들었습니다. Vitrine plugin은 `0.x` 동안
실험 단계이고, 공식 plugin 이름은 `vitrine-plugin-<name>`입니다.

## VS Code

[Vitrine for VS Code](https://marketplace.visualstudio.com/items?itemName=yuntaengtaeng.vitrine)를 설치하면 갤러리를 에디터 옆에 열 수 있습니다. 패널은 커서를 따라
작업 중인 프리뷰로 바뀝니다. 확장 없이도 갤러리는 어느 브라우저에서나 동작합니다.

```bash
code --install-extension yuntaengtaeng.vitrine
```

확장이 dev server를 찾을 수 있도록 plugin은 프로젝트 root의 `.vitrine/port.json`에 포트를 기록합니다.
이 폴더는 자체 `.gitignore`로 스스로를 제외하므로 커밋에 포함되지 않습니다.

VS Code 안에서는 Props 탭에서 지금 props를 새 variant로 저장할 수 있습니다. 이름을 정하면 확장이
파일의 `preview()`에 추가하고, 필요하면 `preview()` 호출과 import도 만듭니다. 편집은 에디터를 거치므로
undo할 수 있고, gallery가 읽은 내용과 파일이 같을 때만 적용되어 저장하지 않은 수정을 덮어쓰지
않습니다. 익명 default export에는 variant를 만들 수 없고, props의 함수나 element 값은 쓰지 않습니다.
gallery와 확장은 패널을 열 때 이 기능을 포함해 함께 지원하는 기능을 맞추고, 한쪽이 오래되었으면
업데이트 안내를 한 줄 보여줍니다.

## 호환성

| 패키지 | 지원 버전 |
| --- | --- |
| React | 18, 19 |
| Vite | 6.4+, 7, 8 |

## 라이선스

[MIT](https://github.com/yuntaengtaeng/vitrine/blob/main/LICENSE)
