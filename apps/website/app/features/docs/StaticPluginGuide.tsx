import { useI18n } from "../../i18n/locale";
import { SITE } from "../../site";
import { CodeSnippet } from "../../components/CodeSnippet";
import { CopyCommand } from "../../components/CopyCommand";
import { DocHeader } from "./DocHeader";
import { OptionList } from "./OptionList";
import * as styles from "./docs.css";

const INSTALL = "npm install -D vitrine-plugin-static";

const CONFIG = `import vitrine from "vite-plugin-react-vitrine";
import vitrineStatic from "vitrine-plugin-static";

export default defineConfig({
  plugins: [react(), vitrine({ plugins: [vitrineStatic()] })],
});`;

const BUILD = "npx vitrine-static build";

const APP_PLUGINS = `const isGalleryBuild = process.env.VITRINE_STATIC_BUILD === "1";

export default defineConfig({
  plugins: [react(), vitrine({ plugins: [vitrineStatic()] }), !isGalleryBuild && dts()],
});`;

export function StaticPluginGuide() {
  const { t } = useI18n();
  const page = t.docs.pluginStatic;
  const stepContent = [
    <CopyCommand key="install" command={INSTALL} copyLabel={t.hero.copy} copiedLabel={t.hero.copied} />,
    <CodeSnippet key="config" code={CONFIG} />,
    <CopyCommand key="build" command={BUILD} copyLabel={t.hero.copy} copiedLabel={t.hero.copied} />,
  ];

  return (
    <main className={styles.article}>
      <DocHeader label="Plugins" title={page.title} lead={page.lead} />
      <div className={styles.guide}>
        <div className={styles.docContent}>
          <ol className={styles.steps}>
            {page.steps.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <div className={styles.stepNumber}>{String(index + 1).padStart(2, "0")}</div>
                <div className={styles.stepBody}>
                  <h2 className={styles.stepTitle}>{step.title}</h2>
                  <p className={styles.stepText}>{step.text}</p>
                  {stepContent[index]}
                </div>
              </li>
            ))}
          </ol>
          <OptionList items={page.options} />
          <section className={styles.providerSection}>
            <h2 className={styles.providerTitle}>{page.includedTitle}</h2>
            <p className={styles.providerText}>{page.included}</p>
            <p className={styles.providerText}>{page.excluded}</p>
            <h3 className={styles.providerSubtitle}>{page.appPluginsTitle}</h3>
            <p className={styles.providerText}>{page.appPluginsText}</p>
            <CodeSnippet code={APP_PLUGINS} />
          </section>
          <a className={styles.textLink} href={SITE.demoPath}>{page.demo}</a>
        </div>
      </div>
    </main>
  );
}
