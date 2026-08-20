import type { AutoControlsProps } from "./AutoControls.types";

/** @preview name=Automatic controls */
export const AutoControls = ({
  label,
  count,
  enabled,
  size,
  priority,
}: AutoControlsProps) => {
  const padding = size === "large" ? 24 : size === "medium" ? 16 : 10;

  return (
    <section
      style={{
        width: 280,
        padding,
        border: "1px solid #cbd5e1",
        borderRadius: 8,
        background: enabled ? "#ecfdf5" : "#f8fafc",
        opacity: enabled ? 1 : 0.55,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <strong>{label || "Type a label"}</strong>
      <p style={{ margin: "0.5rem 0 0" }}>Count: {count}</p>
      <p style={{ margin: "0.25rem 0 0" }}>Size: {size}</p>
      <p style={{ margin: "0.25rem 0 0" }}>Priority: {priority ?? "unset"}</p>
    </section>
  );
};
