import type { SiteContent } from "../data/siteContent";
import { defaultContent } from "../data/siteContent";
import { renderProjects, renderServices } from "../ui/render";

function text(el: Element | null, value: string): void {
  if (el) {
    el.textContent = value;
  }
}

function setMeta(attr: "name" | "property", key: string, value: string): void {
  if (!value) {
    return;
  }
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function absoluteUrl(path: string): string {
  const fallback = "https://eldev.website/og/og-cover.png?v=20260912desc2";
  if (!path) {
    return fallback;
  }
  if (path.startsWith("http")) {
    return path.includes("?") ? path : `${path}?v=20260912fs1`;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const withHost = `https://eldev.website${normalized}`;
  return withHost.includes("?") ? withHost : `${withHost}?v=20260912fs1`;
}

function applySeo(content: SiteContent): void {
  const seo = content.seo || defaultContent.seo;
  const title = seo.title || defaultContent.seo.title;
  const description = seo.description || defaultContent.seo.description;
  const ogImage = absoluteUrl(seo.ogImage || defaultContent.seo.ogImage);

  document.title = title;
  setMeta("name", "description", description);
  if (seo.keywords) {
    setMeta("name", "keywords", seo.keywords);
  }
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:image", ogImage);
  setMeta("property", "og:image:width", "1200");
  setMeta("property", "og:image:height", "630");
  setMeta("property", "og:image:alt", "ELDEV — full-stack разработка на Python и Go");
  setMeta("property", "og:url", "https://eldev.website/");
  setMeta("property", "og:site_name", "ELDEV");
  setMeta("property", "og:type", "website");
  setMeta("property", "og:locale", "ru_RU");
  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
  setMeta("name", "twitter:image", ogImage);

  if (seo.verificationGoogle) {
    setMeta("name", "google-site-verification", seo.verificationGoogle);
  }
  if (seo.verificationYandex) {
    setMeta("name", "yandex-verification", seo.verificationYandex);
  }

  const offers = (content.services || defaultContent.services).map((service) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: service.title,
      description: service.blurb,
    },
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": "https://eldev.website/#business",
        name: "ELDEV",
        url: "https://eldev.website/",
        image: ogImage,
        description,
        areaServed: "RU",
        availableLanguage: ["ru", "en"],
        sameAs: [content.contacts.telegramUrl],
        telephone: content.contacts.phoneDisplay,
        knowsAbout: [
          "разработка сайтов",
          "написание сайтов",
          "Telegram боты",
          "3D сайты",
          "WebGL",
          "Python",
          "Go",
        ],
        makesOffer: offers,
      },
      {
        "@type": "Person",
        "@id": "https://eldev.website/#person",
        name: content.about?.name || "ELDEV",
        jobTitle: content.about?.title || "Full-stack developer",
        url: "https://eldev.website/",
        image: absoluteUrl(content.about?.photo || content.photos.aboutPrimary),
        sameAs: [content.contacts.telegramUrl],
        knowsAbout: ["Python", "Go", "WebGL", "Telegram bots", "frontend"],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Делаете написание и разработку сайтов?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Да. Собираю лендинги, корпоративные и продуктовые сайты: структура, frontend и запуск.",
            },
          },
          {
            "@type": "Question",
            name: "Разрабатываете Telegram-ботов?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Да. Боты для заявок, каталогов, уведомлений и интеграций с API на Python и Go.",
            },
          },
          {
            "@type": "Question",
            name: "Делаете 3D / WebGL сайты?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Да. Интерактивные 3D-сцены и WebGL-акценты для hero и продукта без перегруза мобильных устройств.",
            },
          },
        ],
      },
    ],
  };

  const ld = document.getElementById("jsonLd");
  if (ld) {
    ld.textContent = JSON.stringify(jsonLd);
  }
}

function applyPhoto(selector: string, url: string, label: string): void {
  const slot = document.querySelector<HTMLElement>(selector);
  if (!slot) {
    return;
  }
  if (!url) {
    if (slot.querySelector("canvas")) {
      slot.classList.remove("has-photo");
      return;
    }
    slot.innerHTML = `<span>${slot.dataset.label || "Photo"}</span>`;
    slot.classList.remove("has-photo");
    return;
  }
  slot.innerHTML = `<img src="${url}" alt="${label}" loading="lazy" decoding="async" />`;
  slot.classList.add("has-photo");
}

export function applySiteContent(content: SiteContent): void {
  applySeo(content);

  const branding = content.branding || defaultContent.branding;
  const marquee = document.querySelector(".header-marquee-track");
  if (marquee) {
    const word = branding.marquee || "ELDEV";
    marquee.innerHTML = Array.from({ length: 8 }, () => `<span>${word}</span>`).join("");
  }
  const logo = document.querySelector<HTMLAnchorElement>(".logo");
  if (logo) {
    const mark = branding.logoUrl || "/logo.svg";
    logo.innerHTML = `<img class="logo-mark" src="${mark}" alt="ELDEV" width="148" height="32" />`;
    logo.setAttribute("aria-label", "ELDEV");
  }
  const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (favicon) {
    favicon.href = "/favicon.svg?v=full-admin-logo";
  }

  const sections = content.sections || defaultContent.sections;
  text(document.querySelector("#uslugi .eyebrow"), sections.servicesEyebrow);
  text(document.querySelector("#uslugi .section-title"), sections.servicesTitle);
  text(document.querySelector("#uslugi .section-lead"), sections.servicesLead);
  text(document.querySelector("#projects .eyebrow"), sections.projectsEyebrow);
  text(document.querySelector("#projects .section-title"), sections.projectsTitle);
  text(document.querySelector("#projects .section-lead"), sections.projectsLead);
  text(document.querySelector("#contact .eyebrow"), sections.contactEyebrow);
  text(document.querySelector("#about .eyebrow"), content.about.eyebrow || defaultContent.about.eyebrow);

  const offers = content.offersStrip || defaultContent.offersStrip;
  text(document.querySelector(".offers-kicker"), offers.kicker);
  text(document.querySelector(".offers-title"), offers.title);
  text(document.querySelector(".offers-lead"), offers.lead);

  text(document.querySelector(".stage-hero .eyebrow"), content.hero.eyebrow || defaultContent.hero.eyebrow);
  text(document.querySelector(".stage-hint"), content.hero.hint || defaultContent.hero.hint);

  const availability = document.querySelector("[data-hero-availability], .hero-availability span");
  if (availability) {
    availability.textContent = content.hero.availability;
  } else {
    const wrap = document.querySelector(".hero-availability");
    if (wrap) {
      wrap.innerHTML = `<i></i><span>${content.hero.availability}</span>`;
    }
  }

  const title = document.querySelector(".stage-hero h1");
  if (title) {
    title.innerHTML = `${content.hero.headlineBefore}
              <span class="gradient-text">${content.hero.headlineAccent}</span>
              ${content.hero.headlineAfter}`;
  }

  text(document.querySelector(".hero-lead"), content.hero.lead);

  const actions = document.querySelectorAll<HTMLAnchorElement>(".hero-actions a");
  if (actions[0]) {
    actions[0].textContent = content.hero.ctaPrimary;
    actions[0].href = content.contacts.telegramUrl;
  }
  if (actions[1]) {
    actions[1].textContent = content.hero.ctaSecondary;
    actions[1].href = "#projects";
  }

  const heroStats = document.getElementById("heroStats");
  if (heroStats) {
    heroStats.innerHTML = content.stats
      .map(
        (item) =>
          `<div class="hero-stat"><strong>${item.value}</strong><span>${item.label}</span></div>`,
      )
      .join("");
  }

  const experienceGrid = document.getElementById("experienceGrid");
  if (experienceGrid) {
    experienceGrid.innerHTML = content.experience
      .map(
        (item) =>
          `<article class="fact-item"><strong>${item.value}</strong><span>${item.text}</span></article>`,
      )
      .join("");
  }

  text(document.getElementById("aboutName"), content.about.name || "ELDEV");
  text(document.querySelector("#aboutTitle, #about .section-title"), content.about.title);
  const aboutCopy = document.querySelector(".about-copy");
  if (aboutCopy) {
    aboutCopy.innerHTML = content.about.paragraphs
      .filter(Boolean)
      .map((p) => `<p>${p}</p>`)
      .join("");
  }

  const aboutPhoto = content.about.photo || content.photos.aboutPrimary;
  const aboutImg = document.querySelector<HTMLImageElement>('#about img, [data-photo="about-primary"] img');
  if (aboutImg && aboutPhoto) {
    aboutImg.src = aboutPhoto;
    aboutImg.alt = content.about.name || "ELDEV";
  }
  applyPhoto('[data-photo="about-primary"]', aboutPhoto, content.about.name || "ELDEV");

  renderServices(
    content.services?.length ? content.services : defaultContent.services,
    content.installmentCallout || defaultContent.installmentCallout,
  );
  renderProjects(content.projects?.length ? content.projects : defaultContent.projects);

  const chips = document.getElementById("capabilityChips");
  if (chips) {
    const list = content.capabilities?.length ? content.capabilities : defaultContent.capabilities;
    chips.innerHTML = list
      .map((item) => `<span class="capability-chip" title="${item.text || ""}">${item.title}</span>`)
      .join("");
  }

  const processList = document.getElementById("processList");
  if (processList) {
    const steps = content.process?.length ? content.process : defaultContent.process;
    processList.innerHTML = steps
      .map(
        (step) => `
      <div class="process-step">
        <strong>${step.num || ""}</strong>
        <div>
          <p class="process-step-title">${step.title || ""}</p>
          <p class="process-step-text">${step.text || ""}</p>
        </div>
      </div>`,
      )
      .join("");
  }

  const stackRow = document.getElementById("stackRow");
  if (stackRow) {
    const stack = content.stack?.length ? content.stack : defaultContent.stack;
    stackRow.innerHTML = stack.map((item) => `<span class="stack-chip">${item}</span>`).join("");
  }

  text(document.querySelector("#contact h2"), content.contact.title);
  text(document.querySelector("#contact .panel-contact > p, #contact .panel > p"), content.contact.text);
  const contactCta = document.querySelector<HTMLAnchorElement>(
    "#contact .cta-actions .btn.btn-primary, #contact .cta-actions .btn-primary, #contact a.btn-primary",
  );
  if (contactCta) {
    contactCta.textContent = content.contact.ctaLabel;
    contactCta.href = content.contacts.telegramUrl;
  }

  document.querySelectorAll<HTMLAnchorElement>('a[href*="t.me/"]').forEach((link) => {
    link.href = content.contacts.telegramUrl;
  });
  document.querySelectorAll<HTMLAnchorElement>('a[href^="tel:"]').forEach((link) => {
    link.href = content.contacts.phoneHref;
  });

  document.querySelectorAll(".contact-link").forEach((link) => {
    const label = link.querySelector("small")?.textContent?.toLowerCase() || "";
    const strong = link.querySelector("strong");
    if (!strong) {
      return;
    }
    if (label.includes("telegram")) {
      strong.textContent = content.contacts.telegramHandle;
      (link as HTMLAnchorElement).href = content.contacts.telegramUrl;
    }
    if (label.includes("телефон")) {
      strong.textContent = content.contacts.phoneDisplay;
      (link as HTMLAnchorElement).href = content.contacts.phoneHref;
    }
  });

  const footerParts = document.querySelectorAll(".footer-row > div, .site-footer .shell > div");
  if (footerParts[0]) {
    footerParts[0].textContent = content.footer.left;
  }
  if (footerParts[2]) {
    footerParts[2].textContent = content.footer.availability;
  }

  applyPhoto('[data-photo="hero-portrait"]', content.photos.heroPortrait, "Hero portrait");
  applyPhoto('[data-photo="about-secondary"]', content.photos.aboutSecondary, "About photo 02");
}

export async function loadSiteContent(): Promise<SiteContent> {
  try {
    const response = await fetch("/api/content", { cache: "no-store" });
    if (!response.ok) {
      return defaultContent;
    }
    const data = (await response.json()) as Partial<SiteContent>;
    return {
      ...defaultContent,
      ...data,
      seo: { ...defaultContent.seo, ...(data.seo || {}) },
      branding: { ...defaultContent.branding, ...(data.branding || {}) },
      hero: { ...defaultContent.hero, ...(data.hero || {}) },
      about: {
        ...defaultContent.about,
        ...(data.about || {}),
        paragraphs:
          data.about?.paragraphs?.filter(Boolean)?.length
            ? data.about.paragraphs
            : defaultContent.about.paragraphs,
      },
      sections: { ...defaultContent.sections, ...(data.sections || {}) },
      offersStrip: { ...defaultContent.offersStrip, ...(data.offersStrip || {}) },
      contact: { ...defaultContent.contact, ...(data.contact || {}) },
      contacts: { ...defaultContent.contacts, ...(data.contacts || {}) },
      footer: { ...defaultContent.footer, ...(data.footer || {}) },
      installmentCallout: {
        ...defaultContent.installmentCallout,
        ...(data.installmentCallout || {}),
      },
      photos: {
        ...defaultContent.photos,
        ...(data.photos || {}),
        projects: { ...defaultContent.photos.projects, ...(data.photos?.projects || {}) },
      },
      stats: data.stats?.length ? data.stats : defaultContent.stats,
      experience: data.experience?.length ? data.experience : defaultContent.experience,
      services: data.services?.length ? data.services : defaultContent.services,
      projects: data.projects?.length ? data.projects : defaultContent.projects,
      capabilities: data.capabilities?.length ? data.capabilities : defaultContent.capabilities,
      process: data.process?.length ? data.process : defaultContent.process,
      stack: data.stack?.length ? data.stack : defaultContent.stack,
    };
  } catch {
    return defaultContent;
  }
}
