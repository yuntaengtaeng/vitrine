import { createRoot } from "react-dom/client";
import previews from "virtual:vitrine-previews";
import { App } from "./components/App";

const root = document.getElementById("vitrine-root");
if (root) createRoot(root).render(<App entries={previews} />);
