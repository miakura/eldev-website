import express from "express";
import multer from "multer";
import cookieParser from "cookie-parser";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = process.env.DATA_DIR || path.join(root, "data");
const uploadsDir = path.join(dataDir, "uploads");
const contentPath = path.join(dataDir, "content.json");
const bundledDefaultPath = [
  path.join(root, "content.default.json"),
  path.join(root, "data", "content.default.json"),
].find((candidate) => fs.existsSync(candidate));
const defaultPath = bundledDefaultPath || path.join(root, "data", "content.default.json");

const PORT = Number(process.env.PORT || 3000);
const ADMIN_USER = (process.env.ADMIN_USER || "admin").trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
const COOKIE_NAME = "eldev_admin";
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const leadAttempts = new Map();
const leadsPath = path.join(dataDir, "leads.json");

fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

if (fs.existsSync(defaultPath)) {
  fs.copyFileSync(defaultPath, path.join(dataDir, "content.default.json"));
}


function readDefaultContent() {
  return JSON.parse(fs.readFileSync(defaultPath, "utf8"));
}

function readContent() {
  if (!fs.existsSync(contentPath)) {
    const defaults = readDefaultContent();
    fs.writeFileSync(contentPath, JSON.stringify(defaults, null, 2));
    return defaults;
  }
  const defaults = readDefaultContent();
  const content = JSON.parse(fs.readFileSync(contentPath, "utf8"));
  const next = {
    ...defaults,
    ...content,
    seo: { ...(defaults.seo || {}), ...(content.seo || {}) },
    hero: { ...(defaults.hero || {}), ...(content.hero || {}) },
    about: {
      ...(defaults.about || {}),
      ...(content.about || {}),
      paragraphs:
        Array.isArray(content.about?.paragraphs) && content.about.paragraphs.filter(Boolean).length
          ? content.about.paragraphs
          : defaults.about?.paragraphs || [],
    },
    contact: { ...(defaults.contact || {}), ...(content.contact || {}) },
    contacts: { ...(defaults.contacts || {}), ...(content.contacts || {}) },
    footer: { ...(defaults.footer || {}), ...(content.footer || {}) },
    stats: Array.isArray(content.stats) && content.stats.length ? content.stats : defaults.stats,
    experience:
      Array.isArray(content.experience) && content.experience.length
        ? content.experience
        : defaults.experience,
    services:
      Array.isArray(content.services) && content.services.length ? content.services : defaults.services,
    projects:
      Array.isArray(content.projects) && content.projects.length ? content.projects : defaults.projects,
    photos: {
      ...(defaults.photos || {}),
      ...(content.photos || {}),
      projects: {
        ...(defaults.photos?.projects || {}),
        ...((content.photos && content.photos.projects) || {}),
      },
    },
  };
  if (next.about?.photo) {
    next.photos.aboutPrimary = next.about.photo;
  } else if (next.photos?.aboutPrimary) {
    next.about = next.about || {};
    next.about.photo = next.photos.aboutPrimary;
  }
  return next;
}

function writeContent(content) {
  fs.writeFileSync(contentPath, JSON.stringify(content, null, 2));
}

function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== "string") {
    return null;
  }
  const [body, sig] = token.split(".");
  if (!body || !sig) {
    return null;
  }
  const expected = crypto.createHmac("sha256", SESSION_SECRET).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

const loginAttempts = new Map();

function rateLimitLogin(ip) {
  const now = Date.now();
  const entry = loginAttempts.get(ip) || { count: 0, start: now };
  if (now - entry.start > 15 * 60 * 1000) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  loginAttempts.set(ip, entry);
  return entry.count <= 20;
}

function requireAdmin(req, res, next) {
  const payload = verifyToken(req.cookies?.[COOKIE_NAME]);
  if (!payload?.admin) {
    res.status(401).json({ error: "Требуется авторизация" });
    return;
  }
  next();
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const slot = String(req.params.slot || "file").replace(/[^a-zA-Z0-9_:-]/g, "").replace(/:/g, "-");
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext) ? ext : ".jpg";
    cb(null, `${slot}-${Date.now()}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(new Error("Допустимы только JPG, PNG, WEBP, GIF"));
      return;
    }
    cb(null, true);
  },
});

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "unknown";
}

function cookieOptions(req) {
  const proto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  const secure = proto === "https" || req.secure || process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
  };
}

app.get("/api/content", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.json(readContent());
});

app.get("/api/admin/me", (req, res) => {
  const payload = verifyToken(req.cookies?.[COOKIE_NAME]);
  res.json({ authenticated: Boolean(payload?.admin) });
});

app.post("/api/admin/login", (req, res) => {
  const ip = clientIp(req);
  if (!rateLimitLogin(ip)) {
    res.status(429).json({ error: "Слишком много попыток. Подождите 15 минут." });
    return;
  }
  if (!ADMIN_PASSWORD) {
    res.status(500).json({ error: "ADMIN_PASSWORD не задан на сервере" });
    return;
  }
  const username = String(req.body?.username || req.body?.user || "").trim();
  const password = String(req.body?.password || "");
  const userOk =
    username.length === ADMIN_USER.length &&
    crypto.timingSafeEqual(Buffer.from(username), Buffer.from(ADMIN_USER));
  const expected = ADMIN_PASSWORD;
  const passBuf = Buffer.from(password);
  const expectedBuf = Buffer.from(expected);
  const passOk =
    passBuf.length === expectedBuf.length && crypto.timingSafeEqual(passBuf, expectedBuf);
  if (!userOk || !passOk) {
    res.status(401).json({ error: "Неверный логин или пароль" });
    return;
  }
  const token = signToken({ admin: true, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  res.cookie(COOKIE_NAME, token, {
    ...cookieOptions(req),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ ok: true });
});

app.post("/api/admin/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions(req));
  res.json({ ok: true });
});

app.put("/api/admin/content", requireAdmin, (req, res) => {
  if (!req.body || typeof req.body !== "object") {
    res.status(400).json({ error: "Некорректные данные" });
    return;
  }
  const current = readContent();
  const body = req.body;
  const next = {
    ...current,
    ...body,
    seo: { ...(current.seo || {}), ...(body.seo || {}) },
    branding: { ...(current.branding || {}), ...(body.branding || {}) },
    hero: { ...current.hero, ...(body.hero || {}) },
    about: { ...current.about, ...(body.about || {}) },
    sections: { ...(current.sections || {}), ...(body.sections || {}) },
    offersStrip: { ...(current.offersStrip || {}), ...(body.offersStrip || {}) },
    installmentCallout: {
      ...(current.installmentCallout || {}),
      ...(body.installmentCallout || {}),
    },
    contact: { ...current.contact, ...(body.contact || {}) },
    contacts: { ...current.contacts, ...(body.contacts || {}) },
    footer: { ...current.footer, ...(body.footer || {}) },
    stats: Array.isArray(body.stats) ? body.stats : current.stats,
    experience: Array.isArray(body.experience) ? body.experience : current.experience,
    services: Array.isArray(body.services) ? body.services : current.services,
    projects: Array.isArray(body.projects) ? body.projects : current.projects,
    capabilities: Array.isArray(body.capabilities) ? body.capabilities : current.capabilities,
    process: Array.isArray(body.process) ? body.process : current.process,
    stack: Array.isArray(body.stack) ? body.stack : current.stack,
    photos: {
      ...current.photos,
      ...(body.photos || {}),
      projects: { ...(current.photos?.projects || {}), ...((body.photos && body.photos.projects) || {}) },
    },
  };
  if (next.about?.photo) {
    next.photos.aboutPrimary = next.about.photo;
  }
  writeContent(next);
  res.json(next);
});


function readLeads() {
  if (!fs.existsSync(leadsPath)) {
    return [];
  }
  try {
    const raw = JSON.parse(fs.readFileSync(leadsPath, "utf8"));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function writeLeads(leads) {
  fs.writeFileSync(leadsPath, JSON.stringify(leads, null, 2));
}

function rateLimitLead(ip) {
  const now = Date.now();
  const entry = leadAttempts.get(ip) || { count: 0, start: now };
  if (now - entry.start > 60 * 60 * 1000) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  leadAttempts.set(ip, entry);
  return entry.count <= 8;
}

function normalizeRuPhone(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) {
    digits = `7${digits.slice(1)}`;
  }
  if (digits.length === 10) {
    digits = `7${digits}`;
  }
  if (digits.length !== 11 || !digits.startsWith("7")) {
    return null;
  }
  return `+${digits}`;
}

function formatRuPhoneDisplay(value) {
  const normalized = normalizeRuPhone(value);
  if (!normalized) {
    return String(value || "");
  }
  const d = normalized.slice(1);
  return `+7 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
}

app.post("/api/leads", (req, res) => {
  const ip = clientIp(req);
  if (!rateLimitLead(ip)) {
    res.status(429).json({ error: "Слишком много заявок с вашего адреса. Попробуйте позже." });
    return;
  }
  if (String(req.body?.website || req.body?.company || "").trim()) {
    res.json({ ok: true });
    return;
  }
  const name = String(req.body?.name || "").trim().slice(0, 120);
  const phone = normalizeRuPhone(req.body?.phone);
  const social = String(req.body?.social || "").trim().slice(0, 200);
  const task = String(req.body?.task || req.body?.description || "").trim().slice(0, 2000);
  if (name.length < 2) {
    res.status(400).json({ error: "Укажите ФИО" });
    return;
  }
  if (!phone) {
    res.status(400).json({ error: "Укажите телефон в формате +7 (999) 999-99-99" });
    return;
  }
  if (social.length < 2) {
    res.status(400).json({ error: "Укажите соцсеть (Telegram / ссылка / ник)" });
    return;
  }
  if (task.length < 5) {
    res.status(400).json({ error: "Опишите задачу (минимум 5 символов)" });
    return;
  }
  const lead = {
    id: `lead-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
    name,
    phone,
    phoneDisplay: formatRuPhoneDisplay(phone),
    social,
    task,
    status: "new",
    createdAt: new Date().toISOString(),
    ip,
  };
  const leads = readLeads();
  leads.unshift(lead);
  writeLeads(leads.slice(0, 500));
  res.json({ ok: true, id: lead.id, phone });
});

app.get("/api/admin/leads", requireAdmin, (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({ leads: readLeads() });
});

app.patch("/api/admin/leads/:id", requireAdmin, (req, res) => {
  const id = String(req.params.id || "");
  const status = String(req.body?.status || "").trim();
  if (!["new", "read", "done"].includes(status)) {
    res.status(400).json({ error: "Неверный статус" });
    return;
  }
  const leads = readLeads();
  const lead = leads.find((item) => item.id === id);
  if (!lead) {
    res.status(404).json({ error: "Заявка не найдена" });
    return;
  }
  lead.status = status;
  writeLeads(leads);
  res.json({ ok: true, lead });
});

app.delete("/api/admin/leads/:id", requireAdmin, (req, res) => {
  const id = String(req.params.id || "");
  const next = readLeads().filter((item) => item.id !== id);
  writeLeads(next);
  res.json({ ok: true });
});

app.post("/api/admin/photos/:slot", requireAdmin, (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err.message || "Ошибка загрузки" });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: "Файл не получен" });
      return;
    }
    const slot = String(req.params.slot || "");
    const url = `/photos/uploads/${req.file.filename}`;
    const content = readContent();
    if (!content.photos) {
      content.photos = { heroPortrait: "", aboutPrimary: "", aboutSecondary: "", projects: {} };
    }
    if (slot.startsWith("projectImage:")) {
      const parts = slot.split(":");
      const slug = parts[1];
      const index = Number(parts[2]);
      if (!slug || Number.isNaN(index)) {
        res.status(400).json({ error: "Неверный слот галереи" });
        return;
      }
      if (!Array.isArray(content.projects)) {
        content.projects = [];
      }
      let project = content.projects.find((item) => item.slug === slug || item.id === slug);
      if (!project) {
        project = {
          id: slug,
          slug,
          title: slug,
          category: "",
          shortDescription: "",
          implemented: "",
          how: "",
          images: [],
          url: "",
          featured: true,
          accent: "#3dffd0",
        };
        content.projects.push(project);
      }
      const images = Array.isArray(project.images) ? [...project.images] : [];
      while (images.length <= index) {
        images.push("");
      }
      images[index] = url;
      project.images = images.filter(Boolean).slice(0, 3);
      content.photos.projects = content.photos.projects || {};
      if (index === 0) {
        content.photos.projects[slug] = url;
      }
    } else if (slot.startsWith("project:")) {
      const slug = slot.slice("project:".length);
      content.photos.projects = content.photos.projects || {};
      content.photos.projects[slug] = url;
      if (Array.isArray(content.projects)) {
        const project = content.projects.find((item) => item.slug === slug || item.id === slug);
        if (project) {
          const images = Array.isArray(project.images) ? project.images.filter(Boolean) : [];
          if (!images.includes(url)) {
            images.unshift(url);
          }
          project.images = images.slice(0, 3);
        }
      }
    } else if (slot === "heroPortrait" || slot === "aboutPrimary" || slot === "aboutSecondary") {
      content.photos[slot] = url;
      if (slot === "aboutPrimary") {
        content.about = content.about || {};
        content.about.photo = url;
      }
    } else if (slot === "aboutPhoto") {
      content.photos.aboutPrimary = url;
      content.about = content.about || {};
      content.about.photo = url;
    } else {
      res.status(400).json({ error: "Неизвестный слот" });
      return;
    }
    writeContent(content);
    res.json({ url, content });
  });
});

app.use(
  "/photos/uploads",
  express.static(uploadsDir, {
    fallthrough: false,
    index: false,
    setHeaders: (res) => {
      res.set("X-Content-Type-Options", "nosniff");
      res.set("Cache-Control", "public, max-age=86400");
    },
  }),
);

const distDir = path.join(root, "dist");
const adminDir = path.join(root, "admin");
const publicPhotosDir = path.join(root, "public", "photos");
const distPhotosDir = path.join(distDir, "photos");
const photosStaticDir = fs.existsSync(distPhotosDir) ? distPhotosDir : publicPhotosDir;

app.use("/admin", express.static(adminDir, { index: "index.html", fallthrough: true }));
app.get(["/admin", "/admin/"], (_req, res) => {
  res.sendFile(path.join(adminDir, "index.html"));
});

app.use(
  "/photos",
  express.static(photosStaticDir, {
    fallthrough: false,
    index: false,
    setHeaders: (res) => {
      res.set("X-Content-Type-Options", "nosniff");
      res.set("Cache-Control", "public, max-age=86400");
    },
  }),
);

app.use(
  express.static(distDir, {
    index: false,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.set("Cache-Control", "no-store");
      } else if (/\.(?:js|css|webp|png|svg|woff2?|xml|txt)$/i.test(filePath)) {
        res.set("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }),
);

function escapeHtmlAttr(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function absoluteSeoUrl(pathValue) {
  const fallback = "https://eldev.website/og/og-cover.png?v=20260912desc2";
  if (!pathValue) {
    return fallback;
  }
  if (String(pathValue).startsWith("http")) {
    return String(pathValue).includes("?") ? String(pathValue) : `${pathValue}?v=20260912fs1`;
  }
  const normalized = String(pathValue).startsWith("/") ? String(pathValue) : `/${pathValue}`;
  const withHost = `https://eldev.website${normalized}`;
  return withHost.includes("?") ? withHost : `${withHost}?v=20260912fs1`;
}

function injectSeoIntoHtml(html, content) {
  const seo = content?.seo || {};
  const title = seo.title || "ELDEV — full-stack разработка на Python и Go · сайты, боты, 3D";
  const description =
    seo.description ||
    "Разработка сайтов, лендингов, Telegram-ботов и 3D/WebGL. Full-stack на Python и Go. 5+ лет, 50+ кейсов.";
  const ogImage = absoluteSeoUrl(seo.ogImage || "/og/og-cover.png?v=20260912desc2");
  let next = html;
  next = next.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtmlAttr(title)}</title>`);
  next = next.replace(
    /(<meta\s+name="description"\s+content=")[^"]*(")/i,
    `$1${escapeHtmlAttr(description)}$2`,
  );
  next = next.replace(
    /(<meta\s+property="og:title"\s+content=")[^"]*(")/i,
    `$1${escapeHtmlAttr(title)}$2`,
  );
  next = next.replace(
    /(<meta\s+property="og:description"\s+content=")[^"]*(")/i,
    `$1${escapeHtmlAttr(description)}$2`,
  );
  next = next.replace(
    /(<meta\s+property="og:image"\s+content=")[^"]*(")/i,
    `$1${escapeHtmlAttr(ogImage)}$2`,
  );
  next = next.replace(
    /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/i,
    `$1${escapeHtmlAttr(title)}$2`,
  );
  next = next.replace(
    /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/i,
    `$1${escapeHtmlAttr(description)}$2`,
  );
  next = next.replace(
    /(<meta\s+name="twitter:image"\s+content=")[^"]*(")/i,
    `$1${escapeHtmlAttr(ogImage)}$2`,
  );
  return next;
}

app.get("/{*path}", (req, res, next) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/photos/")) {
    next();
    return;
  }
  if (path.extname(req.path)) {
    res.status(404).end();
    return;
  }
  res.set("Cache-Control", "no-store");
  const indexPath = path.join(distDir, "index.html");
  fs.readFile(indexPath, "utf8", (err, html) => {
    if (err) {
      next(err);
      return;
    }
    try {
      const content = readContent();
      res.type("html").send(injectSeoIntoHtml(html, content));
    } catch (error) {
      res.type("html").send(html);
    }
  });
});

app.use((err, _req, res, _next) => {
  res.status(500).json({ error: err.message || "Server error" });
});

app.listen(PORT, () => {
  console.log(`ELDEV server on :${PORT}`);
  if (!ADMIN_PASSWORD) {
    console.warn("WARNING: ADMIN_PASSWORD is not set");
  }
});
