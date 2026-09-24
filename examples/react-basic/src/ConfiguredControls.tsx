import { preview } from "vite-plugin-react-vitrine/preview";

interface ConfiguredControlsProps {
  title: string;
  tone: "info" | "success" | "warning";
  amount: number;
  outlined: boolean;
}

/** @preview name="Configured controls" */
export const ConfiguredControls = ({
  title,
  tone,
  amount,
  outlined,
}: ConfiguredControlsProps) => {
  const colors = {
    info: ["#eff6ff", "#2563eb"],
    success: ["#ecfdf5", "#059669"],
    warning: ["#fffbeb", "#d97706"],
  } as const;
  const [background, color] = colors[tone];

  return (
    <div
      style={{
        width: 280,
        padding: "1rem",
        border: outlined ? `2px solid ${color}` : "2px solid transparent",
        borderRadius: 8,
        background,
        color,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <strong>{title}</strong>
      <div style={{ marginTop: "0.5rem" }}>Amount: {amount}</div>
    </div>
  );
};

preview(ConfiguredControls, {
  args: {
    title: "Configured with preview()",
    tone: "success",
    amount: 25,
    outlined: true,
  },
  controls: {
    tone: "radio",
  },
});
