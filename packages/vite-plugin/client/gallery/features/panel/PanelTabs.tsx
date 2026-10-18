import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { ChevronDownIcon } from "../../shared/icons/ChevronDownIcon";
import { clampPanelHeight } from "./panelSize";
import { PanelResizer } from "./PanelResizer";
import { usePanelSize } from "./usePanelSize";
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
  const [size, updateSize] = usePanelSize();
  const rootRef = useRef<HTMLElement>(null);

  const select = (id: string) => {
    props.onSelect(id);
    if (size.collapsed) updateSize({ collapsed: false });
  };

  const resize = (height: number) => {
    const available = rootRef.current?.parentElement?.clientHeight ?? height;
    updateSize({ height: clampPanelHeight(height, available) });
  };

  const toggleCollapsed = () => updateSize({ collapsed: !size.collapsed });

  const moveSelection = (event: KeyboardEvent, index: number) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const next = props.tabs[(index + step + props.tabs.length) % props.tabs.length];
    select(next.id);
    document.getElementById(tabId(next.id))?.focus();
  };

  return (
    <section
      ref={rootRef}
      className={size.collapsed ? styles.collapsedRoot : styles.root}
      style={size.collapsed ? undefined : { height: size.height }}
    >
      {!size.collapsed && (
        <PanelResizer panelRef={rootRef} height={size.height} onResize={resize} onCollapse={toggleCollapsed} />
      )}
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
                onClick={() => select(tab.id)}
                onKeyDown={(event) => moveSelection(event, index)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
        <div className={styles.actions}>
          {!size.collapsed && props.actions}
          <button
            type="button"
            className={styles.collapseButton}
            aria-label={size.collapsed ? "Expand panel" : "Collapse panel"}
            aria-expanded={!size.collapsed}
            aria-controls={PANEL_ID}
            onClick={toggleCollapsed}
          >
            <ChevronDownIcon size={14} className={size.collapsed ? styles.expandIcon : undefined} />
          </button>
        </div>
      </div>
      <div
        id={PANEL_ID}
        role="tabpanel"
        aria-labelledby={props.tabs.length > 1 ? tabId(active.id) : undefined}
        aria-label={props.tabs.length > 1 ? undefined : active.label}
        className={styles.panel}
        hidden={size.collapsed}
      >
        {props.children}
      </div>
    </section>
  );
};
