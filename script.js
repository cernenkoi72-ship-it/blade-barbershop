
// BLADE BARBER STUDIO v1.0

// УСЛУГИ И ЦЕНЫ

const services = {
  haircut: {
    name: "Мужская стрижка",
    price: 1800,
    duration: 60
  },
  beard: {
    name: "Моделирование бороды",
    price: 1000,
    duration: 30
  },
  combo: {
    name: "Стрижка + борода",
    price: 2500,
    duration: 90
  },
  color: {
    name: "Камуфляж седины",
    price: 1700,
    duration: 45
  }
};

const masters = {
  any: "Любой мастер",
  kirill: "Кирилл",
  alexey: "Алексей",
  mark: "Марк"
};

// ЭЛЕМЕНТЫ СТРАНИЦЫ

const menuToggle = document.querySelector("#menuToggle");
const mainNav = document.querySelector("#mainNav");

const bookingSection = document.querySelector("#booking");
const bookingForm = document.querySelector("#bookingForm");

const serviceSelect = document.querySelector("#serviceSelect");
const masterSelect = document.querySelector("#masterSelect");
const dateInput = document.querySelector("#visitDate");
const timeInput = document.querySelector("#visitTime");

const nameInput = document.querySelector("#clientName");
const contactInput = document.querySelector("#clientContact");

const priceOutput = document.querySelector("#priceOutput");
const durationOutput = document.querySelector("#durationOutput");

const bookingResult = document.querySelector("#bookingResult");
const resultText = document.querySelector("#resultText");

const copyButton = document.querySelector("#copyButton");
const copyStatus = document.querySelector("#copyStatus");

// ФОРМАТИРОВАНИЕ ДЕНЕГ

function formatPrice(price) {
  return new Intl.NumberFormat("ru-RU").format(price) + " ₽";
}

// МОБИЛЬНОЕ МЕНЮ

menuToggle.addEventListener("click", function() {
  const isOpen = mainNav.classList.toggle("is-open");

  menuToggle.setAttribute(
    "aria-expanded",
    String(isOpen)
  );

  menuToggle.querySelector("span").textContent =
    isOpen ? "✕" : "☰";
});

mainNav.querySelectorAll("a").forEach(function(link) {
  link.addEventListener("click", function() {
    mainNav.classList.remove("is-open");

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.querySelector("span").textContent = "☰";
  });
});

// СБРОС ПРЕДЫДУЩЕГО РЕЗУЛЬТАТА

function hideResult() {
  bookingResult.hidden = true;
  copyStatus.textContent = "";
}

// ДИНАМИЧЕСКАЯ ЦЕНА

function updatePrice() {
  const selectedService = services[serviceSelect.value];

  if (!selectedService) {
    priceOutput.textContent = "—";
    durationOutput.textContent = "";
    return;
  }

  priceOutput.textContent =
    formatPrice(selectedService.price);

  durationOutput.textContent =
    "Продолжительность: " +
    selectedService.duration +
    " минут";
}

// ВЫБОР УСЛУГИ ИЗ СПИСКА

document.querySelectorAll("[data-service]")
  .forEach(function(button) {

    button.addEventListener("click", function() {
      const serviceKey = button.dataset.service;

      if (!services[serviceKey]) return;

      serviceSelect.value = serviceKey;

      updatePrice();
      hideResult();

      bookingSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });

  });

// ВЫБОР МАСТЕРА ИЗ КАРТОЧКИ

document.querySelectorAll("[data-master]")
  .forEach(function(button) {

    button.addEventListener("click", function() {
      const masterKey = button.dataset.master;

      if (!masters[masterKey]) return;

      masterSelect.value = masterKey;
      hideResult();

      bookingSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });

  });

// СЕГОДНЯШНЯЯ ДАТА ПО МЕСТНОМУ ВРЕМЕНИ

function getTodayISO() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

dateInput.min = getTodayISO();

// ОЧИСТКА ОШИБОК ВВОДА

contactInput.addEventListener("input", function() {
  contactInput.setCustomValidity("");
  hideResult();
});

dateInput.addEventListener("input", function() {
  dateInput.setCustomValidity("");
  hideResult();
});

[
  serviceSelect,
  masterSelect,
  timeInput,
  nameInput
].forEach(function(element) {
  element.addEventListener("input", function() {
    updatePrice();
    hideResult();
  });
});

// ПРОВЕРКА КОНТАКТА

function isValidContact(value) {
  const contact = value.trim();

  // Telegram-имя: @username
  const telegramName =
    /^@[a-zA-Z][a-zA-Z0-9_]{4,31}$/;

  // Telegram-ссылка
  const telegramLink =
    /^https?:\/\/t\.me\/[a-zA-Z][a-zA-Z0-9_]{4,31}\/?$/;

  if (
    telegramName.test(contact) ||
    telegramLink.test(contact)
  ) {
    return true;
  }

  // Телефон: 10–15 цифр
  const phoneFormat = /^\+?[\d\s()\-]+$/;
  const digits = contact.replace(/\D/g, "");

  return (
    phoneFormat.test(contact) &&
    digits.length >= 10 &&
    digits.length <= 15
  );
}

// ФОРМАТИРОВАНИЕ ДАТЫ

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-");

  return `${day}.${month}.${year}`;
}

// ГЕНЕРАЦИЯ ЗАЯВКИ

bookingForm.addEventListener("submit", function(event) {
  event.preventDefault();

  // Сброс прошлых ошибок
  contactInput.setCustomValidity("");
  dateInput.setCustomValidity("");

  if (!bookingForm.reportValidity()) {
    return;
  }

  const service = services[serviceSelect.value];
  const master = masters[masterSelect.value];

  const date = dateInput.value;
  const time = timeInput.value;

  const name = nameInput.value.trim();
  const contact = contactInput.value.trim();

  if (!service || !master) {
    alert("Выберите услугу и мастера.");
    return;
  }

  if (date < getTodayISO()) {
    dateInput.setCustomValidity(
      "Нельзя выбрать прошедшую дату."
    );

    dateInput.reportValidity();
    return;
  }

  if (name.length < 2) {
    nameInput.focus();
    return;
  }

  if (!isValidContact(contact)) {
    contactInput.setCustomValidity(
      "Введите телефон от 10 цифр или Telegram @username"
    );

    contactInput.reportValidity();
    return;
  }

  const message = [
    "BLADE — ЗАПРОС НА ЗАПИСЬ (ДЕМО)",
    "",
    `Имя: ${name}`,
    `Контакт: ${contact}`,
    "",
    `Услуга: ${service.name}`,
    `Мастер: ${master}`,
    `Желаемая дата: ${formatDate(date)}`,
    `Желаемое время: ${time}`,
    `Продолжительность: ${service.duration} мин.`,
    `Стоимость: ${formatPrice(service.price)}`,
    "",
    "Это демонстрационный запрос.",
    "Время не забронировано.",
    "Доступность требует подтверждения."
  ].join("\n");

  resultText.value = message;
  bookingResult.hidden = false;

  copyStatus.textContent =
    "Заявка подготовлена. Данные никуда не отправлены.";

  bookingResult.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
});

// КОПИРОВАНИЕ ЗАЯВКИ

copyButton.addEventListener("click", async function() {
  try {
    await navigator.clipboard.writeText(
      resultText.value
    );

    copyStatus.textContent =
      "Заявка скопирована!";
  } catch (error) {
    resultText.focus();
    resultText.select();

    copyStatus.textContent =
      "Нажмите Ctrl + C для копирования.";
  }
});

// ПЕРВЫЙ РАСЧЁТ

updatePrice();
