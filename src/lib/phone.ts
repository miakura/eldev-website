export function digitsOnly(value: string): string {
  return String(value || "").replace(/\D/g, "");
}

export function normalizeRuPhone(value: string): string | null {
  let digits = digitsOnly(value);
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

export function formatRuPhoneMask(value: string): string {
  let digits = digitsOnly(value);
  if (!digits) {
    return "";
  }
  if (digits.startsWith("8")) {
    digits = `7${digits.slice(1)}`;
  }
  if (!digits.startsWith("7")) {
    digits = `7${digits}`;
  }
  digits = digits.slice(0, 11);
  const rest = digits.slice(1);
  let out = "+7";
  if (rest.length === 0) {
    return out;
  }
  out += ` (${rest.slice(0, Math.min(3, rest.length))}`;
  if (rest.length < 3) {
    return out;
  }
  out += ")";
  if (rest.length === 3) {
    return out;
  }
  out += ` ${rest.slice(3, Math.min(6, rest.length))}`;
  if (rest.length <= 6) {
    return out;
  }
  out += `-${rest.slice(6, Math.min(8, rest.length))}`;
  if (rest.length <= 8) {
    return out;
  }
  out += `-${rest.slice(8, 10)}`;
  return out;
}

export function formatRuPhoneInput(value: string): string {
  const normalized = normalizeRuPhone(value);
  if (!normalized) {
    return formatRuPhoneMask(value);
  }
  return formatRuPhoneMask(normalized);
}

export function isValidRuPhone(value: string): boolean {
  return normalizeRuPhone(value) !== null;
}
