import type { ReactNode } from "react";
import { preview } from "vite-plugin-react-vitrine/preview";

/** @preview name="Actions/Button" */
export const Button = ({
  tone = "primary",
  size = "md",
  loading = false,
  children,
  onClick,
}: {
  tone?: "primary" | "neutral" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) => (
  <button type="button" className="button" data-tone={tone} data-size={size} disabled={loading} onClick={onClick}>
    {loading && <span className="spinner" />}
    {children}
  </button>
);

preview(Button, {
  args: { tone: "primary", size: "md", children: "Publish" },
  variants: {
    primary: { name: "Primary" },
    neutral: { name: "Neutral", args: { tone: "neutral", children: "Save draft" } },
    danger: { name: "Danger", args: { tone: "danger", children: "Delete" } },
    loading: { name: "Loading", args: { loading: true, children: "Publishing" } },
  },
});
