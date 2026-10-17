import { Fragment, type CSSProperties, type ReactNode } from "react";
import { COLOR } from "../../../tokens/color";
import { FONT_SIZE } from "../../../tokens/fontSize";
import { ChevronDownIcon } from "../../shared/icons/ChevronDownIcon";
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
  Chevron: { transition: "transform 120ms ease" } satisfies CSSProperties,
  Count: { marginLeft: "auto", fontWeight: 500, fontVariantNumeric: "tabular-nums" } satisfies CSSProperties,
  GroupChildren: { marginLeft: 8 } satisfies CSSProperties,
};

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
            style={Styled.GroupToggle}
            onClick={() => props.onToggleGroup(node.key)}
          >
            <ChevronDownIcon size={12} style={{ ...Styled.Chevron, transform: expanded ? "none" : "rotate(-90deg)" }} />
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
