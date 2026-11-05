"use strict";

const docLang = (document.documentElement.lang || "ru").toLowerCase();

function persistChosenLanguage(lang) {
  try {
    if (lang) localStorage.setItem("cotr_lang", lang);
  } catch (_) {}
}

document.querySelectorAll("[data-set-lang]").forEach((link) => {
  const save = () => persistChosenLanguage(link.dataset.setLang);
  link.addEventListener("pointerdown", save);
  link.addEventListener("click", save);
});

const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const navigation = document.querySelector("[data-navigation]");
const langDropdowns = document.querySelectorAll("[data-lang-dropdown]");
const mobileBreakpoint = window.matchMedia("(max-width: 1240px)");

function closeAllLangDropdowns() {
  langDropdowns.forEach((dropdown) => {
    dropdown.classList.remove("is-open");
    dropdown.querySelector("[data-lang-toggle]")?.setAttribute("aria-expanded", "false");
  });
}

langDropdowns.forEach((dropdown) => {
  const toggle = dropdown.querySelector("[data-lang-toggle]");
  toggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    const willOpen = !dropdown.classList.contains("is-open");
    closeAllLangDropdowns();
    if (willOpen) {
      dropdown.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    }
  });

  dropdown.querySelectorAll("[data-set-lang]").forEach((option) => {
    option.addEventListener("click", () => {
      closeAllLangDropdowns();
    });
  });
});

document.addEventListener("pointerdown", (event) => {
  if (!event.target.closest("[data-lang-dropdown]")) {
    closeAllLangDropdowns();
  }
});

const menuLabels = {
  ru: { open: "Открыть меню", close: "Закрыть меню" },
  en: { open: "Open menu", close: "Close menu" },
  uk: { open: "Відкрити меню", close: "Закрити меню" },
};

function getMenuLabels() {
  if (docLang.startsWith("en")) return menuLabels.en;
  if (docLang.startsWith("uk")) return menuLabels.uk;
  return menuLabels.ru;
}

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
}

function setMenuState(isOpen) {
  if (!menuButton || !navigation) return;

  if (isOpen) closeAllLangDropdowns();

  const labels = getMenuLabels();
  menuButton.classList.toggle("is-active", isOpen);
  navigation.classList.toggle("is-open", isOpen);
  header?.classList.toggle("is-menu-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);

  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? labels.close : labels.open);
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
  if (event.key === "Escape") {
    closeAllLangDropdowns();
    closeMenu();
  }
});

mobileBreakpoint.addEventListener("change", (event) => {
  if (!event.matches) {
    closeAllLangDropdowns();
    closeMenu();
  }
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

// Предзаполнение темы обращения на странице Partnership (#connect) на 3 языках.
const partnerIntentByLang = {
  en: {
    monthly: {
      label: "Monthly Partnership (North Houston · 12 months)",
      placeholder: "I would like to learn more about becoming a monthly partner for North Houston.",
    },
    updates: {
      label: "Monthly Ministry Updates & Prayer Requests",
      placeholder: "Optional note or prayer greeting…",
      checkUpdates: true,
    },
    missions: {
      label: "Missions Support (Volga Region Leadership & Church Planting)",
      placeholder: "I would like to support Pastor Sergei's leadership training and church planting ministry.",
    },
    "contact-sergei": {
      label: "Direct Message for Pastor Sergei",
      placeholder: "Write your question or message for Pastor Sergei…",
    },
  },
  ru: {
    monthly: {
      label: "Ежемесячное партнёрство (Северный Хьюстон · 12 месяцев)",
      placeholder: "Хочу узнать подробнее о ежемесячном партнёрстве.",
    },
    updates: {
      label: "Ежемесячные новости служения и молитвенные нужды",
      placeholder: "Необязательный комментарий…",
      checkUpdates: true,
    },
    missions: {
      label: "Поддержка миссии (обучение лидеров и насаждение церквей в Поволжье)",
      placeholder: "Хочу поддержать миссионерское и лидерское служение пастора Сергея.",
    },
    "contact-sergei": {
      label: "Личное сообщение пастору Сергею",
      placeholder: "Напишите ваш вопрос или сообщение для пастора Сергея…",
    },
  },
  uk: {
    monthly: {
      label: "Щомісячне партнерство (Північний Х’юстон · 12 місяців)",
      placeholder: "Хочу дізнатися детальніше про щомісячне партнерство.",
    },
    updates: {
      label: "Щомісячні новини служіння та молитовні потреби",
      placeholder: "Необов’язковий коментар…",
      checkUpdates: true,
    },
    missions: {
      label: "Підтримка місії (навчання лідерів та заснування церков)",
      placeholder: "Хочу підтримати місіонерське та лідерське служіння пастора Сергія.",
    },
    "contact-sergei": {
      label: "Особисте повідомлення пастору Сергію",
      placeholder: "Напишіть ваше запитання або повідомлення для пастора Сергія…",
    },
  },
};

function bindIntentForm(formSelector, triggerAttr, intentDictionary) {
  const form = document.querySelector(formSelector);
  if (!form) return;

  const langKey = docLang.startsWith("en") ? "en" : docLang.startsWith("uk") ? "uk" : "ru";
  const dict = intentDictionary[langKey] || intentDictionary.en;
  const intentPill = form.querySelector("[data-intent-pill]");
  const intentLabel = form.querySelector("[data-intent-label]");
  const intentReset = form.querySelector("[data-intent-reset]");
  const intentHidden = form.querySelector("[data-intent-input]");
  const messageField = form.querySelector("textarea[name='Message']");
  const updatesCheckbox = form.querySelector("input[type='checkbox']");
  const nameField = form.querySelector("input[name='Name']");
  const defaultPlaceholder = messageField?.getAttribute("placeholder") || "";

  function applyIntent(key) {
    const config = dict[key];
    if (!config) return;

    if (intentHidden) intentHidden.value = config.label;
    if (intentLabel) intentLabel.textContent = config.label;
    if (intentPill) intentPill.hidden = false;
    if (messageField && !messageField.value.trim() && config.placeholder) {
      messageField.setAttribute("placeholder", config.placeholder);
    }
    if (config.checkUpdates && updatesCheckbox) {
      updatesCheckbox.checked = true;
    }
  }

  document.querySelectorAll(`[${triggerAttr}]`).forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const container = form.closest("[data-ajax-container]");
      const formView = container?.querySelector("[data-ajax-form-view]");
      const thanksView = container?.querySelector("[data-ajax-thanks]");
      if (thanksView && !thanksView.hidden) {
        thanksView.hidden = true;
        if (formView) formView.hidden = false;
      }
      const key = trigger.getAttribute(triggerAttr);
      applyIntent(key);
      window.setTimeout(() => nameField?.focus({ preventScroll: true }), 450);
    });
  });

  intentReset?.addEventListener("click", () => {
    if (intentHidden) intentHidden.value = "";
    if (intentPill) intentPill.hidden = true;
    if (messageField) messageField.setAttribute("placeholder", defaultPlaceholder);
  });
}

bindIntentForm("[data-partner-form]", "data-partner-intent", partnerIntentByLang);

// Предзаполнение темы на странице «Поддержать» (Молитва / Волонтёрство).
const giveIntentByLang = {
  ru: {
    prayer: {
      label: "Молитвенная поддержка — получать молитвенные нужды",
      placeholder: "Напишите пару слов, если хотите, или просто оставьте контакт для получения молитвенных нужд.",
    },
    volunteer: {
      label: "Волонтёрство — присоединиться к команде",
      placeholder: "Расскажите коротко о себе или в каком служении вам хотелось бы участвовать.",
    },
  },
  en: {
    prayer: {
      label: "Prayer Support — Receive Prayer Requests",
      placeholder: "Optional message or prayer note…",
    },
    volunteer: {
      label: "Volunteering — Join the Team",
      placeholder: "Tell us briefly how you would love to serve or get involved…",
    },
  },
  uk: {
    prayer: {
      label: "Молитовна підтримка — отримувати молитовні потреби",
      placeholder: "Напишіть кілька слів за бажанням або просто залиште контакт.",
    },
    volunteer: {
      label: "Волонтерство — приєднатися до команди",
      placeholder: "Розкажіть коротко про себе або в якому служінні ви хотіли б брати участь.",
    },
  },
};

bindIntentForm("[data-give-form]", "data-give-intent", giveIntentByLang);

// Кнопка «Познакомиться лично» на странице «Пастор» — открывает форму прямо на странице.
const pastorConnectToggle = document.querySelector("[data-pastor-connect-toggle]");
const pastorConnectWrap = document.querySelector("[data-pastor-connect-wrap]");
if (pastorConnectToggle && pastorConnectWrap) {
  pastorConnectToggle.addEventListener("click", () => {
    pastorConnectWrap.hidden = false;
    const container = pastorConnectWrap.querySelector("[data-ajax-container]") || pastorConnectWrap;
    const formView = container.querySelector("[data-ajax-form-view]");
    const thanksView = container.querySelector("[data-ajax-thanks]");
    if (thanksView && !thanksView.hidden) {
      thanksView.hidden = true;
      if (formView) formView.hidden = false;
    }
    pastorConnectWrap.scrollIntoView({ behavior: "smooth", block: "center" });
    const firstInput = pastorConnectWrap.querySelector("input[name='Name']");
    window.setTimeout(() => firstInput?.focus({ preventScroll: true }), 320);
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

const networkErrorByLang = {
  ru: "Не удалось отправить форму. Пожалуйста, обновите страницу и попробуйте ещё раз или напишите на sergei@cotr.com.",
  en: "Could not send the form right now. Please refresh the page and try again, or email sergei@cotr.com.",
  uk: "Не вдалося надіслати форму. Будь ласка, оновіть сторінку та спробуйте ще раз або напишіть на sergei@cotr.com.",
};

function getNetworkErrorMessage() {
  if (docLang.startsWith("en")) return networkErrorByLang.en;
  if (docLang.startsWith("uk")) return networkErrorByLang.uk;
  return networkErrorByLang.ru;
}

async function submitNetlifyFormInBackground(form) {
  if (isPreviewSandboxHost()) return true;

  const formData = new FormData(form);
  const params = new URLSearchParams();
  const formName =
    form.getAttribute("name") ||
    String(formData.get("form-name") || "").trim();

  if (formName) {
    params.set("form-name", formName);
  }

  for (const [key, value] of formData.entries()) {
    if (key === "form-name") continue;
    if (typeof value === "string") {
      params.append(key, value);
    }
  }

  const response = await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`Form submission failed with status ${response.status}`);
  }

  return true;
}

function validateCustomForm(form, alertElement, defaultAlertText = "") {
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
    if (firstInvalidInput && defaultAlertText) {
      alertElement.textContent = defaultAlertText;
    }
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
  const defaultAlertText = alertEl?.textContent.trim() || "";

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

  visitForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validateCustomForm(visitForm, alertEl, defaultAlertText)) return;

    const submitBtn = visitForm.querySelector("button[type='submit']");
    if (submitBtn) submitBtn.disabled = true;

    try {
      await submitNetlifyFormInBackground(visitForm);
      if (alertEl) alertEl.hidden = true;
      showVisitThanks(true);
    } catch (_) {
      if (alertEl) {
        alertEl.textContent = getNetworkErrorMessage();
        alertEl.hidden = false;
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

// Универсальная фоновая отправка форм (Partnership, Языковые курсы, Поддержать, Пастор)
// через Netlify Forms без открытия почтового приложения.
document.querySelectorAll("[data-ajax-form]").forEach((form) => {
  const container = form.closest("[data-ajax-container]");
  const formView = container?.querySelector("[data-ajax-form-view]");
  const thanksView = container?.querySelector("[data-ajax-thanks]");
  const alertEl = form.querySelector("[data-form-alert]");
  const defaultAlertText = alertEl?.textContent.trim() || "";

  bindLiveFieldClearing(form, alertEl);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validateCustomForm(form, alertEl, defaultAlertText)) return;

    const submitBtn = form.querySelector("button[type='submit']");
    if (submitBtn) submitBtn.disabled = true;

    try {
      await submitNetlifyFormInBackground(form);
      if (alertEl) alertEl.hidden = true;
      if (formView) formView.hidden = true;
      if (thanksView) {
        thanksView.hidden = false;
        thanksView.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch (_) {
      if (alertEl) {
        alertEl.textContent = getNetworkErrorMessage();
        alertEl.hidden = false;
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});

const year = document.querySelector("[data-current-year]");
if (year) year.textContent = String(new Date().getFullYear());
