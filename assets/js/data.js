// Smart Support Hub — начальные (учебные) данные.
// Все организации и люди вымышленные.

// Время создания открытых инцидентов считается от текущего момента,
// чтобы при первом запуске были видны разные состояния SLA.
function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

const startDeployments = [
  {
    id: "DEP-01",
    client: "Колледж, учебная часть",
    product: "Система расписания",
    version: "v1.2.0",
    stage: "training",
    owner: "Иванов А.",
    plannedDate: "2026-11-20",
    done: 2,
    total: 3
  },
  {
    id: "DEP-02",
    client: "Городская библиотека №3",
    product: "Электронный каталог",
    version: "v1.2.1",
    stage: "setup",
    owner: "Ким Д.",
    plannedDate: "2026-11-28",
    done: 3,
    total: 8
  },
  {
    id: "DEP-03",
    client: "Поликлиника «Здоровье»",
    product: "Электронная очередь",
    version: "v1.1.0",
    stage: "production",
    owner: "Сатыбалдиева Н.",
    plannedDate: "2026-10-15",
    done: 6,
    total: 6
  },
  {
    id: "DEP-04",
    client: "Магазин «Техномир»",
    product: "Учёт склада",
    version: "v1.2.1",
    stage: "planning",
    owner: "Петров С.",
    plannedDate: "2026-12-10",
    done: 0,
    total: 5
  }
];

const startIncidents = [
  {
    id: "INC-001",
    title: "Не открывается отчёт по успеваемости",
    priority: "high",
    status: "in_progress",
    createdAt: hoursAgo(5),
    resolvedAt: null
  },
  {
    id: "INC-002",
    title: "Ошибка входа у преподавателя",
    priority: "critical",
    status: "new",
    createdAt: hoursAgo(6),
    resolvedAt: null
  },
  {
    id: "INC-003",
    title: "Медленно загружается расписание",
    priority: "medium",
    status: "in_progress",
    createdAt: hoursAgo(10),
    resolvedAt: null
  },
  {
    id: "INC-004",
    title: "Не печатается ведомость",
    priority: "low",
    status: "new",
    createdAt: hoursAgo(30),
    resolvedAt: null
  },
  {
    id: "INC-005",
    title: "Неверная дата в карточке читателя",
    priority: "high",
    status: "resolved",
    createdAt: hoursAgo(30),
    resolvedAt: hoursAgo(24)
  },
  {
    id: "INC-006",
    title: "Сбой синхронизации каталога",
    priority: "critical",
    status: "resolved",
    createdAt: hoursAgo(50),
    resolvedAt: hoursAgo(40)
  },
  {
    id: "INC-007",
    title: "Не сохраняется фото профиля",
    priority: "medium",
    status: "resolved",
    createdAt: hoursAgo(80),
    resolvedAt: hoursAgo(70)
  },
  {
    id: "INC-008",
    title: "Опечатка в меню настроек",
    priority: "low",
    status: "resolved",
    createdAt: hoursAgo(100),
    resolvedAt: hoursAgo(60)
  }
];

const startRequests = [
  {
    id: "REQ-001",
    title: "Добавить экспорт отчёта в PDF",
    type: "perfective",
    status: "planned",
    targetVersion: "v1.3.0"
  },
  {
    id: "REQ-002",
    title: "Исправить расчёт среднего балла",
    type: "corrective",
    status: "done",
    targetVersion: "v1.2.1"
  },
  {
    id: "REQ-003",
    title: "Поддержка новой версии браузера",
    type: "adaptive",
    status: "new",
    targetVersion: "v1.3.0"
  },
  {
    id: "REQ-004",
    title: "Обновить устаревшую библиотеку графиков",
    type: "preventive",
    status: "planned",
    targetVersion: "v1.3.0"
  }
];

const startReleases = [
  {
    id: "REL-001",
    version: "v1.2.0",
    date: "2026-10-20",
    level: "minor",
    changes: [
      "Добавлен модуль электронной очереди",
      "Новый отчёт по посещаемости"
    ]
  },
  {
    id: "REL-002",
    version: "v1.2.1",
    date: "2026-11-05",
    level: "patch",
    changes: [
      "Исправлено открытие отчёта",
      "Исправлен расчёт среднего балла",
      "Обновлено руководство пользователя"
    ]
  }
];
