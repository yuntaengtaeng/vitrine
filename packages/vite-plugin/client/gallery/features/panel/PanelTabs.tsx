import type { KeyboardEvent, ReactNode } from "react";
import * as styles from "./PanelTabs.css";

const PANEL_ID = "vitrine-panel";
const tabId = (id: string) => `vitrine-panel-tab-${id}`;

export const PanelTabs = (props: {
  tabs: readonly { id: string; label: string }[];
  activeId: string;
  onSelect: (id: string) => void;
  /** 지금 탭에 딸린 버튼, 탭 줄 오른쪽에 둬서 내용이 밀리지 않게 함 */
  actions?: ReactNode;
  children: ReactNode;
}) => {
  const active = props.tabs.find((tab) => tab.id === props.activeId) ?? props.tabs[0];

  const moveSelection = (event: KeyboardEvent, index: number) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const next = props.tabs[(index + step + props.tabs.length) % props.tabs.length];
    props.onSelect(next.id);
    document.getElementById(tabId(next.id))?.focus();
  };

  return (
    <section className={styles.root}>
      <div className={styles.bar}>
        {props.tabs.length > 1 && (
          <div className={styles.tabs} role="tablist" aria-label="Panel">
            {props.tabs.map((tab, index) => (
              <button
                key={tab.id}
                id={tabId(tab.id)}
                type="button"
                role="tab"
                aria-selected={tab.id === active.id}
                aria-controls={PANEL_ID}
                tabIndex={tab.id === active.id ? 0 : -1}
                className={styles.tab}
                onClick={() => props.onSelect(tab.id)}
                onKeyDown={(event) => moveSelection(event, index)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
        {props.actions && <div className={styles.actions}>{props.actions}</div>}
      </div>
      <div
        id={PANEL_ID}
        role="tabpanel"
        aria-labelledby={props.tabs.length > 1 ? tabId(active.id) : undefined}
        aria-label={props.tabs.length > 1 ? undefined : active.label}
        className={styles.panel}
      >
        {props.children}
      </div>
    </section>
  );
};
