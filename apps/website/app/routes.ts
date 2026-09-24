import { type RouteConfig, index, route } from "@react-router/dev/routes";

// 같은 페이지 모듈을 언어별 경로에 연결, 언어는 경로에서 판단
export default [
  index("routes/home.tsx", { id: "home-en" }),
  route("ko", "routes/home.tsx", { id: "home-ko" }),
  route("docs", "routes/docs.tsx", { id: "docs-en" }),
  route("ko/docs", "routes/docs.tsx", { id: "docs-ko" }),
] satisfies RouteConfig;
