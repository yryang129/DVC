import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { MascotIntroPreview } from "./components/MascotIntroPreview";
import { OwlColorwayGallery } from "./components/OwlColorwayGallery";
import { OwlRefinementGallery } from "./components/OwlRefinementGallery";

const preview = new URLSearchParams(window.location.search).get("preview");

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

const previewPage = preview === "mascot-intro"
  ? <MascotIntroPreview />
  : preview === "owl-colorways"
    ? <OwlColorwayGallery />
    : preview === "owl-refinements"
      ? <OwlRefinementGallery />
    : <App />;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {previewPage}
  </StrictMode>,
);
