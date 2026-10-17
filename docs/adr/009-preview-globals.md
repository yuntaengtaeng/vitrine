# ADR 009: Preview globals는 setup file에서 선언하고 wrapper가 받는다

- 상태: 채택, 공개 API는 `0.x` 동안 실험 단계
- 날짜: 2026-10-18

## 맥락

테마, 언어, 밀도처럼 컴포넌트 props가 아니라 앱 전체 Provider가 정하는 값이 있다. 지금은 setup
file의 wrapper가 값을 고정해서 넣기 때문에, 다크 테마에서 컴포넌트를 보려면 setup file을 고쳐야
한다. Storybook의 globals와 같은 개념이라 이 도구로 넘어오는 사용자에게도 익숙하다.

[ADR 007](./007-preview-frame.md)에 따라 사용자 코드는 frame에서만 실행한다. Gallery는 선언과
선택한 값을 데이터로만 다룬다.

## 결정

setup file이 `globals`를 named export로 선언하고, wrapper는 `{ children, globals }`를 props로 받는다.

```tsx
// src/vitrine.preview.tsx
import type { PreviewGlobals, PreviewWrapperProps } from "vite-plugin-react-vitrine/preview";

export const globals = {
  theme: { label: "Theme", options: ["light", "dark"], default: "light" },
  locale: { options: ["en", "ko"] },
} as const satisfies PreviewGlobals;

// 매개변수 이름을 globals로 쓰면 typeof globals가 자기 자신을 가리켜 타입이 끊기므로 다른 이름으로 받음
export default function PreviewSetup({ children, globals: selected }: PreviewWrapperProps<typeof globals>) {
  return <ThemeProvider theme={selected.theme}>{children}</ThemeProvider>;
}
```

- 선택지는 문자열만 받는다. `default`가 없으면 첫 선택지다. 선언이 틀리면 setup file 에러로
  보여주고 프리뷰를 그리지 않는다.
- `preview()`와 variant는 `globals`로 값을 고정할 수 있다. 고정한 값은 Gallery toolbar에서
  바꿀 수 없게 표시한다.

  ```ts
  preview(Banner, { globals: { theme: "dark" }, variants: { ko: { globals: { locale: "ko" } } } });
  ```

- 값은 선언 기본값, Gallery에서 고른 값, `preview()` 고정값, variant 고정값 순으로 덮어쓴다.
  선언에 없는 이름이나 선택지에 없는 값은 버린다.
- `preview()`의 `wrapper`도 같은 props를 받는다.
- 값이 바뀌면 wrapper부터 새로 마운트한다. Provider가 처음 마운트할 때만 값을 읽는 경우가 많아서다.
- Gallery는 고른 값을 프리뷰를 바꿔도 유지한다. frame과는 `frameReady`(선언과 고정값),
  `frameRender`(고른 값)로 주고받는다.

## 결과

- setup file을 고치지 않고 toolbar에서 테마와 언어를 바꿔 볼 수 있다.
- `globals` export와 `PreviewWrapperProps`의 `globals`가 공개 계약이 된다.
- 선택지가 문자열뿐이라 숫자나 객체 값이 필요한 사용자는 이름으로 매핑해야 한다.

## 재검토 조건

- 문자열이 아닌 선택지가 자주 필요해짐
- 프리뷰마다 다른 선언(일부 프리뷰에만 있는 global)이 필요해짐
