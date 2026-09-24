import type { Config } from "@react-router/dev/config";

export default {
  // 서버 없이 정적 호스팅하도록 빌드할 때 페이지 HTML을 미리 생성
  ssr: false,
  prerender: ["/", "/ko", "/docs", "/ko/docs"],
} satisfies Config;
