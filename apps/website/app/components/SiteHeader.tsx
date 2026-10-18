import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { SITE } from "../site";
import { docsPageFromPath, docsPath, homePath, useI18n } from "../i18n/locale";
import { container } from "../styles/layout.css";
import * as styles from "./SiteHeader.css";

export function SiteHeader({ floating = false }: { floating?: boolean }) {
  const { locale, t } = useI18n();
  const otherLocale = locale === "ko" ? "en" : "ko";
  const docsPage = docsPageFromPath(useLocation().pathname);
  const otherLocalePath = docsPage ? docsPath(otherLocale, docsPage) : homePath(otherLocale);
  const scrolled = useScrolled(floating);

  const links = (
    <>
      <a className={styles.navLink} href={`${homePath(locale)}#features`}>{t.header.features}</a>
      <Link className={styles.navLink} to={docsPath(locale)}>{t.header.docs}</Link>
      <a className={styles.navLink} href={SITE.demoPath}>{t.header.demo}</a>
      <a className={styles.iconLink} href={SITE.githubUrl} aria-label="GitHub">
        <GitHubIcon />
      </a>
      <Link
        className={styles.language}
        to={otherLocalePath}
        hrefLang={otherLocale}
        lang={otherLocale}
        aria-label={t.header.changeLanguage}
      >
        <GlobeIcon />
        {t.header.switchLanguage}
      </Link>
      <Link className={styles.cta} to={docsPath(locale)}>{t.header.getStarted}</Link>
    </>
  );

  const brand = (
    <Link className={styles.brand} to={homePath(locale)}>
      <img className={styles.logo} src="/favicon.svg" alt="" />
      {SITE.name}
    </Link>
  );

  if (floating) {
    return (
      <header className={styles.floatingHeader}>
        <nav className={styles.pill} data-scrolled={scrolled} aria-label="Main">
          {brand}
          {links}
        </nav>
      </header>
    );
  }

  return (
    <header className={styles.header}>
      <div className={`${container} ${styles.inner}`}>
        {brand}
        <nav className={styles.nav} aria-label="Main">
          {links}
        </nav>
      </div>
    </header>
  );
}

function useScrolled(enabled: boolean): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [enabled]);
  return scrolled;
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 19c-4 1.5-4-2-6-2.5m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}
