"use strict";

const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const navigation = document.querySelector("[data-navigation]");
const mobileBreakpoint = window.matchMedia("(max-width: 1080px)");

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
      status.textContent = "Открываем почтовое приложение…";
    }

    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
});

const year = document.querySelector("[data-current-year]");
if (year) year.textContent = String(new Date().getFullYear());
