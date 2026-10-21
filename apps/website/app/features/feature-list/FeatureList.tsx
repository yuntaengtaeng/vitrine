import { useMemo, useRef } from "react";
import { useI18n } from "../../i18n/locale";
import { CodeSnippet } from "../../components/CodeSnippet";
import { Caption } from "../../components/Caption";
import { SectionHeading } from "../../components/SectionHeading";
import { container, section } from "../../styles/layout.css";
import { FeatureShowcase } from "./FeatureShowcase";
import { useFeatureTour } from "./useFeatureTour";
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
  globals: `// src/vitrine.preview.tsx
export const globals = {
  theme: { label: "Theme", options: ["light", "dark"] },
};`,
  groups: `/** @preview name="Inputs/Button" */
export const Primary = () => <Button />;`,
  viewport: `vitrine({
  viewports: (defaults) => [
    ...defaults,
    { name: "Breakpoint", width: 800 },
  ],
});`,
  static: `vitrine({ plugins: [vitrineStatic()] });

$ npx vitrine-static build`,
};

export function FeatureList() {
  const { t } = useI18n();
  const { groups, items } = t.features;
  const sectionRef = useRef<HTMLElement>(null);
  const order = useMemo(() => items.map((item) => item.id), [items]);
  const [activeId, choose] = useFeatureTour(order, sectionRef);
  const active = items.find((item) => item.id === activeId) ?? items[0];
  const code = FEATURE_CODE[active.id];

  return (
    <section ref={sectionRef} id="features" className={section}>
      <div className={container}>
        <SectionHeading label={t.features.label} title={t.features.title} />
        <div className={styles.tabs} role="tablist" aria-label={t.features.label}>
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              role="tab"
              aria-selected={group.id === active.group}
              className={styles.tab}
              onClick={() => choose(items.find((item) => item.group === group.id)?.id ?? active.id)}
            >
              {group.label}
            </button>
          ))}
        </div>
        <div className={styles.layout} role="tabpanel">
          <div className={styles.catalog}>
            <ul className={styles.list}>
              {items
                .filter((item) => item.group === active.group)
                .map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={styles.item}
                      aria-pressed={item.id === active.id}
                      onClick={() => choose(item.id)}
                    >
                      {item.title}
                    </button>
                  </li>
                ))}
            </ul>
            <div key={active.id} className={styles.detail}>
              <Caption title={active.title} medium={active.medium} />
              <p className={styles.text}>{active.text}</p>
              {code && <CodeSnippet code={code} />}
            </div>
          </div>
          <FeatureShowcase activeFeature={active.id} />
        </div>
      </div>
    </section>
  );
}
