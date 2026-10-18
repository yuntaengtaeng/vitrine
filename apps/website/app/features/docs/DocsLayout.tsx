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
  const groups: Array<{ title: string; links: Array<{ page: DocsPage; label: string }> }> = [
    {
      title: t.docs.guideGroup,
      links: [
        { page: "getting-started", label: t.docs.label },
        { page: "previews", label: t.docs.declarations.title },
        { page: "preview-function", label: t.docs.controls.title },
        { page: "gallery", label: t.docs.gallery.title },
        { page: "options", label: t.docs.options.title },
      ],
    },
    {
      title: t.docs.pluginsGroup,
      links: [
        { page: "plugins", label: t.docs.plugins.navLabel },
        { page: "plugins/static", label: t.docs.pluginStatic.title },
      ],
    },
  ];

  const navigation = (
    <nav className={styles.navigation} aria-label={t.header.docs}>
      {groups.map((group) => (
        <div key={group.title} className={styles.navigationGroup}>
          <p className={styles.sidebarTitle}>{group.title}</p>
          {group.links.map(({ page, label }) => (
            <Link
              key={page}
              className={styles.navigationLink}
              to={docsPath(locale, page)}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      <SiteHeader />
      <div className={`${container} ${styles.shell}`}>
        <aside className={styles.sidebar}>
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
