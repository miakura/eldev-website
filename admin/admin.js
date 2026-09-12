let content = null;

const loginView = document.getElementById("loginView");
const appView = document.getElementById("appView");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const saveStatus = document.getElementById("saveStatus");

const ACCENTS = ["#3dffd0", "#ffc857", "#ff7a59", "#7af0d4", "#c4a0ff", "#5b8cff"];

async function api(url, options = {}) {
  const { headers: optionHeaders, ...rest } = options;
  const response = await fetch(url, {
    credentials: "include",
    ...rest,
    headers: {
      ...(rest.body && !(rest.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(optionHeaders || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Ошибка запроса");
  }
  return data;
}

function escapeAttr(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function setVal(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.value = value ?? "";
  }
}

function getVal(id) {
  return document.getElementById(id)?.value.trim() || "";
}

function setPreview(img, url) {
  if (!img) {
    return;
  }
  if (url) {
    img.src = url;
    img.classList.add("is-on");
  } else {
    img.removeAttribute("src");
    img.classList.remove("is-on");
  }
}

function fillPairFields(containerId, items, keys) {
  const root = document.getElementById(containerId);
  if (!root) {
    return;
  }
  root.innerHTML = (items || [])
    .map(
      (item, index) => `
    <div class="row">
      <label>${keys[0]}
        <input data-group="${containerId}" data-index="${index}" data-key="${keys[0]}" value="${escapeAttr(item[keys[0]] || "")}" />
      </label>
      <label>${keys[1]}
        <input data-group="${containerId}" data-index="${index}" data-key="${keys[1]}" value="${escapeAttr(item[keys[1]] || "")}" />
      </label>
    </div>`,
    )
    .join("");
}

function readPairFields(containerId, keys) {
  const root = document.getElementById(containerId);
  if (!root) {
    return [];
  }
  const count = root.querySelectorAll(".row").length;
  const items = [];
  for (let i = 0; i < count; i += 1) {
    const a = root.querySelector(`input[data-index="${i}"][data-key="${keys[0]}"]`);
    const b = root.querySelector(`input[data-index="${i}"][data-key="${keys[1]}"]`);
    items.push({ [keys[0]]: a?.value || "", [keys[1]]: b?.value || "" });
  }
  return items;
}

function renderServices(services) {
  const root = document.getElementById("servicesFields");
  if (!root) {
    return;
  }
  root.innerHTML = (services || [])
    .map(
      (item) => `
    <div class="card">
      <div class="row">
        <label>ID<input data-service="id" value="${escapeAttr(item.id || "")}" /></label>
        <label>Title<input data-service="title" value="${escapeAttr(item.title || "")}" /></label>
      </div>
      <label>Описание<textarea data-service="blurb" rows="3">${escapeHtml(item.blurb || "")}</textarea></label>
      <div class="row">
        <label>Цена<input data-service="price" value="${escapeAttr(item.price || "")}" placeholder="от 50 000 ₽" /></label>
        <label>Пояснение к цене<input data-service="priceNote" value="${escapeAttr(item.priceNote || "")}" placeholder="от 3 месяцев" /></label>
      </div>
      <label>Keywords<input data-service="keywords" value="${escapeAttr(item.keywords || "")}" /></label>
      <label>Kind
        <select data-service="kind">
          <option value="core" ${item.kind !== "offer" ? "selected" : ""}>core</option>
          <option value="offer" ${item.kind === "offer" ? "selected" : ""}>offer</option>
        </select>
      </label>
    </div>`,
    )
    .join("");
}

function readServices() {
  return Array.from(document.querySelectorAll("#servicesFields .card")).map((card) => ({
    id: card.querySelector('[data-service="id"]')?.value.trim() || "",
    title: card.querySelector('[data-service="title"]')?.value.trim() || "",
    blurb: card.querySelector('[data-service="blurb"]')?.value.trim() || "",
    keywords: card.querySelector('[data-service="keywords"]')?.value.trim() || "",
    kind: card.querySelector('[data-service="kind"]')?.value.trim() || "core",
    price: card.querySelector('[data-service="price"]')?.value.trim() || "",
    priceNote: card.querySelector('[data-service="priceNote"]')?.value.trim() || "",
  }));
}

function slugify(value) {
  return (
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || `case-${Date.now()}`
  );
}

function renderProjects(projects) {
  const root = document.getElementById("projectsFields");
  if (!root) {
    return;
  }
  root.innerHTML = (projects || [])
    .map((project, index) => {
      const images = Array.isArray(project.images) ? project.images : [];
      const slug = project.slug || project.id || `p${index}`;
      const imageSlots = [0, 1, 2]
        .map((imageIndex) => {
          const url = images[imageIndex] || "";
          return `
          <div class="photo-card compact">
            <img alt="" ${url ? `src="${escapeAttr(url)}" class="is-on"` : ""} data-project-image="${index}:${imageIndex}" />
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" data-slot="projectImage:${escapeAttr(slug)}:${imageIndex}" />
          </div>`;
        })
        .join("");
      return `
      <div class="card project-card" data-project-index="${index}">
        <div class="row">
          <label>Title<input data-project="title" value="${escapeAttr(project.title || "")}" /></label>
          <label>Slug<input data-project="slug" value="${escapeAttr(slug)}" /></label>
        </div>
        <div class="row">
          <label>Category<input data-project="category" value="${escapeAttr(project.category || "")}" /></label>
          <label>Accent<input data-project="accent" value="${escapeAttr(project.accent || ACCENTS[index % ACCENTS.length])}" /></label>
        </div>
        <label>Short description<textarea data-project="shortDescription" rows="2">${escapeHtml(project.shortDescription || "")}</textarea></label>
        <label>Реализовано<textarea data-project="implemented" rows="2">${escapeHtml(project.implemented || "")}</textarea></label>
        <label>Как<textarea data-project="how" rows="2">${escapeHtml(project.how || "")}</textarea></label>
        <div class="row">
          <label>URL (только хранение)<input data-project="url" value="${escapeAttr(project.url || "")}" /></label>
          <label class="check">Featured
            <input type="checkbox" data-project="featured" ${project.featured ? "checked" : ""} />
          </label>
        </div>
        <div class="photos">${imageSlots}</div>
        <div class="row actions">
          <button type="button" class="ghost" data-move="-1" data-index="${index}">↑</button>
          <button type="button" class="ghost" data-move="1" data-index="${index}">↓</button>
          <button type="button" class="danger" data-delete-project="${index}">Удалить</button>
        </div>
      </div>`;
    })
    .join("");

  root.querySelectorAll("input[type=file][data-slot]").forEach((input) => {
    input.addEventListener("change", onPhotoSelected);
  });
  root.querySelectorAll("[data-delete-project]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.getAttribute("data-delete-project"));
      const list = readProjects();
      list.splice(index, 1);
      content.projects = list;
      renderProjects(list);
    });
  });
  root.querySelectorAll("[data-move]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.getAttribute("data-index"));
      const delta = Number(btn.getAttribute("data-move"));
      const list = readProjects();
      const target = index + delta;
      if (target < 0 || target >= list.length) {
        return;
      }
      const tmp = list[index];
      list[index] = list[target];
      list[target] = tmp;
      content.projects = list;
      renderProjects(list);
    });
  });
}

function readProjects() {
  return Array.from(document.querySelectorAll("#projectsFields .project-card")).map((card, index) => {
    const slug =
      card.querySelector('[data-project="slug"]')?.value.trim() ||
      slugify(card.querySelector('[data-project="title"]')?.value || `case-${index}`);
    const images = [0, 1, 2]
      .map(
        (imageIndex) =>
          card.querySelector(`img[data-project-image="${index}:${imageIndex}"]`)?.getAttribute("src") || "",
      )
      .filter(Boolean);
    return {
      id: slug,
      slug,
      title: card.querySelector('[data-project="title"]')?.value.trim() || "",
      category: card.querySelector('[data-project="category"]')?.value.trim() || "",
      shortDescription: card.querySelector('[data-project="shortDescription"]')?.value.trim() || "",
      implemented: card.querySelector('[data-project="implemented"]')?.value.trim() || "",
      how: card.querySelector('[data-project="how"]')?.value.trim() || "",
      images,
      url: card.querySelector('[data-project="url"]')?.value.trim() || "",
      featured: Boolean(card.querySelector('[data-project="featured"]')?.checked),
      accent: card.querySelector('[data-project="accent"]')?.value.trim() || ACCENTS[index % ACCENTS.length],
    };
  });
}

function hydrate(data) {
  content = data;
  setVal("seoTitle", data.seo?.title || "");
  setVal("seoDescription", data.seo?.description || "");
  setVal("seoKeywords", data.seo?.keywords || "");
  setVal("seoOgImage", data.seo?.ogImage || "");
  setVal("seoGoogle", data.seo?.verificationGoogle || "");
  setVal("seoYandex", data.seo?.verificationYandex || "");
  setVal("brandMarquee", data.branding?.marquee || "");
  setVal("brandLogoUrl", data.branding?.logoUrl || "");
  setVal("brandLogoText", data.branding?.logoText || "");
  setVal("brandLogoAccent", data.branding?.logoAccent || "");
  setVal("heroEyebrow", data.hero?.eyebrow || "");
  setVal("heroAvailability", data.hero?.availability || "");
  setVal("heroBefore", data.hero?.headlineBefore || "");
  setVal("heroAccent", data.hero?.headlineAccent || "");
  setVal("heroAfter", data.hero?.headlineAfter || "");
  setVal("heroLead", data.hero?.lead || "");
  setVal("heroCtaPrimary", data.hero?.ctaPrimary || "");
  setVal("heroCtaSecondary", data.hero?.ctaSecondary || "");
  setVal("heroHint", data.hero?.hint || "");
  setVal("secServicesEyebrow", data.sections?.servicesEyebrow || "");
  setVal("secServicesTitle", data.sections?.servicesTitle || "");
  setVal("secServicesLead", data.sections?.servicesLead || "");
  setVal("secProjectsEyebrow", data.sections?.projectsEyebrow || "");
  setVal("secProjectsTitle", data.sections?.projectsTitle || "");
  setVal("secProjectsLead", data.sections?.projectsLead || "");
  setVal("secContactEyebrow", data.sections?.contactEyebrow || "");
  fillPairFields("statsFields", data.stats || [], ["value", "label"]);
  fillPairFields("experienceFields", data.experience || [], ["value", "text"]);
  renderServices(data.services || []);
  setVal("offersKicker", data.offersStrip?.kicker || "");
  setVal("offersTitle", data.offersStrip?.title || "");
  setVal("offersLead", data.offersStrip?.lead || "");
  setVal("installmentKicker", data.installmentCallout?.kicker || "");
  setVal("installmentTitle", data.installmentCallout?.title || "");
  setVal("installmentText", data.installmentCallout?.text || "");
  renderCapabilities(data.capabilities || []);
  renderProcess(data.process || []);
  setVal("stackInput", (data.stack || []).join(", "));
  setVal("aboutEyebrow", data.about?.eyebrow || "");
  setVal("aboutName", data.about?.name || "");
  setVal("aboutTitle", data.about?.title || "");
  setVal("aboutP1", data.about?.paragraphs?.[0] || "");
  setVal("aboutP2", data.about?.paragraphs?.[1] || "");
  setVal("aboutP3", data.about?.paragraphs?.[2] || "");
  setPreview(
    document.getElementById("previewAboutPhoto"),
    data.about?.photo || data.photos?.aboutPrimary || "",
  );
  renderProjects(data.projects || []);
  setVal("telegramUrl", data.contacts?.telegramUrl || "");
  setVal("telegramHandle", data.contacts?.telegramHandle || "");
  setVal("phoneDisplay", data.contacts?.phoneDisplay || "");
  setVal("phoneHref", data.contacts?.phoneHref || "");
  setVal("contactTitle", data.contact?.title || "");
  setVal("contactText", data.contact?.text || "");
  setVal("contactCta", data.contact?.ctaLabel || "");
  setVal("footerLeft", data.footer?.left || "");
  setVal("footerAvailability", data.footer?.availability || "");
}

function renderCapabilities(items) {
  const root = document.getElementById("capabilitiesFields");
  if (!root) {
    return;
  }
  root.innerHTML = (items || [])
    .map(
      (item, index) => `
    <div class="card" data-capability="${index}">
      <div class="row">
        <label>Title<input data-cap="title" value="${escapeAttr(item.title || "")}" /></label>
        <button type="button" class="ghost" data-remove-cap="${index}">Удалить</button>
      </div>
      <label>Text<textarea data-cap="text" rows="2">${escapeHtml(item.text || "")}</textarea></label>
    </div>`,
    )
    .join("");
  root.querySelectorAll("[data-remove-cap]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const list = readCapabilities();
      list.splice(Number(btn.getAttribute("data-remove-cap")), 1);
      renderCapabilities(list);
    });
  });
}

function readCapabilities() {
  return Array.from(document.querySelectorAll("#capabilitiesFields .card")).map((card) => ({
    title: card.querySelector('[data-cap="title"]')?.value.trim() || "",
    text: card.querySelector('[data-cap="text"]')?.value.trim() || "",
  }));
}

function renderProcess(items) {
  const root = document.getElementById("processFields");
  if (!root) {
    return;
  }
  root.innerHTML = (items || [])
    .map(
      (item, index) => `
    <div class="card" data-process="${index}">
      <div class="row">
        <label>№<input data-proc="num" value="${escapeAttr(item.num || "")}" /></label>
        <label>Title<input data-proc="title" value="${escapeAttr(item.title || "")}" /></label>
        <button type="button" class="ghost" data-remove-proc="${index}">Удалить</button>
      </div>
      <label>Text<textarea data-proc="text" rows="2">${escapeHtml(item.text || "")}</textarea></label>
    </div>`,
    )
    .join("");
  root.querySelectorAll("[data-remove-proc]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const list = readProcess();
      list.splice(Number(btn.getAttribute("data-remove-proc")), 1);
      renderProcess(list);
    });
  });
}

function readProcess() {
  return Array.from(document.querySelectorAll("#processFields .card")).map((card) => ({
    num: card.querySelector('[data-proc="num"]')?.value.trim() || "",
    title: card.querySelector('[data-proc="title"]')?.value.trim() || "",
    text: card.querySelector('[data-proc="text"]')?.value.trim() || "",
  }));
}

async function onPhotoSelected(event) {
  const input = event.currentTarget;
  const file = input.files?.[0];
  if (!file) {
    return;
  }
  const slot = input.dataset.slot;
  const body = new FormData();
  body.append("file", file);
  saveStatus.textContent = "Загрузка фото…";
  try {
    const result = await api(`/api/admin/photos/${encodeURIComponent(slot)}`, {
      method: "POST",
      body,
    });
    hydrate(result.content);
    saveStatus.textContent = "Фото обновлено";
  } catch (error) {
    saveStatus.textContent = error.message;
  } finally {
    input.value = "";
  }
}

function collect() {
  const aboutPhoto =
    document.getElementById("previewAboutPhoto")?.getAttribute("src") ||
    content?.about?.photo ||
    content?.photos?.aboutPrimary ||
    "";
  const projects = readProjects();
  const photos = {
    ...(content?.photos || {}),
    aboutPrimary: aboutPhoto,
    projects: {
      ...(content?.photos?.projects || {}),
    },
  };
  projects.forEach((project) => {
    if (project.images?.[0]) {
      photos.projects[project.slug] = project.images[0];
    }
  });
  return {
    ...content,
    seo: {
      title: getVal("seoTitle"),
      description: getVal("seoDescription"),
      keywords: getVal("seoKeywords"),
      ogImage: getVal("seoOgImage"),
      verificationGoogle: getVal("seoGoogle"),
      verificationYandex: getVal("seoYandex"),
    },
    branding: {
      marquee: getVal("brandMarquee"),
      logoUrl: getVal("brandLogoUrl"),
      logoText: getVal("brandLogoText"),
      logoAccent: getVal("brandLogoAccent"),
    },
    hero: {
      eyebrow: getVal("heroEyebrow"),
      availability: getVal("heroAvailability"),
      headlineBefore: getVal("heroBefore"),
      headlineAccent: getVal("heroAccent"),
      headlineAfter: getVal("heroAfter"),
      lead: getVal("heroLead"),
      ctaPrimary: getVal("heroCtaPrimary"),
      ctaSecondary: getVal("heroCtaSecondary"),
      hint: getVal("heroHint"),
    },
    sections: {
      servicesEyebrow: getVal("secServicesEyebrow"),
      servicesTitle: getVal("secServicesTitle"),
      servicesLead: getVal("secServicesLead"),
      projectsEyebrow: getVal("secProjectsEyebrow"),
      projectsTitle: getVal("secProjectsTitle"),
      projectsLead: getVal("secProjectsLead"),
      contactEyebrow: getVal("secContactEyebrow"),
    },
    stats: readPairFields("statsFields", ["value", "label"]),
    experience: readPairFields("experienceFields", ["value", "text"]),
    services: readServices(),
    offersStrip: {
      kicker: getVal("offersKicker"),
      title: getVal("offersTitle"),
      lead: getVal("offersLead"),
    },
    installmentCallout: {
      kicker: getVal("installmentKicker"),
      title: getVal("installmentTitle"),
      text: getVal("installmentText"),
    },
    capabilities: readCapabilities(),
    process: readProcess(),
    stack: getVal("stackInput")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    about: {
      eyebrow: getVal("aboutEyebrow"),
      name: getVal("aboutName"),
      title: getVal("aboutTitle"),
      paragraphs: [getVal("aboutP1"), getVal("aboutP2"), getVal("aboutP3")].filter(Boolean),
      photo: aboutPhoto,
    },
    projects,
    contacts: {
      telegramUrl: getVal("telegramUrl"),
      telegramHandle: getVal("telegramHandle"),
      phoneDisplay: getVal("phoneDisplay"),
      phoneHref: getVal("phoneHref"),
    },
    contact: {
      title: getVal("contactTitle"),
      text: getVal("contactText"),
      ctaLabel: getVal("contactCta"),
    },
    footer: {
      left: getVal("footerLeft"),
      availability: getVal("footerAvailability"),
    },
    photos,
  };
}

function showApp() {
  loginView.hidden = true;
  appView.hidden = false;
}

function showLogin() {
  appView.hidden = true;
  loginView.hidden = false;
}


loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.hidden = true;
  const submitBtn = loginForm.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
  }
  try {
    await api("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({
        username: document.getElementById("usernameInput").value,
        password: document.getElementById("passwordInput").value,
      }),
    });
    const me = await api("/api/admin/me");
    if (!(me.authenticated || me.ok)) {
      throw new Error("Сессия не установилась. Обновите страницу и попробуйте снова.");
    }
    hydrate(await api("/api/content"));
    showApp();
  } catch (error) {
    loginError.textContent = error.message || "Не удалось войти";
    loginError.hidden = false;
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
    }
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await api("/api/admin/logout", { method: "POST" });
  showLogin();
});

document.getElementById("saveBtn").addEventListener("click", async () => {
  saveStatus.textContent = "Сохранение…";
  try {
    const next = await api("/api/admin/content", {
      method: "PUT",
      body: JSON.stringify(collect()),
    });
    hydrate(next);
    saveStatus.textContent = "Сохранено";
    showToast("Изменения сохранены", "ok");
  } catch (error) {
    saveStatus.textContent = error.message;
    showToast(error.message || "Ошибка сохранения", "error");
  }
});

document.getElementById("addProjectBtn").addEventListener("click", () => {
  const list = readProjects();
  const slug = `case-${Date.now()}`;
  list.push({
    id: slug,
    slug,
    title: "Новый кейс",
    category: "",
    shortDescription: "",
    implemented: "",
    how: "",
    images: [],
    url: "",
    featured: true,
    accent: ACCENTS[list.length % ACCENTS.length],
  });
  content.projects = list;
  renderProjects(list);
});

document.querySelectorAll("input[type=file][data-slot]").forEach((input) => {
  input.addEventListener("change", onPhotoSelected);
});

api("/api/admin/me")
  .then(async (me) => {
    if (me.authenticated || me.ok) {
      hydrate(await api("/api/content"));
      showApp();
    }
  })
  .catch(() => {
    showLogin();
  });

document.getElementById("addCapabilityBtn")?.addEventListener("click", () => {
  const list = readCapabilities();
  list.push({ title: "New", text: "" });
  renderCapabilities(list);
});
document.getElementById("addProcessBtn")?.addEventListener("click", () => {
  const list = readProcess();
  list.push({ num: String(list.length + 1).padStart(2, "0"), title: "Шаг", text: "" });
  renderProcess(list);
});


function showToast(message, type = "ok") {
  const toast = document.getElementById("toast");
  if (!toast) {
    return;
  }
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.remove("is-ok", "is-error");
  toast.classList.add(type === "error" ? "is-error" : "is-ok");
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => {
    toast.hidden = true;
  }, 2600);
}


const STATUS_LABELS = { new: "Новая", read: "Прочитана", done: "Готово" };

async function loadLeads() {
  const list = document.getElementById("leadsList");
  const empty = document.getElementById("leadsEmpty");
  const count = document.getElementById("leadsCount");
  if (!list) {
    return;
  }
  list.innerHTML = "<p class=\"hint\">Загрузка…</p>";
  try {
    const data = await api("/api/admin/leads");
    const leads = data.leads || [];
    if (count) {
      count.textContent = leads.length ? `Всего: ${leads.length}` : "";
    }
    if (!leads.length) {
      list.innerHTML = "";
      if (empty) {
        empty.hidden = false;
      }
      return;
    }
    if (empty) {
      empty.hidden = true;
    }
    list.innerHTML = leads
      .map((lead) => {
        const created = lead.createdAt ? new Date(lead.createdAt).toLocaleString("ru-RU") : "";
        const status = lead.status || "new";
        const phoneLabel = lead.phoneDisplay || lead.phone || "";
        const task = lead.task || lead.description || "";
        return `
        <article class="lead-card" data-id="${escapeAttr(lead.id)}">
          <div class="lead-card-top">
            <strong>${escapeHtml(lead.name || "")}</strong>
            <span class="lead-status-pill is-${escapeAttr(status)}">${STATUS_LABELS[status] || status}</span>
          </div>
          <p><a href="tel:${escapeAttr(lead.phone || "")}">${escapeHtml(phoneLabel)}</a></p>
          <p>${escapeHtml(lead.social || "")}</p>
          ${task ? `<p class="lead-task">${escapeHtml(task)}</p>` : ""}
          <p class="hint">${escapeHtml(created)}</p>
          <div class="lead-card-actions">
            <button type="button" data-lead-status="read">Прочитана</button>
            <button type="button" data-lead-status="done">Готово</button>
            <button type="button" class="danger" data-lead-delete>Удалить</button>
          </div>
        </article>`;
      })
      .join("");
  } catch (error) {
    list.innerHTML = `<p class="error">${escapeHtml(error.message || "Ошибка загрузки")}</p>`;
  }
}

document.getElementById("leadsRefreshBtn")?.addEventListener("click", () => {
  void loadLeads();
});

document.getElementById("leadsList")?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  const card = target.closest(".lead-card");
  if (!card) {
    return;
  }
  const id = card.getAttribute("data-id");
  if (!id) {
    return;
  }
  try {
    if (target.hasAttribute("data-lead-delete")) {
      await api(`/api/admin/leads/${encodeURIComponent(id)}`, { method: "DELETE" });
      showToast("Заявка удалена", "ok");
      await loadLeads();
      return;
    }
    const status = target.getAttribute("data-lead-status");
    if (status) {
      await api(`/api/admin/leads/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      showToast("Статус обновлён", "ok");
      await loadLeads();
    }
  } catch (error) {
    showToast(error.message || "Ошибка", "error");
  }
});

function setAdminSection(section) {
  const target = section || "branding";
  document.querySelectorAll("[data-panel]").forEach((panel) => {
    const active = panel.getAttribute("data-panel") === target;
    panel.hidden = !active;
    panel.classList.toggle("is-active", active);
  });
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.classList.toggle("is-active", btn.getAttribute("data-section") === target);
  });
  const select = document.getElementById("sectionSelect");
  if (select && select.value !== target) {
    select.value = target;
  }
  closeAdminNav();
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (target === "leads") {
    void loadLeads();
  }
}

function openAdminNav() {
  document.body.classList.add("nav-open");
  const toggle = document.getElementById("navToggle");
  const backdrop = document.getElementById("navBackdrop");
  if (toggle) {
    toggle.setAttribute("aria-expanded", "true");
  }
  if (backdrop) {
    backdrop.hidden = false;
  }
}

function closeAdminNav() {
  document.body.classList.remove("nav-open");
  const toggle = document.getElementById("navToggle");
  const backdrop = document.getElementById("navBackdrop");
  if (toggle) {
    toggle.setAttribute("aria-expanded", "false");
  }
  if (backdrop) {
    backdrop.hidden = true;
  }
}

document.getElementById("navToggle")?.addEventListener("click", () => {
  if (document.body.classList.contains("nav-open")) {
    closeAdminNav();
  } else {
    openAdminNav();
  }
});
document.getElementById("navBackdrop")?.addEventListener("click", closeAdminNav);
document.getElementById("sectionSelect")?.addEventListener("change", (event) => {
  setAdminSection(event.target.value);
});
document.querySelectorAll(".nav-item[data-section]").forEach((btn) => {
  btn.addEventListener("click", () => setAdminSection(btn.getAttribute("data-section")));
});

setAdminSection("branding");
