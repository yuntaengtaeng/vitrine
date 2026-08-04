import { useState, type CSSProperties } from "react";
import { COLOR } from "../tokens/color";
import { FONT_SIZE } from "../tokens/fontSize";

const Styled = {
  Item: {
    base: {
      display: "block",
      width: "100%",
      textAlign: "left",
      padding: "0.55rem 0.7rem",
      marginBottom: 2,
      border: "none",
      background: "transparent",
      color: COLOR.body,
      cursor: "pointer",
      borderRadius: 6,
      fontSize: FONT_SIZE.base,
      fontFamily: "inherit",
    } satisfies CSSProperties,
    active: { background: COLOR.activeBg, color: COLOR.activeText, fontWeight: 600 } satisfies CSSProperties,
    hover: { background: COLOR.hoverBg } satisfies CSSProperties,
  },
};

export const SidebarItem = (props: {
  entry: GalleryPreviewEntry;
  isActive: boolean;
  onSelect: (id: string) => void;
}) => {
  const { entry, isActive, onSelect } = props;
  const [hover, setHover] = useState(false);
  const style = {
    ...Styled.Item.base,
    ...(isActive ? Styled.Item.active : hover ? Styled.Item.hover : {}),
  };

  return (
    <button
      style={style}
      title={entry.file}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onSelect(entry.id)}
    >
      {entry.name}
    </button>
  );
};
