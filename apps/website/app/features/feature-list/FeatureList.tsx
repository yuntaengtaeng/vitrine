import { useEffect, useRef, useState } from "react";
import { useI18n } from "../../i18n/locale";
import { CodeSnippet } from "../../components/CodeSnippet";
import { Placard } from "../../components/Placard";
import { SectionHeading } from "../../components/SectionHeading";
import { container, section } from "../../styles/layout.css";
import { FeatureShowcase } from "./FeatureShowcase";
import * as styles from "./FeatureList.css";

// 코드는 번역 대상이 아니라 사전 대신 기능 id로 연결
const FEATURE_CODE: Record<string, string> = {
  props: `interface ButtonProps {
  tone: "primary" | "danger";
  disabled?: boolean;
}`,
  variants: `preview(Button, {
  variants: {
    primary: { args: { tone: "primary" } },
    danger: { args: { tone: "danger" } },
  },
});`,
  groups: `/** @preview name="Inputs/Button" */
export const Primary = () => <Button />;`,
};

export function FeatureList() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);
  const [activeFeature, setActiveFeature] = useState(t.features.items[0].id);

  useEffect(() => {
    const entries = sectionRef.current?.querySelectorAll<HTMLElement>("[data-feature]");
    if (!entries) return;

    const observer = new IntersectionObserver(
      (changes) => {
        const visible = changes.find((change) => change.isIntersecting);
        const feature = visible?.target.getAttribute("data-feature");
        if (feature) setActiveFeature(feature);
      },
      { rootMargin: "-30% 0px -55%", threshold: 0 },
    );

    entries.forEach((entry) => observer.observe(entry));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="features" className={section}>
      <div className={`${container} ${styles.layout}`}>
        <div className={styles.heading}>
          <SectionHeading label={t.features.label} title={t.features.title} />
          <FeatureShowcase activeFeature={activeFeature} />
        </div>
        <ul className={styles.catalog}>
          {t.features.items.map((item) => {
            const code = FEATURE_CODE[item.id];
            return (
              <li key={item.id} className={styles.entry} data-feature={item.id}>
                <div className={styles.summary}>
                  <Placard title={item.title} medium={item.medium} />
                  <p className={styles.text}>{item.text}</p>
                </div>
                {code && <CodeSnippet code={code} />}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
