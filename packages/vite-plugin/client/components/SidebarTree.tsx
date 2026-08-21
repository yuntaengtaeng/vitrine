import type { CSSProperties } from "react";
import { COLOR } from "../tokens/color";
import { FONT_SIZE } from "../tokens/fontSize";
import { SidebarItem } from "./SidebarItem";
import type { SidebarNode } from "./sidebarGroups";

const Styled = {
  GroupLabel: {
    fontSize: FONT_SIZE.label,
    fontWeight: 700,
    letterSpacing: "0.03em",
    color: COLOR.label,
    padding: "0.5rem 0.7rem 0.2rem",
  } satisfies CSSProperties,
  GroupChildren: { marginLeft: 8 } satisfies CSSProperties,
};

export const SidebarTree = (props: {
  nodes: SidebarNode[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) => (
  <>
    {props.nodes.map((node) =>
      node.type === "group" ? (
        <div key={node.key}>
          <div style={Styled.GroupLabel}>{node.label}</div>
          <div style={Styled.GroupChildren}>
            <SidebarTree nodes={node.children} activeId={props.activeId} onSelect={props.onSelect} />
          </div>
        </div>
      ) : (
        <SidebarItem
          key={node.entry.id}
          entry={node.entry}
          isActive={node.entry.id === props.activeId}
          onSelect={props.onSelect}
        />
      ),
    )}
  </>
);
