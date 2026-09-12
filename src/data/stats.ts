export type StatItem = {
  id: string;
  value: number;
  suffix: string;
  label: string;
  prefix?: string;
};

export const stats: StatItem[] = [
  { id: "years", value: 5, suffix: "+", label: "лет в web-разработке" },
  { id: "cases", value: 50, suffix: "+", label: "успешных кейсов" },
  { id: "intl", value: 1, suffix: "", label: "международная компания", prefix: "" },
  { id: "prod", value: 1, suffix: "", label: "production-разработка", prefix: "" },
];

export const heroStats = [
  { value: "5+", label: "лет опыта" },
  { value: "50+", label: "кейсов" },
  { value: "INTL", label: "foreign company" },
  { value: "PY/GO", label: "full-stack" },
] as const;
