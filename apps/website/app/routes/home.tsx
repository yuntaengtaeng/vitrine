import type { MetaArgs } from "react-router";
import { localeFromPath, messagesFor } from "../i18n/locale";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { Hero } from "../features/hero/Hero";
import { HowItWorks } from "../features/how-it-works/HowItWorks";
import { FeatureList } from "../features/feature-list/FeatureList";
import { Compatibility } from "../features/compatibility/Compatibility";
import { Faq } from "../features/faq/Faq";

export function meta({ location }: MetaArgs) {
  const t = messagesFor(localeFromPath(location.pathname));
  return [
    { title: t.meta.title },
    { name: "description", content: t.meta.description },
    { property: "og:title", content: t.meta.title },
    { property: "og:description", content: t.meta.description },
    { property: "og:type", content: "website" },
    // 두 언어 페이지를 서로의 번역본으로 검색 엔진에 알림
    { tagName: "link", rel: "alternate", hrefLang: "en", href: "/" },
    { tagName: "link", rel: "alternate", hrefLang: "ko", href: "/ko" },
    { tagName: "link", rel: "alternate", hrefLang: "x-default", href: "/" },
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
