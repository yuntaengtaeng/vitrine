import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useFocusShortcut } from "./useFocusShortcut";
import { COLOR } from "../../../tokens/color";
import { FONT_SIZE } from "../../../tokens/fontSize";
import { FIELD_BORDER, FIELD_BORDER_RADIUS, FIELD_FOCUS } from "../../shared/ui/fieldStyle";
import { SidebarTree } from "./SidebarTree";
import { buildSidebarTree, countSidebarEntries, filterSidebarTree } from "./sidebarNodes";

const Styled = {
  Root: {
    width: 240,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    background: COLOR.sidebarBg,
    borderRight: `1px solid ${COLOR.border}`,
    boxSizing: "border-box",
  } satisfies CSSProperties,
  Header: {
    display: "flex",
    alignItems: "baseline",
    padding: "1rem 1.45rem 0.6rem",
    fontSize: FONT_SIZE.label,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: COLOR.label,
  } satisfies CSSProperties,
  Count: { marginLeft: "auto", letterSpacing: 0, fontWeight: 500, fontVariantNumeric: "tabular-nums" } satisfies CSSProperties,
  Search: { position: "relative", margin: "0 0.75rem 0.5rem" } satisfies CSSProperties,
  SearchInput: {
    width: "100%",
    height: 32,
    padding: "0 1.9rem 0 0.65rem",
    boxSizing: "border-box",
    border: FIELD_BORDER,
    borderRadius: FIELD_BORDER_RADIUS,
    ...FIELD_FOCUS,
    background: COLOR.surface,
    color: COLOR.body,
    fontFamily: "inherit",
    fontSize: FONT_SIZE.secondary,
  } satisfies CSSProperties,
  Shortcut: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: "translateY(-50%)",
    padding: "0 5px",
    border: FIELD_BORDER,
    borderRadius: 4,
    color: COLOR.label,
    fontSize: "0.7rem",
    pointerEvents: "none",
  } satisfies CSSProperties,
  Tree: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    // 스크롤은 유지하고 스크롤바만 숨김
    scrollbarWidth: "none",
    padding: "0 0.75rem 0.75rem",
  } satisfies CSSProperties,
  Message: { margin: 0, padding: "0.4rem 0.7rem", color: COLOR.muted, fontSize: FONT_SIZE.secondary } satisfies CSSProperties,
};

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
    <nav style={Styled.Root} aria-label="Previews">
      <div style={Styled.Header}>
        Previews
        <span style={Styled.Count}>{props.entries.length}</span>
      </div>
      {props.entries.length > 0 && (
        <div style={Styled.Search}>
          <input
            ref={searchRef}
            type="search"
            aria-label="Search previews"
            placeholder="Search"
            autoComplete="off"
            style={Styled.SearchInput}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setQuery("");
            }}
          />
          {!searching && <kbd style={Styled.Shortcut} aria-hidden="true">/</kbd>}
        </div>
      )}
      <div style={Styled.Tree}>
        {props.entries.length === 0 && (
          <p style={Styled.Message}>
            No @preview exports found yet. Add a `/** @preview */` comment above an export.
          </p>
        )}
        {searching && countSidebarEntries(visibleTree) === 0 && (
          <p style={Styled.Message} role="status">
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
