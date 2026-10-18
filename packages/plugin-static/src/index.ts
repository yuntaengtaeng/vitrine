import type { VitrinePlugin } from "vite-plugin-react-vitrine";

export interface VitrineStaticOptions {
  /** 결과 폴더, Vite root 기준 (기본 "vitrine-static") */
  outDir?: string;
  /** 배포 위치의 Vite base, 기본 "./"는 어느 하위 경로에 올려도 동작 */
  base?: string;
}

/** `vitrine-static build`가 실행 중인 동안 "1", 앱 전용 Vite plugin을 끄는 데 사용 */
export const STATIC_BUILD_ENV = "VITRINE_STATIC_BUILD";

/** `vitrine-static build`로 Gallery를 배포 가능한 정적 파일로 만드는 Vitrine plugin */
export default function vitrineStatic(options: VitrineStaticOptions = {}): VitrinePlugin {
  return {
    name: "static",
    // 평소 `vite build`에서는 null이라 앱 배포 결과가 바뀌지 않음
    staticBuild: () =>
      process.env[STATIC_BUILD_ENV] === "1"
        ? { outDir: options.outDir ?? "vitrine-static", base: options.base ?? "./" }
        : null,
  };
}
