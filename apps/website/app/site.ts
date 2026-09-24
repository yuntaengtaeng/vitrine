export const SITE = {
  name: "Vitrine",
  url: "https://vitrine-4kr.pages.dev",
  pluginPackage: "vite-plugin-react-vitrine",
  installCommand: "npm install -D vite-plugin-react-vitrine",
  githubUrl: "https://github.com/yuntaengtaeng/vitrine",
  npmUrl: "https://www.npmjs.com/package/vite-plugin-react-vitrine",
  marketplaceUrl: "https://marketplace.visualstudio.com/items?itemName=yuntaengtaeng.vitrine",
  setupGuideUrl: "https://github.com/yuntaengtaeng/vitrine/tree/main/packages/vite-plugin#readme",
  setupGuideKoUrl: "https://github.com/yuntaengtaeng/vitrine/blob/main/packages/vite-plugin/README.ko.md",
  issuesUrl: "https://github.com/yuntaengtaeng/vitrine/issues",
  ogImagePath: "/og-image.png",
} as const;

export function siteUrl(path: string): string {
  return new URL(path, SITE.url).toString();
}
