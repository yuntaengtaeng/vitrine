# vitrine-plugin-static

[Vitrine](https://vitrine-4kr.pages.dev/ko) Gallery를 정적 파일로 만들어 어디에나 배포합니다. 리뷰어가 dev server를 실행하지 않고도 컴포넌트를 둘러볼 수 있습니다. 이 plugin으로 만든 [라이브 데모](https://vitrine-4kr.pages.dev/demo/)를 확인해 보세요.

[English](https://github.com/yuntaengtaeng/vitrine/tree/main/packages/plugin-static#readme)

## 설치

```sh
npm install -D vitrine-plugin-static
```

Vite config의 `vitrine({ plugins })`에 등록합니다.

```ts
// vite.config.ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import vitrine from "vite-plugin-react-vitrine";
import vitrineStatic from "vitrine-plugin-static";

export default defineConfig({
  plugins: [react(), vitrine({ plugins: [vitrineStatic()] })],
});
```

## 빌드

```sh
npx vitrine-static build
```

Gallery가 `vitrine-static/`(`index.html`, `frame.html`, `assets/`)에 만들어집니다. 폴더를 어느 정적 호스팅에나 올리세요. 평소 `vite build`는 바뀌지 않습니다.

빌드는 내 Vite config를 그대로 써서 alias, CSS, setup file, globals와 다른 Vite plugin이 dev server에서와 똑같이 동작합니다.

| 옵션 | 기본값 | 설명 |
| --- | --- | --- |
| `outDir` | `"vitrine-static"` | 결과 폴더, Vite root 기준 |
| `base` | `"./"` | 배포한 Gallery의 Vite `base`. 기본값은 어느 하위 경로에서나 동작 |

`vitrine-static build [root] [--config <file>]`는 `vite build`와 같은 root와 config 파일 인자를 받습니다.

## 들어가는 것

정적 Gallery에서도 프리뷰, Props, Variants, Matrix, Actions, Code, globals, viewport, 배경, 상태 링크(Copy link)가 동작합니다.

dev server가 필요한 기능은 빠집니다. 바로 반영, 스냅샷 히스토리, Open in editor, VS Code 커서 동기화와 Save as variant입니다.

## 앱 build에만 필요한 plugin

`vitrine-static build`가 실행되는 동안 `process.env.VITRINE_STATIC_BUILD`는 `"1"`입니다. 타입 선언이나 bundle 분석 plugin처럼 Gallery에 필요 없는 plugin을 끌 때 쓰세요.

```ts
const isGalleryBuild = process.env.VITRINE_STATIC_BUILD === "1";

export default defineConfig({
  plugins: [react(), vitrine({ plugins: [vitrineStatic()] }), !isGalleryBuild && dts()],
});
```

## 호환성

`vite-plugin-react-vitrine` 0.2 이상과 Vite 6.4, 7, 8이 필요합니다. Vitrine plugin API는 `0.x` 동안 실험 단계입니다.

## 라이선스

MIT
