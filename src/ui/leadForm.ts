import { formatRuPhoneMask, isValidRuPhone, normalizeRuPhone } from "../lib/phone";

export function initLeadForm(): void {
  const form = document.getElementById("leadForm") as HTMLFormElement | null;
  if (!form) {
    return;
  }

  const status = document.getElementById("leadStatus");
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const nameInput = form.querySelector<HTMLInputElement>("#leadName");
  const phoneInput = form.querySelector<HTMLInputElement>("#leadPhone");
  const socialInput = form.querySelector<HTMLInputElement>("#leadSocial");
  const taskInput = form.querySelector<HTMLTextAreaElement>("#leadTask");
  const honeypot = form.querySelector<HTMLInputElement>("#leadWebsite");

  phoneInput?.addEventListener("input", () => {
    if (!phoneInput) {
      return;
    }
    const masked = formatRuPhoneMask(phoneInput.value);
    phoneInput.value = masked;
  });

  phoneInput?.addEventListener("blur", () => {
    if (!phoneInput || !phoneInput.value.trim()) {
      return;
    }
    if (isValidRuPhone(phoneInput.value)) {
      phoneInput.value = formatRuPhoneMask(phoneInput.value);
      phoneInput.setCustomValidity("");
      return;
    }
    phoneInput.setCustomValidity("Укажите телефон в формате +7 (999) 999-99-99");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!status || !button || !nameInput || !phoneInput || !socialInput || !taskInput) {
      return;
    }

    const name = nameInput.value.trim();
    const phone = normalizeRuPhone(phoneInput.value);
    const social = socialInput.value.trim();
    const task = taskInput.value.trim();
    if (name.length < 2) {
      status.textContent = "Укажите ФИО.";
      status.dataset.state = "error";
      nameInput.focus();
      return;
    }
    if (!phone) {
      status.textContent = "Укажите телефон в формате +7 (999) 999-99-99.";
      status.dataset.state = "error";
      phoneInput.focus();
      return;
    }
    if (social.length < 2) {
      status.textContent = "Укажите Telegram, ссылку или ник в соцсети.";
      status.dataset.state = "error";
      socialInput.focus();
      return;
    }
    if (task.length < 5) {
      status.textContent = "Кратко опишите задачу (минимум 5 символов).";
      status.dataset.state = "error";
      taskInput.focus();
      return;
    }

    phoneInput.value = formatRuPhoneMask(phone);
    phoneInput.setCustomValidity("");
    button.disabled = true;
    status.textContent = "Отправляем заявку…";
    status.dataset.state = "pending";

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          social,
          task,
          website: honeypot?.value || "",
        }),
      });
      const data = (await response.json()) as { error?: string; ok?: boolean };
      if (!response.ok) {
        throw new Error(data.error || "Не удалось отправить заявку");
      }
      form.reset();
      status.textContent = "Заявка принята. Свяжусь с вами в ближайшее время.";
      status.dataset.state = "ok";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ошибка отправки";
      status.textContent = message;
      status.dataset.state = "error";
    } finally {
      button.disabled = false;
    }
  });
}
