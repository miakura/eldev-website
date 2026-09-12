import { capabilities } from "../data/content";
import { defaultProjects, type ProjectCase } from "../data/projects";
import type { ServiceItem } from "../data/siteContent";
import { defaultContent } from "../data/siteContent";
import { heroStats } from "../data/stats";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderCase(project: ProjectCase, index: number): string {
  const images = (project.images || []).filter(Boolean).slice(0, 3);
  const gallery =
    images.length > 0
      ? images
          .map(
            (src, i) =>
              `<img src="${escapeHtml(src)}" alt="${escapeHtml(project.title)}${i ? ` — ${i + 1}` : ""}" loading="lazy" decoding="async" />`,
          )
          .join("")
      : `<img src="" alt="" loading="lazy" decoding="async" />`;

  return `
  <article class="case-card reveal" style="--case-accent:${escapeHtml(project.accent || "#3dffd0")}" data-index="${index}" data-project-slug="${escapeHtml(project.slug)}">
    <div class="case-media${images.length > 1 ? " case-media-multi" : ""}">${gallery}</div>
    <div class="case-body">
      <span class="case-category">${escapeHtml(project.category)}</span>
      <h3>${escapeHtml(project.title)}</h3>
      <p>${escapeHtml(project.shortDescription)}</p>
      ${
        project.implemented
          ? `<p class="case-meta"><strong>Реализовано:</strong> ${escapeHtml(project.implemented)}</p>`
          : ""
      }
      ${project.how ? `<p class="case-meta"><strong>Как:</strong> ${escapeHtml(project.how)}</p>` : ""}
    </div>
  </article>`;
}

function priceBlock(item: ServiceItem): string {
  if (!item.price) {
    return "";
  }
  return `
    <div class="price-block">
      <span class="price-chip">${escapeHtml(item.price)}</span>
      ${item.priceNote ? `<span class="price-note">${escapeHtml(item.priceNote)}</span>` : ""}
    </div>`;
}

function installmentBanner(
  callout = defaultContent.installmentCallout,
): string {
  return `
    <aside class="installment-callout" aria-label="Рассрочка">
      <div class="installment-callout-glow" aria-hidden="true"></div>
      <p class="installment-callout-kicker">${escapeHtml(callout.kicker)}</p>
      <p class="installment-callout-title">${escapeHtml(callout.title)}</p>
      <p class="installment-callout-text">${escapeHtml(callout.text)}</p>
    </aside>`;
}

export function renderServices(
  services: ServiceItem[],
  callout = defaultContent.installmentCallout,
): void {
  const root = document.getElementById("servicesList");
  const offersRoot = document.getElementById("offersList");
  const core = services.filter((item) => (item.kind || "core") !== "offer");
  const offers = services.filter((item) => item.kind === "offer");

  if (root) {
    root.innerHTML =
      core
        .map(
          (item) => `
    <article class="service-card${item.price ? " has-price" : ""}" id="uslugi-${escapeHtml(item.id)}">
      <div class="service-card-top">
        <h3>${escapeHtml(item.title)}</h3>
        ${priceBlock(item)}
      </div>
      <p>${escapeHtml(item.blurb)}</p>
    </article>`,
        )
        .join("") + installmentBanner(callout);
  }

  if (offersRoot) {
    offersRoot.innerHTML = offers
      .map(
        (item) => `
    <article class="offer-card${item.id === "maintenance" ? " offer-card-plan" : ""}${item.price ? " has-price" : ""}" id="uslugi-${escapeHtml(item.id)}">
      <span class="offer-mark" aria-hidden="true"></span>
      <h3>${escapeHtml(item.title)}</h3>
      ${priceBlock(item)}
      <p>${escapeHtml(item.blurb)}</p>
    </article>`,
      )
      .join("");
  }
}

export function renderProjects(projects: ProjectCase[]): void {
  const projectsList = document.getElementById("projectsList");
  if (!projectsList) {
    return;
  }
  const list = projects.length ? projects : defaultProjects;
  projectsList.innerHTML = list.map((project, index) => renderCase(project, index)).join("");
}

export function renderDynamicContent(): void {
  const heroStatsEl = document.getElementById("heroStats");
  if (heroStatsEl) {
    heroStatsEl.innerHTML = heroStats
      .map(
        (item) => `
      <div class="hero-stat">
        <strong>${escapeHtml(item.value)}</strong>
        <span>${escapeHtml(item.label)}</span>
      </div>`,
      )
      .join("");
  }

  const experienceGrid = document.getElementById("experienceGrid");
  if (experienceGrid) {
    experienceGrid.innerHTML = defaultContent.experience
      .map(
        (item) => `
      <article class="fact-item">
        <strong>${escapeHtml(item.value)}</strong>
        <span>${escapeHtml(item.text)}</span>
      </article>`,
      )
      .join("");
  }

  renderServices(defaultContent.services);
  renderProjects(defaultContent.projects);

  const chips = document.getElementById("capabilityChips");
  if (chips) {
    chips.innerHTML = capabilities
      .slice(0, 6)
      .map((item) => `<span class="chip">${escapeHtml(item.title)}</span>`)
      .join("");
  }
}
