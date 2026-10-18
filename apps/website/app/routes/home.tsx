import type { MetaArgs } from "react-router";
import { localeFromPath, messagesFor } from "../i18n/locale";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { Hero } from "../features/hero/Hero";
import { HowItWorks } from "../features/how-it-works/HowItWorks";
import { FeatureList } from "../features/feature-list/FeatureList";
import { Compatibility } from "../features/compatibility/Compatibility";
import { Faq } from "../features/faq/Faq";
import { SITE, siteUrl } from "../site";

export function meta({ location }: MetaArgs) {
  const t = messagesFor(localeFromPath(location.pathname));
  const canonicalPath = localeFromPath(location.pathname) === "ko" ? "/ko" : "/";
  return [
    { title: t.meta.title },
    { name: "description", content: t.meta.description },
    { property: "og:title", content: t.meta.title },
    { property: "og:description", content: t.meta.description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: siteUrl(canonicalPath) },
    { property: "og:image", content: siteUrl(SITE.ogImagePath) },
    { property: "og:image:alt", content: "Vitrine component preview gallery" },
    { property: "og:image:width", content: "1731" },
    { property: "og:image:height", content: "908" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: siteUrl(SITE.ogImagePath) },
    { tagName: "link", rel: "canonical", href: siteUrl(canonicalPath) },
    // 두 언어 페이지를 서로의 번역본으로 검색 엔진에 알림
    { tagName: "link", rel: "alternate", hrefLang: "en", href: siteUrl("/") },
    { tagName: "link", rel: "alternate", hrefLang: "ko", href: siteUrl("/ko") },
    { tagName: "link", rel: "alternate", hrefLang: "x-default", href: siteUrl("/") },
  ];
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <HowItWorks />
        <FeatureList />
        <Compatibility />
        <Faq />
      </main>
      <SiteFooter />
    </>
  );
}
