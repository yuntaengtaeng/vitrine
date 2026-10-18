import { preview } from "vite-plugin-react-vitrine/preview";

/** @preview name="Feedback/Badge" */
export const Badge = ({ status }: { status: "live" | "draft" | "archived" }) => (
  <span className="badge" data-status={status}>
    {status[0].toUpperCase() + status.slice(1)}
  </span>
);

preview(Badge, {
  args: { status: "live" },
  variants: {
    live: { name: "Live" },
    draft: { name: "Draft", args: { status: "draft" } },
    archived: { name: "Archived", args: { status: "archived" } },
  },
});
