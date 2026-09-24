import type { MetaArgs } from "react-router";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { GettingStarted } from "../features/docs/GettingStarted";
import { localeFromPath, messagesFor } from "../i18n/locale";

export function meta({ location }: MetaArgs) {
  const t = messagesFor(localeFromPath(location.pathname));
  return [
    { title: t.docs.meta.title },
    { name: "description", content: t.docs.meta.description },
    { property: "og:title", content: t.docs.meta.title },
    { property: "og:description", content: t.docs.meta.description },
    { property: "og:type", content: "website" },
    { tagName: "link", rel: "alternate", hrefLang: "en", href: "/docs" },
    { tagName: "link", rel: "alternate", hrefLang: "ko", href: "/ko/docs" },
    { tagName: "link", rel: "alternate", hrefLang: "x-default", href: "/docs" },
  ];
}

export default function Docs() {
  return (
    <>
      <SiteHeader />
      <GettingStarted />
      <SiteFooter />
    </>
  );
}
