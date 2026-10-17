import type { CSSProperties } from "react";
import { COLOR } from "../../tokens/color";
import { FONT_SIZE } from "../../tokens/fontSize";
import { SidebarItem } from "./SidebarItem";
import { countSidebarEntries, type SidebarNode } from "./sidebarNodes";

const Styled = {
  GroupToggle: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    width: "100%",
    padding: "0.55rem 0.7rem 0.25rem",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: FONT_SIZE.label,
    fontWeight: 700,
    letterSpacing: "0.03em",
    color: COLOR.label,
    textAlign: "left",
  } satisfies CSSProperties,
  Chevron: {
    width: 10,
    height: 10,
    flexShrink: 0,
    transition: "transform 120ms ease",
  } satisfies CSSProperties,
  Count: { marginLeft: "auto", fontWeight: 500, fontVariantNumeric: "tabular-nums" } satisfies CSSProperties,
  GroupChildren: { marginLeft: 8 } satisfies CSSProperties,
};

export const SidebarTree = (props: {
  nodes: SidebarNode[];
  activeId: string | null;
  onSelect: (id: string) => void;
  collapsedKeys: ReadonlySet<string>;
  onToggleGroup: (key: string) => void;
  /** 모든 group 강제 펼침 여부 (검색 결과가 접힌 group에 숨지 않게 함) */
  forceExpanded: boolean;
}) => (
  <>
    {props.nodes.map((node) => {
      if (node.type === "entry") {
        return (
          <SidebarItem
            key={node.entry.id}
            entry={node.entry}
            isActive={node.entry.id === props.activeId}
            onSelect={props.onSelect}
          />
        );
      }
      const expanded = props.forceExpanded || !props.collapsedKeys.has(node.key);
      return (
        <div key={node.key}>
          <button
            type="button"
            aria-expanded={expanded}
            style={Styled.GroupToggle}
            onClick={() => props.onToggleGroup(node.key)}
          >
            <svg
              viewBox="0 0 10 10"
              aria-hidden="true"
              style={{ ...Styled.Chevron, transform: expanded ? "none" : "rotate(-90deg)" }}
            >
              <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            {node.label}
            <span style={Styled.Count}>{countSidebarEntries(node.children)}</span>
          </button>
          {expanded && (
            <div style={Styled.GroupChildren}>
              <SidebarTree {...props} nodes={node.children} />
            </div>
          )}
        </div>
      );
    })}
  </>
);
