import type { ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";
import { docsPageFromPath, docsPath, type DocsPage, useI18n } from "../../i18n/locale";
import { container } from "../../styles/layout.css";
import * as styles from "./DocsLayout.css";

type DocsLayoutProps = { children: ReactNode };

export function DocsLayout({ children }: DocsLayoutProps) {
  const { locale, t } = useI18n();
  const currentPage = docsPageFromPath(useLocation().pathname);
  const links: Array<{ page: DocsPage; label: string }> = [
    { page: "getting-started", label: t.docs.label },
    { page: "previews", label: t.docs.declarations.title },
    { page: "preview-function", label: t.docs.controls.title },
  ];

  const navigation = (
    <nav className={styles.navigation} aria-label={t.header.docs}>
      {links.map(({ page, label }) => (
        <Link
          key={page}
          className={styles.navigationLink}
          to={docsPath(locale, page)}
          aria-current={currentPage === page ? "page" : undefined}
        >
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      <SiteHeader />
      <div className={`${container} ${styles.shell}`}>
        <aside className={styles.sidebar}>
          <p className={styles.sidebarTitle}>{t.header.docs}</p>
          {navigation}
        </aside>
        <details className={styles.mobileNavigation}>
          <summary className={styles.mobileSummary}>{t.header.docs}</summary>
          {navigation}
        </details>
        {children}
      </div>
      <SiteFooter />
    </>
  );
}
