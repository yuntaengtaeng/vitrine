import { Link } from "react-router";
import { docsPath, useI18n } from "../../i18n/locale";
import { CodeSnippet } from "../../components/CodeSnippet";
import { DocHeader } from "./DocHeader";
import * as styles from "./docs.css";

const REGISTER = `import vitrine from "vite-plugin-react-vitrine";
import vitrineStatic from "vitrine-plugin-static";

export default defineConfig({
  plugins: [react(), vitrine({ plugins: [vitrineStatic()] })],
});`;

export function PluginsOverview() {
  const { locale, t } = useI18n();
  const page = t.docs.plugins;

  return (
    <main className={styles.article}>
      <DocHeader label="vitrine({ plugins })" title={page.title} lead={page.lead} />
      <div className={styles.guide}>
        <div className={styles.docContent}>
          <section className={styles.providerSection}>
            <h2 className={styles.providerTitle}>{page.registerTitle}</h2>
            <p className={styles.providerText}>{page.registerText}</p>
            <CodeSnippet code={REGISTER} />
          </section>
          <section className={styles.providerSection}>
            <h2 className={styles.providerTitle}>{page.officialTitle}</h2>
            <ul className={styles.rules}>
              {page.official.map((plugin) => (
                <li key={plugin.name}>
                  <Link className={styles.textLink} to={docsPath(locale, "plugins/static")}>
                    <code>{plugin.name}</code>
                  </Link>
                  : {plugin.text}
                </li>
              ))}
            </ul>
          </section>
          <section className={styles.providerSection}>
            <h2 className={styles.providerTitle}>{page.writeTitle}</h2>
            <p className={styles.providerText}>{page.writeText}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
