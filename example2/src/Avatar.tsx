export const Avatar = ({ initials = "VT" }: { initials?: string }) => (
  <div
    style={{
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      background: "#0f172a",
      color: "#38bdf8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, sans-serif",
      fontWeight: 700,
    }}
  >
    {initials}
  </div>
);

/** @preview */
export const DefaultAvatar = () => <Avatar />;

/** @preview name=Custom initials */
export const CustomAvatar = () => <Avatar initials="JS" />;
