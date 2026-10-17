import { createRoot } from "react-dom/client";
import previews, { loadPreviewSetup } from "virtual:vitrine-previews";
import { FrameApp } from "./frame/FrameApp";

const previewId = new URLSearchParams(window.location.search).get("id");
const entry = previews.find((candidate) => candidate.id === previewId);

const root = document.getElementById("vitrine-frame-root");
if (root) createRoot(root).render(<FrameApp entry={entry} previewId={previewId} loadPreviewSetup={loadPreviewSetup} />);
