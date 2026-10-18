import { createRoot } from "react-dom/client";
import "./gallery/shared/theme/theme.css";
import config from "virtual:vitrine-gallery-config";
import previews from "virtual:vitrine-previews";
import { App } from "./gallery/App";

// entry의 load()는 frame만 호출해 Gallery 문서에는 사용자 module과 CSS가 들어오지 않음
const root = document.getElementById("vitrine-root");
if (root) createRoot(root).render(<App entries={previews} config={config} />);
