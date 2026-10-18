import type { ReactNode } from "react";
import { useLocation, type MetaArgs } from "react-router";
import { DocsLayout } from "../features/docs/DocsLayout";
import { GalleryGuide } from "../features/docs/GalleryGuide";
import { GettingStarted } from "../features/docs/GettingStarted";
import { OptionsGuide } from "../features/docs/OptionsGuide";
import { PluginsOverview } from "../features/docs/PluginsOverview";
import { StaticPluginGuide } from "../features/docs/StaticPluginGuide";
import { docsPageFromPath, docsPath, localeFromPath, messagesFor, type DocsPage } from "../i18n/locale";
import { SITE, siteUrl } from "../site";

export function meta({ location }: MetaArgs) {
  const t = messagesFor(localeFromPath(location.pathname));
  const locale = localeFromPath(location.pathname);
  const page = docsPageFromPath(location.pathname) ?? "getting-started";
  const canonicalPath = docsPath(locale, page);
  const pageMeta = {
    "getting-started": t.docs,
    previews: t.docs.declarations,
    "preview-function": t.docs.controls,
    gallery: t.docs.gallery,
    options: t.docs.options,
    plugins: t.docs.plugins,
    "plugins/static": t.docs.pluginStatic,
  }[page];
  const title = page === "getting-started" ? t.docs.meta.title : `${pageMeta.title} · Vitrine`;
  const description = page === "getting-started" ? t.docs.meta.description : pageMeta.lead;
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: siteUrl(canonicalPath) },
    { property: "og:image", content: siteUrl(SITE.ogImagePath) },
    { property: "og:image:alt", content: "Vitrine component preview gallery" },
    { property: "og:image:width", content: "1731" },
    { property: "og:image:height", content: "908" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: siteUrl(SITE.ogImagePath) },
    { tagName: "link", rel: "canonical", href: siteUrl(canonicalPath) },
    { tagName: "link", rel: "alternate", hrefLang: "en", href: siteUrl(docsPath("en", page)) },
    { tagName: "link", rel: "alternate", hrefLang: "ko", href: siteUrl(docsPath("ko", page)) },
    { tagName: "link", rel: "alternate", hrefLang: "x-default", href: siteUrl(docsPath("en", page)) },
  ];
}

const PAGES: Record<DocsPage, ReactNode> = {
  "getting-started": <GettingStarted page="getting-started" />,
  previews: <GettingStarted page="previews" />,
  "preview-function": <GettingStarted page="preview-function" />,
  gallery: <GalleryGuide />,
  options: <OptionsGuide />,
  plugins: <PluginsOverview />,
  "plugins/static": <StaticPluginGuide />,
};

export default function Docs() {
  const page = docsPageFromPath(useLocation().pathname) ?? "getting-started";
  return <DocsLayout>{PAGES[page]}</DocsLayout>;
}
