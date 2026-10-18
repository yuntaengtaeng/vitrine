import type { Config } from "@react-router/dev/config";

export default {
  // 서버 없이 정적 호스팅하도록 빌드할 때 페이지 HTML을 미리 생성
  ssr: false,
  prerender: [
    "/",
    "/ko",
    "/docs",
    "/docs/previews",
    "/docs/preview-function",
    "/docs/gallery",
    "/docs/options",
    "/docs/plugins",
    "/docs/plugins/static",
    "/ko/docs",
    "/ko/docs/previews",
    "/ko/docs/preview-function",
    "/ko/docs/gallery",
    "/ko/docs/options",
    "/ko/docs/plugins",
    "/ko/docs/plugins/static",
  ],
} satisfies Config;
