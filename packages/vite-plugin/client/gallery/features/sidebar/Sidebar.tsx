import { useRef, useState, type ReactNode } from "react";
import * as styles from "./Sidebar.css";
import { SidebarTree } from "./SidebarTree";
import { useFocusShortcut } from "./useFocusShortcut";
import { buildSidebarTree, countSidebarEntries, filterSidebarTree } from "./sidebarNodes";

export const Sidebar = (props: {
  entries: GalleryPreviewEntry[];
  renderEntry: (entry: GalleryPreviewEntry) => ReactNode;
}) => {
  const [query, setQuery] = useState("");
  const [collapsedKeys, setCollapsedKeys] = useState<ReadonlySet<string>>(new Set());
  const searchRef = useRef<HTMLInputElement>(null);
  useFocusShortcut(searchRef, "/");

  const tree = buildSidebarTree(props.entries);
  const visibleTree = filterSidebarTree(tree, query);
  const searching = query.trim().length > 0;

  const toggleGroup = (key: string) => {
    setCollapsedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <nav className={styles.root} aria-label="Previews">
      <div className={styles.header}>
        Previews
        <span className={styles.count}>{props.entries.length}</span>
      </div>
      {props.entries.length > 0 && (
        <div className={styles.search}>
          <input
            ref={searchRef}
            type="search"
            aria-label="Search previews"
            placeholder="Search"
            autoComplete="off"
            className={styles.searchInput}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setQuery("");
            }}
          />
          {!searching && <kbd className={styles.shortcut} aria-hidden="true">/</kbd>}
        </div>
      )}
      <div className={styles.tree}>
        {props.entries.length === 0 && (
          <p className={styles.message}>No previews yet</p>
        )}
        {searching && countSidebarEntries(visibleTree) === 0 && (
          <p className={styles.message} role="status">
            No previews match &ldquo;{query.trim()}&rdquo;
          </p>
        )}
        <SidebarTree
          nodes={visibleTree}
          renderEntry={props.renderEntry}
          collapsedKeys={collapsedKeys}
          onToggleGroup={toggleGroup}
          forceExpanded={searching}
        />
      </div>
    </nav>
  );
};
