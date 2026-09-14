export type ProjectCase = {
  id: string;
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  implemented: string;
  how: string;
  images: string[];
  url: string;
  featured: boolean;
  accent: string;
  price?: string;
  media?: "logo" | "shot";
};

export const defaultProjects: ProjectCase[] = [
  {
    id: "epasha",
    title: "Стандарт-Упак",
    slug: "epasha",
    category: "B2B · Упаковка",
    shortDescription:
      "Каталог и витрина упаковочных материалов для бизнеса: поставки по России с 2015 года.",
    implemented:
      "Каталог товаров, карточки позиций, коммерческая структура и адаптивная витрина.",
    how: "Сверстан и собран продающий frontend с акцентом на ассортимент и быстрый путь к заявке.",
    images: ["/photos/projects/epasha-desktop.webp"],
    url: "",
    featured: true,
    accent: "#3dffd0",
  },
  {
    id: "vkokosi-vpn",
    title: "vkokosiVPN",
    slug: "vkokosi-vpn",
    category: "VPN · Под ключ",
    shortDescription:
      "Корпоративный и личный VPN под ключ: сайт сервиса, оплата через Telegram-бота и комфортный интернет.",
    implemented:
      "Сайт vkokosiVPN, Telegram-бот для оплаты и развёртывание VPN для корпоративного и личного использования.",
    how: "Собран продуктовый frontend и платёжный сценарий в Telegram; VPN разворачивается под задачу клиента.",
    images: ["/photos/projects/vkokosi-vpn.webp"],
    url: "",
    featured: true,
    accent: "#4aa8ff",
    media: "logo",
  },
  {
    id: "fox64",
    title: "English Fox",
    slug: "fox64",
    category: "Education · Саратов",
    shortDescription: "Сайт курсов английского в Саратове: направления, запись и подача школы.",
    implemented: "Лендинг школы, блоки направлений и понятный CTA на запись.",
    how: "Собран лёгкий маркетинговый сайт с чистой иерархией и мобильной подачей.",
    images: ["/photos/projects/fox64-desktop.webp"],
    url: "",
    featured: true,
    accent: "#ffc857",
  },
  {
    id: "gastrodvor",
    title: "Гастродвор",
    slug: "gastrodvor",
    category: "Food mall · Саратов",
    shortDescription:
      "Фудмолл с открытыми фудкортами и разными кухнями — витрина гастромаркета в Саратове.",
    implemented: "Витрина фудмолла, блоки кухонь/ресторанов и контентная подача локации.",
    how: "Сверстан атмосферный frontend под food-медиа и быстрый просмотр точек.",
    images: ["/photos/projects/gastrodvor-desktop.webp"],
    url: "",
    featured: true,
    accent: "#ff7a59",
  },
  {
    id: "nova-paradise",
    title: "Нова Парадайз",
    slug: "nova-paradise",
    category: "Leisure · Комплекс",
    shortDescription:
      "Сайт комплекса отдыха: бассейны, детская зона, шезлонги, бар и сезонное предложение.",
    implemented: "Презентация комплекса, услуг и сезонного статуса с контактами.",
    how: "Собран сайт-витрина с акцентом на зоны отдыха и понятный контактный блок.",
    images: ["/photos/projects/nova-paradise-desktop.webp"],
    url: "",
    featured: true,
    accent: "#7af0d4",
  },
  {
    id: "kaifuso",
    title: "Kaifuso",
    slug: "kaifuso",
    category: "Restaurant · Москва",
    shortDescription:
      "Азиатский ресторан-клуб на Кузнецком мосту: кухня, афиша, атмосфера и бронирование.",
    implemented: "Витрина ресторана-клуба, афиша/меню-логика и блок бронирования.",
    how: "Собран премиальный frontend с сильной атмосферой и ясным CTA.",
    images: ["/photos/projects/kaifuso-desktop.webp"],
    url: "",
    featured: true,
    accent: "#c4a0ff",
  },
  {
    id: "quickresto",
    title: "Quick Resto",
    slug: "quickresto",
    category: "SaaS · Автоматизация",
    shortDescription:
      "Система автоматизации общепита: онлайн-касса, склад, CRM, доставка и приложение.",
    implemented: "Продуктовый сайт SaaS: оффер, решения, сценарии для HoReCa.",
    how: "Собран плотный product-marketing frontend под B2B-конверсию.",
    images: ["/photos/projects/quickresto-desktop.webp"],
    url: "",
    featured: true,
    accent: "#5b8cff",
  },
];
