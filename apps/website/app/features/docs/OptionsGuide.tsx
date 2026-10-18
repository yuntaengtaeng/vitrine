import { useI18n } from "../../i18n/locale";
import { CodeSnippet } from "../../components/CodeSnippet";
import { DocHeader } from "./DocHeader";
import { OptionList } from "./OptionList";
import * as styles from "./docs.css";

const ALL_OPTIONS = `vitrine({
  include: ["src/**/*.{tsx,jsx}"],
  setupFile: "./src/vitrine.preview.tsx",
  viewports: (defaults) => [...defaults, { name: "Breakpoint", width: 800 }],
  snapshots: { limit: 20 },
  plugins: [],
});`;

const VIEWPORTS = `vitrine({
  // Mobile 375, Tablet 768, Desktop 1280 are the defaults
  viewports: (defaults) => [...defaults, { name: "Breakpoint", width: 800 }],
});`;

const SNAPSHOTS = `vitrine({
  snapshots: {
    limit: 30,
    // Keep at most one save every 3 seconds
    shouldRecord: ({ lastRecordedAt, now }) => lastRecordedAt === null || now - lastRecordedAt > 3000,
  },
});`;

export function OptionsGuide() {
  const { t } = useI18n();
  const page = t.docs.options;

  return (
    <main className={styles.article}>
      <DocHeader label="vitrine()" title={page.title} lead={page.lead} />
      <div className={styles.guide}>
        <div className={styles.docContent}>
          <CodeSnippet code={ALL_OPTIONS} />
          <OptionList items={page.items} />
          <section className={styles.providerSection}>
            <h2 className={styles.providerTitle}>{page.viewportsTitle}</h2>
            <p className={styles.providerText}>{page.viewportsText}</p>
            <CodeSnippet code={VIEWPORTS} />
          </section>
          <section className={styles.providerSection}>
            <h2 className={styles.providerTitle}>{page.snapshotsTitle}</h2>
            <p className={styles.providerText}>{page.snapshotsText}</p>
            <CodeSnippet code={SNAPSHOTS} />
          </section>
        </div>
      </div>
    </main>
  );
}
