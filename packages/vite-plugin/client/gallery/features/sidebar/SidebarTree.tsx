import { Fragment, type ReactNode } from "react";
import { ChevronDownIcon } from "../../shared/icons/ChevronDownIcon";
import { countSidebarEntries, type SidebarNode } from "./sidebarNodes";
import * as styles from "./SidebarTree.css";

export const SidebarTree = (props: {
  nodes: SidebarNode[];
  renderEntry: (entry: GalleryPreviewEntry) => ReactNode;
  collapsedKeys: ReadonlySet<string>;
  onToggleGroup: (key: string) => void;
  /** 모든 group 강제 펼침 여부 (검색 결과가 접힌 group에 숨지 않게 함) */
  forceExpanded: boolean;
}) => (
  <>
    {props.nodes.map((node) => {
      if (node.type === "entry") {
        return <Fragment key={node.entry.id}>{props.renderEntry(node.entry)}</Fragment>;
      }
      const expanded = props.forceExpanded || !props.collapsedKeys.has(node.key);
      return (
        <div key={node.key}>
          <button
            type="button"
            aria-expanded={expanded}
            className={styles.groupToggle}
            onClick={() => props.onToggleGroup(node.key)}
          >
            <ChevronDownIcon size={12} className={styles.chevron} />
            {node.label}
            <span className={styles.count}>{countSidebarEntries(node.children)}</span>
          </button>
          {expanded && (
            <div className={styles.groupChildren}>
              <SidebarTree {...props} nodes={node.children} />
            </div>
          )}
        </div>
      );
    })}
  </>
);
