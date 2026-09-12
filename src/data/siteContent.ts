import { defaultProjects, type ProjectCase } from "./projects";

export type ServiceItem = {
  id: string;
  title: string;
  blurb: string;
  keywords: string;
  kind?: "core" | "offer";
  price?: string;
  priceNote?: string;
};

export type SiteContent = {
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
    verificationGoogle: string;
    verificationYandex: string;
  };
  branding: {
    marquee: string;
    logoText: string;
    logoAccent: string;
    logoUrl: string;
  };
  hero: {
    eyebrow: string;
    availability: string;
    headlineBefore: string;
    headlineAccent: string;
    headlineAfter: string;
    lead: string;
    ctaPrimary: string;
    ctaSecondary: string;
    hint: string;
  };
  stats: Array<{ value: string; label: string }>;
  experience: Array<{ value: string; text: string }>;
  about: {
    eyebrow: string;
    name: string;
    title: string;
    paragraphs: string[];
    photo: string;
  };
  sections: {
    servicesEyebrow: string;
    servicesTitle: string;
    servicesLead: string;
    projectsEyebrow: string;
    projectsTitle: string;
    projectsLead: string;
    contactEyebrow: string;
  };
  offersStrip: {
    kicker: string;
    title: string;
    lead: string;
  };
  services: ServiceItem[];
  installmentCallout: {
    kicker: string;
    title: string;
    text: string;
  };
  capabilities: Array<{ title: string; text: string }>;
  process: Array<{ num: string; title: string; text: string }>;
  stack: string[];
  projects: ProjectCase[];
  contact: {
    title: string;
    text: string;
    ctaLabel: string;
  };
  contacts: {
    telegramUrl: string;
    telegramHandle: string;
    phoneDisplay: string;
    phoneHref: string;
  };
  footer: {
    left: string;
    availability: string;
  };
  photos: {
    heroPortrait: string;
    aboutPrimary: string;
    aboutSecondary: string;
    projects: Record<string, string>;
  };
};

export const defaultContent: SiteContent = {
  seo: {
    title: "ELDEV — full-stack разработка на Python и Go · сайты, боты, 3D",
    description:
      "Разработка сайтов, лендингов, Telegram-ботов и 3D/WebGL. Full-stack на Python и Go. 5+ лет, 50+ кейсов.",
    keywords:
      "написание сайтов, разработка сайтов, создание сайтов, разработка телеграм ботов, telegram bot, 3д сайты, WebGL, three.js, Python, Go",
    ogImage: "/og/og-cover.png?v=20260912desc2",
    verificationGoogle: "",
    verificationYandex: "",
  },
  branding: {
    marquee: "ELDEV",
    logoText: "EL",
    logoAccent: "DEV",
    logoUrl: "/logo.svg",
  },
  hero: {
    eyebrow: "3D-first portfolio",
    availability: "Открыт к проектам · Full-stack",
    headlineBefore: "Сайт как",
    headlineAccent: "3D-модель",
    headlineAfter: "— full-stack на Python и Go",
    lead: "5+ лет · 50+ кейсов · разработка сайтов · Telegram-боты · 3D/WebGL · Python · Go · production в международной компании.",
    ctaPrimary: "Обсудить задачу",
    ctaSecondary: "К реальным проектам",
    hint: "Двигайте курсор · листайте — сцена отвечает",
  },
  stats: [
    { value: "5+", label: "лет опыта" },
    { value: "50+", label: "кейсов" },
    { value: "INTL", label: "foreign company" },
    { value: "PY/GO", label: "full-stack" },
  ],
  experience: [
    { value: "5+", text: "лет web-разработки" },
    { value: "50+", text: "успешных проектов" },
    { value: "INTL", text: "работа в международной компании" },
    { value: "PY/GO", text: "full-stack Python и Go" },
  ],
  about: {
    eyebrow: "About",
    name: "ELDEV",
    title: "Full-stack разработчик: Python, Go и 3D UI",
    paragraphs: [
      "Делаю сайты, Telegram-ботов и interactive/WebGL-интерфейсы. Backend на Python и Go, frontend с сильной визуальной подачей.",
      "5+ лет в разработке, 50+ кейсов, работаю в международной компании. Беру задачи от лендинга до сервиса с API и админкой.",
    ],
    photo: "/photos/about-portrait.webp",
  },
  sections: {
    servicesEyebrow: "Services",
    servicesTitle: "Услуги разработки",
    servicesLead:
      "Написание сайтов — от 50 000 ₽, Telegram-боты — от 15 000 ₽. Также 3D/WebGL и сопровождение после запуска.",
    projectsEyebrow: "Projects",
    projectsTitle: "Реальные кейсы",
    projectsLead: "Шесть боевых сайтов в продакшене. Превью и описание — без перехода на внешние URL.",
    contactEyebrow: "Contact",
  },
  offersStrip: {
    kicker: "Также беру",
    title: "Продвижение · доработка · ребрендинг · поддержка",
    lead: "Если сайт уже есть — усилю трафик, допишу функциональность, обновлю визуальный язык или возьму на сопровождение: от 3 месяцев, 7 000 ₽ в месяц.",
  },
  services: [
    {
      id: "sites",
      title: "Разработка сайтов",
      blurb:
        "Лендинги, корпоративные и продуктовые сайты: структура, вёрстка, frontend и запуск. Упор на скорость, адаптив и конверсию.",
      keywords: "написание сайтов, создание сайтов, разработка сайтов",
      kind: "core",
      price: "от 50 000 ₽",
    },
    {
      id: "telegram-bots",
      title: "Telegram-боты",
      blurb:
        "Боты для заявок, каталогов, уведомлений и внутренних процессов. Интеграции с API, CRM и оплатами на Python/Go.",
      keywords: "разработка телеграм ботов, telegram bot",
      kind: "core",
      price: "от 15 000 ₽",
    },
    {
      id: "3d-sites",
      title: "3D / WebGL сайты",
      blurb:
        "Интерактивные 3D-сцены и WebGL-акценты для hero и продукта — лёгкие, плавные, без перегруза мобильных устройств.",
      keywords: "3д сайты, WebGL, three.js сайты",
      kind: "core",
    },
    {
      id: "promo",
      title: "Продвижение",
      blurb:
        "SEO-структура, контент и технические правки, чтобы сайт лучше находили по рабочим запросам — без обещаний «гарантированного топа».",
      keywords: "продвижение сайтов, SEO",
      kind: "offer",
    },
    {
      id: "rework",
      title: "Доработка",
      blurb:
        "Допилю существующий сайт: скорость, адаптив, формы, админку, интеграции и аккуратный рефакторинг без полной пересборки.",
      keywords: "доработка сайтов, поддержка сайта",
      kind: "offer",
    },
    {
      id: "rebrand",
      title: "Ребрендинг",
      blurb:
        "Обновлю визуальный язык и подачу: типографика, композиция, motion/3D-акценты — чтобы продукт выглядел свежее и дороже.",
      keywords: "ребрендинг сайта, редизайн",
      kind: "offer",
    },
    {
      id: "maintenance",
      title: "Поддержка после запуска",
      blurb:
        "Сопровождение сайта после написания: правки, обновления, мониторинг, мелкий функционал и спокойная эксплуатация без сюрпризов.",
      keywords: "поддержка сайта, сопровождение сайта, обслуживание сайта",
      kind: "offer",
      price: "7 000 ₽ / мес",
      priceNote: "от 3 месяцев",
    },
  ],
  installmentCallout: {
    kicker: "Рассрочка",
    title: "6 месяцев",
    text: "Ежемесячный платёж за сайт или бота можно разбить на полгода.",
  },
  capabilities: [
    {
      title: "Python",
      text: "Backend и сервисы на Python: API, интеграции, бизнес-логика.",
    },
    {
      title: "Go",
      text: "Сетевые и высоконагруженные сервисы на Go.",
    },
    {
      title: "Frontend",
      text: "React/TypeScript интерфейсы с сильным UX.",
    },
    {
      title: "3D / WebGL",
      text: "Точечный motion и лёгкий WebGL без перегруза.",
    },
    {
      title: "Full-stack",
      text: "Связка frontend + API end-to-end до деплоя.",
    },
    {
      title: "Performance",
      text: "Скорость интерфейса и адекватная нагрузка на backend.",
    },
  ],
  process: [
    { num: "01", title: "Анализ", text: "Задача, аудитория, ограничения и метрики." },
    { num: "02", title: "Структура", text: "Архитектура, сценарии и ключевые экраны." },
    { num: "03", title: "Development", text: "Вёрстка и разработка на современном стеке." },
    { num: "04", title: "Launch", text: "Публикация, доступы и поддержка после релиза." },
  ],
  stack: [
    "Python",
    "Go",
    "TypeScript",
    "React",
    "Three.js",
    "PostgreSQL",
    "Docker",
    "Vite",
  ],
  projects: defaultProjects,
  contact: {
    title: "Нужен сайт, бот или 3D-интерфейс — напишите",
    text: "Коротко опишите задачу в Telegram или позвоните. Отвечаю по срокам, стеку и формату работы.",
    ctaLabel: "Написать в Telegram",
  },
  contacts: {
    telegramUrl: "https://t.me/pashaevel",
    telegramHandle: "@pashaevel",
    phoneDisplay: "+7 937 265-62-00",
    phoneHref: "tel:+79372656200",
  },
  footer: {
    left: "© 2026 ELDEV · сайты · боты · 3D",
    availability: "Available for new projects",
  },
  photos: {
    heroPortrait: "",
    aboutPrimary: "/photos/about-portrait.webp",
    aboutSecondary: "",
    projects: {
      epasha: "/photos/projects/epasha-desktop.webp",
      fox64: "/photos/projects/fox64-desktop.webp",
      gastrodvor: "/photos/projects/gastrodvor-desktop.webp",
      "nova-paradise": "/photos/projects/nova-paradise-desktop.webp",
      kaifuso: "/photos/projects/kaifuso-desktop.webp",
      quickresto: "/photos/projects/quickresto-desktop.webp",
    },
  },
};
