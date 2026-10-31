"use strict";

const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const navigation = document.querySelector("[data-navigation]");
const mobileBreakpoint = window.matchMedia("(max-width: 1180px)");

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
}

function setMenuState(isOpen) {
  if (!menuButton || !navigation) return;

  menuButton.classList.toggle("is-active", isOpen);
  navigation.classList.toggle("is-open", isOpen);
  header?.classList.toggle("is-menu-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);

  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
}

function closeMenu() {
  setMenuState(false);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  setMenuState(!isOpen);
});

navigation?.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

mobileBreakpoint.addEventListener("change", (event) => {
  if (!event.matches) closeMenu();
});

// Подсветка карточек следует за курсором.
document.querySelectorAll("[data-mouse-glow]").forEach((element) => {
  element.addEventListener("pointermove", (event) => {
    const bounds = element.getBoundingClientRect();
    element.style.setProperty("--mouse-x", `${event.clientX - bounds.left}px`);
    element.style.setProperty("--mouse-y", `${event.clientY - bounds.top}px`);
  });
});

// Если изображения нет, остаётся предусмотренный CSS-фон.
document.querySelectorAll("[data-image-fallback]").forEach((image) => {
  image.addEventListener("error", () => {
    image.hidden = true;
  });
});

// Формы регистрации создают готовое письмо с заполненными данными.
document.querySelectorAll("[data-email-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const recipient = form.dataset.recipient;
    const subject = form.dataset.subject || "Website registration";
    const status = form.querySelector("[data-form-status]");
    const body = Array.from(new FormData(form).entries())
      .filter(([, value]) => String(value).trim())
      .map(([name, value]) => `${name}: ${value}`)
      .join("\n");

    if (status) {
      status.textContent =
        document.documentElement.lang === "en"
          ? "Opening your email app…"
          : "Открываем почтовое приложение…";
    }

    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
});

// Предзаполнение темы обращения на странице Partnership (#connect).
const partnerIntentConfig = {
  monthly: {
    label: "Monthly Partnership (North Houston · 12 months)",
    subject: "Monthly Partnership — North Houston",
    placeholder: "I would like to learn more about becoming a monthly partner for North Houston.",
  },
  "one-time": {
    label: "One-Time Gift (North Houston)",
    subject: "One-Time Gift — North Houston",
    placeholder: "I would like to make a one-time gift to support Church on the Rock.",
  },
  updates: {
    label: "Monthly Ministry Updates & Prayer Requests",
    subject: "Sign Up for Monthly Ministry Updates",
    placeholder: "Optional note or prayer greeting…",
    checkUpdates: true,
  },
  missions: {
    label: "Missions Support (Volga Region Leadership & Church Planting)",
    subject: "Missions Support — Volga Region Ministry",
    placeholder: "I would like to support Pastor Sergei's leadership training and church planting ministry.",
  },
  "contact-sergei": {
    label: "Direct Message for Pastor Sergei",
    subject: "Missions & Partnership Inquiry — Pastor Sergei",
    placeholder: "Write your question or message for Pastor Sergei…",
  },
};

const connectForm = document.querySelector("[data-partner-form]");
if (connectForm) {
  const intentPill = connectForm.querySelector("[data-intent-pill]");
  const intentLabel = connectForm.querySelector("[data-intent-label]");
  const intentReset = connectForm.querySelector("[data-intent-reset]");
  const intentHidden = connectForm.querySelector("[data-intent-input]");
  const messageField = connectForm.querySelector("textarea[name='Message']");
  const updatesCheckbox = connectForm.querySelector("input[type='checkbox']");
  const nameField = connectForm.querySelector("input[name='Name']");
  const defaultSubject = connectForm.dataset.subject;
  const defaultPlaceholder = messageField?.getAttribute("placeholder") || "";

  function applyPartnerIntent(key) {
    const config = partnerIntentConfig[key];
    if (!config) return;

    connectForm.dataset.subject = config.subject;
    if (intentHidden) intentHidden.value = config.label;
    if (intentLabel) intentLabel.textContent = config.label;
    if (intentPill) intentPill.hidden = false;
    if (messageField && !messageField.value.trim()) {
      messageField.setAttribute("placeholder", config.placeholder);
    }
    if (config.checkUpdates && updatesCheckbox) {
      updatesCheckbox.checked = true;
    }
  }

  document.querySelectorAll("[data-partner-intent]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      applyPartnerIntent(trigger.dataset.partnerIntent);
      window.setTimeout(() => nameField?.focus({ preventScroll: true }), 450);
    });
  });

  intentReset?.addEventListener("click", () => {
    connectForm.dataset.subject = defaultSubject;
    if (intentHidden) intentHidden.value = "";
    if (intentPill) intentPill.hidden = true;
    if (messageField) messageField.setAttribute("placeholder", defaultPlaceholder);
  });
}

function isPreviewSandboxHost() {
  const host = window.location.hostname;
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".e2b.app")
  );
}

function submitNetlifyFormInBackground(form) {
  if (!form.hasAttribute("data-netlify") || isPreviewSandboxHost()) return;

  const formData = new FormData(form);
  fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(formData).toString(),
  }).catch(() => {});
}

function validateCustomForm(form, alertElement) {
  let firstInvalidInput = null;
  const inputs = form.querySelectorAll("input, textarea, select");

  inputs.forEach((input) => {
    const field = input.closest(".form-field");
    if (!field) return;

    const errorEl = field.querySelector("[data-field-error]");
    const val = input.value.trim();
    let isFieldInvalid = false;

    if (input.hasAttribute("required") && !val) {
      isFieldInvalid = true;
    } else if (input.type === "email" && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      isFieldInvalid = true;
    }

    field.classList.toggle("is-invalid", isFieldInvalid);
    if (errorEl) errorEl.hidden = !isFieldInvalid;

    if (isFieldInvalid && !firstInvalidInput) {
      firstInvalidInput = input;
    }
  });

  if (alertElement) {
    alertElement.hidden = !firstInvalidInput;
  }

  if (firstInvalidInput) {
    firstInvalidInput.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      firstInvalidInput.focus({ preventScroll: true });
    }, 320);
    return false;
  }

  return true;
}

function bindLiveFieldClearing(form, alertElement) {
  form.querySelectorAll("input, textarea, select").forEach((input) => {
    input.addEventListener("input", () => {
      const field = input.closest(".form-field");
      if (!field || !field.classList.contains("is-invalid")) return;

      const val = input.value.trim();
      const stillInvalid =
        (input.hasAttribute("required") && !val) ||
        (input.type === "email" && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));

      if (!stillInvalid) {
        field.classList.remove("is-invalid");
        const errorEl = field.querySelector("[data-field-error]");
        if (errorEl) errorEl.hidden = true;
        if (alertElement && !form.querySelector(".form-field.is-invalid")) {
          alertElement.hidden = true;
        }
      }
    });
  });
}

// Форма «Спланировать визит» с переключением на экран благодарности «СПАСИБО!».
const visitForm = document.querySelector("[data-visit-form]");
if (visitForm) {
  const formView = document.querySelector("[data-visit-form-view]");
  const thanksView = document.querySelector("[data-visit-thanks]");
  const alertEl = visitForm.querySelector("[data-visit-error]");

  bindLiveFieldClearing(visitForm, alertEl);

  function showVisitThanks(scrollIntoView = true) {
    if (formView) formView.hidden = true;
    if (thanksView) {
      thanksView.hidden = false;
      if (scrollIntoView) {
        thanksView.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }

  function showVisitForm() {
    if (thanksView) thanksView.hidden = true;
    if (formView) {
      formView.hidden = false;
      formView.scrollIntoView({ behavior: "smooth", block: "start" });
      const firstInput = visitForm.querySelector("input:not([type='hidden'])");
      window.setTimeout(() => firstInput?.focus({ preventScroll: true }), 350);
    }
  }

  if (
    window.location.hash === "#thanks" ||
    new URLSearchParams(window.location.search).get("thanks") === "1"
  ) {
    showVisitThanks(false);
  }

  document.querySelectorAll("a[href='#visit-form']").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      showVisitForm();
    });
  });

  visitForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateCustomForm(visitForm, alertEl)) return;

    submitNetlifyFormInBackground(visitForm);
    showVisitThanks(true);
  });
}

const year = document.querySelector("[data-current-year]");
if (year) year.textContent = String(new Date().getFullYear());
