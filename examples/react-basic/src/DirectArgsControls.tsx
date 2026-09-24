import type { ReactNode } from "react";
import { preview } from "vite-plugin-react-vitrine/preview";

interface DirectArgsControlsProps {
  children: ReactNode;
  user: { name: string; role: string };
  tags: string[];
  onSelect: (tag: string) => void;
  weight: 1 | 3 | 5;
  mode: string;
  label?: string;
  hint?: string;
}

/** @preview name="Direct args controls" */
export const DirectArgsControls = ({
  children,
  user,
  tags,
  onSelect,
  weight,
  mode,
  label,
  hint,
}: DirectArgsControlsProps) => (
  <div
    style={{
      width: 300,
      padding: "1rem",
      border: "1px solid #cbd5e1",
      borderRadius: 8,
      fontFamily: "system-ui, sans-serif",
    }}
  >
    <strong>{children}</strong>
    <p style={{ margin: "0.5rem 0 0" }}>
      User: {user.name} ({user.role})
    </p>
    <p style={{ margin: "0.25rem 0 0" }}>
      Tags:{" "}
      {tags.map((tag) => (
        <button key={tag} onClick={() => onSelect(tag)} style={{ marginRight: 4 }}>
          {tag}
        </button>
      ))}
    </p>
    <p style={{ margin: "0.25rem 0 0" }}>Weight: {weight}</p>
    <p style={{ margin: "0.25rem 0 0" }}>Mode: {mode}</p>
    <p style={{ margin: "0.25rem 0 0" }}>Label: {label ?? "unset"}</p>
    <p style={{ margin: "0.25rem 0 0" }}>Hint: {hint ?? "unset"}</p>
  </div>
);

preview(DirectArgsControls, {
  args: {
    children: "Preview children",
    user: { name: "Vitrine", role: "maintainer" },
    tags: ["alpha", "beta"],
    onSelect: (tag) => console.log("selected", tag),
    weight: 5,
    mode: "comfortable",
    label: "Explicit label",
    hint: undefined,
  },
  controls: {
    mode: {
      type: "radio",
      options: ["compact", "comfortable"],
    },
  },
});
