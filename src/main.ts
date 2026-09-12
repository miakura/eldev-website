import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/experience.css";

import { renderDynamicContent } from "./ui/render";
import { initNavigation, initReveal } from "./ui/interactions";
import { initLeadForm } from "./ui/leadForm";
import { applySiteContent, loadSiteContent } from "./content/applyContent";

async function boot(): Promise<void> {
  document.documentElement.classList.add("js");
  const content = await loadSiteContent();
  renderDynamicContent();
  applySiteContent(content);
  initNavigation();
  initLeadForm();

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    document.body.classList.add("reduced-3d");
    initReveal();
  } else {
    try {
      const { initMotion } = await import("./animations/motion");
      initMotion();
    } catch {
      initReveal();
    }
  }

  void import("./three/mount").then((mod) => mod.mountScenes());
}

void boot();
