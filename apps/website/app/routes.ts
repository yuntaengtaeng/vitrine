import { type RouteConfig, index, route } from "@react-router/dev/routes";

// 같은 페이지 모듈을 언어별 경로에 연결, 언어는 경로에서 판단
export default [
  index("routes/home.tsx", { id: "home-en" }),
  route("ko", "routes/home.tsx", { id: "home-ko" }),
  route("docs", "routes/docs.tsx", { id: "docs-en" }),
  route("docs/previews", "routes/docs.tsx", { id: "docs-previews-en" }),
  route("docs/preview-function", "routes/docs.tsx", { id: "docs-preview-function-en" }),
  route("docs/gallery", "routes/docs.tsx", { id: "docs-gallery-en" }),
  route("docs/options", "routes/docs.tsx", { id: "docs-options-en" }),
  route("docs/plugins", "routes/docs.tsx", { id: "docs-plugins-en" }),
  route("docs/plugins/static", "routes/docs.tsx", { id: "docs-plugins-static-en" }),
  route("ko/docs", "routes/docs.tsx", { id: "docs-ko" }),
  route("ko/docs/previews", "routes/docs.tsx", { id: "docs-previews-ko" }),
  route("ko/docs/preview-function", "routes/docs.tsx", { id: "docs-preview-function-ko" }),
  route("ko/docs/gallery", "routes/docs.tsx", { id: "docs-gallery-ko" }),
  route("ko/docs/options", "routes/docs.tsx", { id: "docs-options-ko" }),
  route("ko/docs/plugins", "routes/docs.tsx", { id: "docs-plugins-ko" }),
  route("ko/docs/plugins/static", "routes/docs.tsx", { id: "docs-plugins-static-ko" }),
] satisfies RouteConfig;
