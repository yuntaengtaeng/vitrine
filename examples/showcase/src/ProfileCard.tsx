import { preview } from "vite-plugin-react-vitrine/preview";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { useLocale } from "./locale";

const LABELS = {
  en: { follow: "Follow", message: "Message" },
  ko: { follow: "팔로우", message: "메시지" },
} as const;

/** @preview name="People/Profile card" */
export const ProfileCard = ({
  name,
  role,
  online = false,
  status = "live",
  onFollow,
}: {
  name: string;
  role: string;
  online?: boolean;
  status?: "live" | "draft" | "archived";
  onFollow?: () => void;
}) => {
  const labels = LABELS[useLocale()];
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
  return (
    <article className="profile">
      <header>
        <span className="avatar" data-online={online}>
          {initials}
        </span>
        <div>
          <h3>{name}</h3>
          <p>{role}</p>
        </div>
        <span style={{ marginLeft: "auto" }}>
          <Badge status={status} />
        </span>
      </header>
      <footer>
        <Button size="sm" onClick={onFollow}>
          {labels.follow}
        </Button>
        <Button size="sm" tone="neutral">
          {labels.message}
        </Button>
      </footer>
    </article>
  );
};

preview(ProfileCard, {
  args: { name: "Ada Park", role: "Design systems", online: true, onFollow: () => {} },
  variants: {
    online: { name: "Online" },
    away: { name: "Away", args: { name: "Min Seo", role: "Frontend", online: false, status: "draft" } },
    korean: { name: "Korean", globals: { locale: "ko" } },
  },
});
