import { preview } from "vite-plugin-react-vitrine/preview";
import { useDarkMode } from "./DarkModeProvider";

/** @preview name="Context/Themed panel" */
export const ThemedPanel = ({ title }: { title: string }) => {
  const { dark, toggle } = useDarkMode();
  return (
    <section
      style={{
        width: 280,
        padding: "1.25rem",
        borderRadius: 12,
        background: dark ? "#172033" : "#f3f6fc",
        color: dark ? "#f8fafc" : "#172033",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <strong>{title}</strong>
      <p>The provider state stays mounted when controls update props</p>
      <button type="button" onClick={toggle}>
        Use {dark ? "light" : "dark"} mode
      </button>
    </section>
  );
};

preview(ThemedPanel, { args: { title: "Provider-backed preview" } });
