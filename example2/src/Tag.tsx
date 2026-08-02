export const Tag = ({
  label,
  tone = "info",
}: {
  label: string;
  tone?: "info" | "warning";
}) => {
  const colors =
    tone === "warning"
      ? { bg: "#78350f", fg: "#fde68a" }
      : { bg: "#0c4a6e", fg: "#7dd3fc" };

  return (
    <span
      style={{
        display: "inline-block",
        background: colors.bg,
        color: colors.fg,
        borderRadius: "4px",
        padding: "0.2rem 0.6rem",
        fontSize: "0.75rem",
        fontFamily: "system-ui, sans-serif",
        letterSpacing: "0.02em",
      }}
    >
      {label}
    </span>
  );
};

/** @preview name=Info tag */
export const InfoTag = () => <Tag label="beta" />;

/** @preview name=Warning tag */
export const WarningTag = () => <Tag label="deprecated" tone="warning" />;
