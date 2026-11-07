// Smart Support Hub — хранение данных, общие настройки и функции.
// Подключается на всех страницах после data.js.

const KEYS = {
  deployments: "ssh_deployments",
  incidents: "ssh_incidents",
  requests: "ssh_requests",
  releases: "ssh_releases",
  theme: "ssh_theme"
};

// ---------- localStorage ----------

function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Не удалось сохранить данные:", error);
  }
}

function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return JSON.parse(JSON.stringify(fallback));
    return JSON.parse(raw);
  } catch {
    return JSON.parse(JSON.stringify(fallback));
  }
}

// ---------- SLA ----------

const settings = {
  slaHours: {
    critical: 4,
    high: 8,
    medium: 24,
    low: 72
  }
};

function getDeadline(incident, settings) {
  const hours = settings.slaHours[incident.priority];
  return new Date(incident.createdAt).getTime() + hours * 60 * 60 * 1000;
}

function getSlaState(incident, settings, now = Date.now()) {
  const deadline = getDeadline(incident, settings);
  if (incident.status === "resolved") {
    const resolved = new Date(incident.resolvedAt).getTime();
    return resolved <= deadline ? "met" : "breached";
  }
  return now > deadline ? "breached" : "on_track";
}

function getSlaPercent(incidents, settings) {
  const resolved = incidents.filter(item => item.status === "resolved");
  if (resolved.length === 0) return 100;
  const met = resolved.filter(item => getSlaState(item, settings) === "met");
  return Math.round((met.length / resolved.length) * 100);
}

// ---------- Версии ----------

function getNextVersion(current, level) {
  const parts = current.replace("v", "").split(".").map(Number);
  if (level === "major") return `v${parts[0] + 1}.0.0`;
  if (level === "minor") return `v${parts[0]}.${parts[1] + 1}.0`;
  return `v${parts[0]}.${parts[1]}.${parts[2] + 1}`;
}

function compareVersions(a, b) {
  const pa = a.replace("v", "").split(".").map(Number);
  const pb = b.replace("v", "").split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

function getCurrentVersion(releases) {
  if (releases.length === 0) return "v1.0.0";
  return releases
    .map(item => item.version)
    .sort(compareVersions)
    .pop();
}

// ---------- Подписи на русском ----------

const labels = {
  stage: {
    planning: "Планирование",
    setup: "Установка и настройка",
    training: "Обучение",
    production: "Эксплуатация"
  },
  priority: {
    critical: "Критический",
    high: "Высокий",
    medium: "Средний",
    low: "Низкий"
  },
  incidentStatus: {
    new: "Новый",
    in_progress: "В работе",
    resolved: "Решён"
  },
  sla: {
    on_track: "В срок",
    breached: "Нарушен",
    met: "Решён вовремя"
  },
  requestType: {
    corrective: "Корректирующее",
    adaptive: "Адаптивное",
    perfective: "Совершенствующее",
    preventive: "Профилактическое"
  },
  requestStatus: {
    new: "Новая",
    planned: "Запланирована",
    done: "Выполнена"
  },
  level: {
    patch: "patch — исправления",
    minor: "minor — новые возможности",
    major: "major — несовместимые изменения"
  }
};

// Цвет метки для каждого значения
const badgeColors = {
  critical: "red", high: "yellow", medium: "blue", low: "green",
  new: "blue", in_progress: "yellow", resolved: "green",
  on_track: "green", breached: "red", met: "green",
  planning: "purple", setup: "yellow", training: "blue", production: "green",
  corrective: "red", adaptive: "blue", perfective: "green", preventive: "purple",
  planned: "yellow", done: "green",
  patch: "green", minor: "blue", major: "red"
};

// ---------- Помощники для вывода ----------

function makeBadge(value, text) {
  const span = document.createElement("span");
  span.className = "badge " + (badgeColors[value] || "");
  span.textContent = text;
  return span;
}

function makeCell(content) {
  const cell = document.createElement("td");
  if (content instanceof Node) {
    cell.append(content);
  } else {
    cell.textContent = content;
  }
  return cell;
}

function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

function formatDate(dateString) {
  if (!dateString) return "—";
  const [y, m, d] = dateString.split("-");
  return `${d}.${m}.${y}`;
}

function nextId(list, prefix, digits) {
  const max = list.reduce((acc, item) => {
    const num = parseInt(String(item.id).split("-")[1], 10);
    return Number.isNaN(num) ? acc : Math.max(acc, num);
  }, 0);
  return prefix + "-" + String(max + 1).padStart(digits, "0");
}

// ---------- Общий каркас страницы ----------

function applyTheme(theme) {
  document.body.classList.toggle("light", theme === "light");
}

function initLayout() {
  // Тема: сохранённый выбор
  let savedTheme = null;
  try { savedTheme = localStorage.getItem(KEYS.theme); } catch { savedTheme = null; }
  applyTheme(savedTheme);

  const themeButton = document.querySelector("#themeButton");
  if (themeButton) {
    themeButton.addEventListener("click", () => {
      const theme = document.body.classList.contains("light") ? "dark" : "light";
      applyTheme(theme);
      try { localStorage.setItem(KEYS.theme, theme); } catch { /* без сохранения */ }
      document.dispatchEvent(new CustomEvent("themechange"));
    });
  }

  // Активный пункт меню
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a").forEach(link => {
    if (link.getAttribute("href") === page) link.classList.add("active");
  });

  // Текущая версия продукта в Topbar
  const versionEl = document.querySelector("#currentVersion");
  if (versionEl) {
    versionEl.textContent = getCurrentVersion(loadData(KEYS.releases, startReleases));
  }

  // Сброс к учебным данным
  const resetButton = document.querySelector("#resetButton");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      if (!confirm("Вернуть учебные данные? Все изменения будут удалены.")) return;
      [KEYS.deployments, KEYS.incidents, KEYS.requests, KEYS.releases].forEach(key => {
        try { localStorage.removeItem(key); } catch { /* нет доступа */ }
      });
      location.reload();
    });
  }
}

document.addEventListener("DOMContentLoaded", initLayout);
