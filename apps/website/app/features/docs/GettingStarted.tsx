import { CodeSnippet } from "../../components/CodeSnippet";
import { CopyCommand } from "../../components/CopyCommand";
import { useI18n } from "../../i18n/locale";
import { SITE } from "../../site";
import { container } from "../../styles/layout.css";
import * as styles from "./GettingStarted.css";

const VITE_CONFIG = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vitrine from "vite-plugin-react-vitrine";

export default defineConfig({
  plugins: [react(), vitrine()],
});`;

const FIRST_PREVIEW = `/** @preview */
export function Button() {
  return <button>Save</button>;
}`;

const PREVIEW_DECLARATIONS = `/** @preview */
export const PrimaryButton = () => <Button />;

/** @preview name="Inputs/Danger button" */
export function DangerButton() {
  return <Button tone="danger" />;
}

/** @preview */
export default () => <Button />;`;

const PREVIEW_OPTIONS = `import { preview } from "vite-plugin-react-vitrine/preview";

/** @preview */
export const Button = (props: ButtonProps) => (
  <button>{props.children}</button>
);

preview(Button, {
  args: { tone: "primary", children: "Save" },
  controls: { tone: "radio" },
  variants: {
    primary: { name: "Primary", args: { tone: "primary" } },
    danger: { name: "Danger", args: { tone: "danger" } },
  },
  defaultVariant: "primary",
});`;

export function GettingStarted() {
  const { locale, t } = useI18n();

  return (
    <main>
      <header className={styles.intro}>
        <div className={container}>
          <p className={styles.label}>{t.docs.label}</p>
          <h1 className={styles.title}>{t.docs.title}</h1>
          <p className={styles.lead}>{t.docs.lead}</p>
        </div>
      </header>

      <div className={`${container} ${styles.guide}`}>
        <nav className={styles.contents} aria-label={t.docs.onThisPage}>
          <span className={styles.contentsLabel}>{t.docs.onThisPage}</span>
          <a className={styles.contentsLink} href="#getting-started">{t.docs.label}</a>
          <a className={styles.contentsLink} href="#preview-declarations">{t.docs.declarations.title}</a>
          <a className={styles.contentsLink} href="#controls-and-variants">{t.docs.controls.title}</a>
        </nav>

        <section id="getting-started">
          <ol className={styles.steps}>
            {t.docs.steps.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <div className={styles.stepNumber}>{String(index + 1).padStart(2, "0")}</div>
                <div className={styles.stepBody}>
                  <h2 className={styles.stepTitle}>{step.title}</h2>
                  <p className={styles.stepText}>{step.text}</p>
                  {index === 0 && (
                    <CopyCommand command={SITE.installCommand} copyLabel={t.hero.copy} copiedLabel={t.hero.copied} />
                  )}
                  {index === 1 && <CodeSnippet code={VITE_CONFIG} />}
                  {index === 2 && <CodeSnippet code={FIRST_PREVIEW} />}
                  {index === 3 && (
                    <div className={styles.address}>
                      <span>{t.docs.openGallery}</span>
                      <code className={styles.addressCode}>http://localhost:5173/__vitrine</code>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="preview-declarations" className={styles.docSection}>
          <div>
            <p className={styles.sectionLabel}>@preview</p>
            <h2 className={styles.docTitle}>{t.docs.declarations.title}</h2>
            <p className={styles.docLead}>{t.docs.declarations.lead}</p>
          </div>
          <div className={styles.docContent}>
            <CodeSnippet code={PREVIEW_DECLARATIONS} />
            <ul className={styles.rules}>
              {t.docs.declarations.rules.map((rule) => <li key={rule}>{rule}</li>)}
            </ul>
          </div>
        </section>

        <section id="controls-and-variants" className={styles.docSection}>
          <div>
            <p className={styles.sectionLabel}>preview()</p>
            <h2 className={styles.docTitle}>{t.docs.controls.title}</h2>
            <p className={styles.docLead}>{t.docs.controls.lead}</p>
          </div>
          <div className={styles.docContent}>
            <CodeSnippet code={PREVIEW_OPTIONS} />
            <p className={styles.supported}>{t.docs.controls.supported}</p>
            <dl className={styles.options}>
              {t.docs.controls.options.map((option) => (
                <div key={option.name} className={styles.option}>
                  <dt className={styles.optionName}><code>{option.name}</code></dt>
                  <dd className={styles.optionDescription}>{option.text}</dd>
                </div>
              ))}
            </dl>
            <p className={styles.note}>{t.docs.controls.note}</p>
          </div>
        </section>

        <aside className={styles.next}>
          <h2 className={styles.nextTitle}>{t.docs.nextTitle}</h2>
          <p className={styles.nextText}>{t.docs.nextText}</p>
          <div className={styles.links}>
            <a className={styles.primaryLink} href={SITE.marketplaceUrl}>{t.docs.extension}</a>
            <a className={styles.textLink} href={locale === "ko" ? SITE.setupGuideKoUrl : SITE.setupGuideUrl}>{t.docs.fullGuide}</a>
          </div>
        </aside>
      </div>
    </main>
  );
}
