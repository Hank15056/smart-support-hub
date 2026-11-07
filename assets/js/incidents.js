// Smart Support Hub — страница «Инциденты»

let incidents = loadData(KEYS.incidents, startIncidents);

const tbody = document.querySelector("#incidentTable");
const statusFilter = document.querySelector("#statusFilter");
const errorBox = document.querySelector("#incidentError");

function getFilteredIncidents() {
  const value = statusFilter.value;
  return value === "all"
    ? incidents
    : incidents.filter(item => item.status === value);
}

function makeActionButton(text, handler) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn ghost small";
  button.textContent = text;
  button.addEventListener("click", handler);
  return button;
}

function renderIncidents(list) {
  tbody.innerHTML = "";

  // Сначала новые записи
  const sorted = [...list].sort((a, b) => b.id.localeCompare(a.id));

  sorted.forEach(item => {
    const row = document.createElement("tr");
    const slaState = getSlaState(item, settings);

    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "6px";
    if (item.status === "new") {
      actions.append(makeActionButton("В работу", () => startIncident(item.id)));
    }
    if (item.status !== "resolved") {
      actions.append(makeActionButton("Решить", () => resolveIncident(item.id)));
    } else {
      actions.append(document.createTextNode(formatDateTime(item.resolvedAt)));
    }

    row.append(
      makeCell(item.id),
      makeCell(item.title),
      makeCell(makeBadge(item.priority, labels.priority[item.priority])),
      makeCell(makeBadge(item.status, labels.incidentStatus[item.status])),
      makeCell(formatDateTime(item.createdAt)),
      makeCell(formatDateTime(new Date(getDeadline(item, settings)).toISOString())),
      makeCell(makeBadge(slaState, labels.sla[slaState])),
      makeCell(actions)
    );
    tbody.append(row);
  });

  const open = incidents.filter(item => item.status !== "resolved").length;
  document.querySelector("#incidentCount").textContent =
    `Показано: ${list.length} из ${incidents.length}. Открытых: ${open}. ` +
    `SLA выполнен: ${getSlaPercent(incidents, settings)}%.`;
}

function refresh() {
  saveData(KEYS.incidents, incidents);
  renderIncidents(getFilteredIncidents());
}

function startIncident(id) {
  const item = incidents.find(incident => incident.id === id);
  item.status = "in_progress";
  refresh();
}

function resolveIncident(id) {
  const item = incidents.find(incident => incident.id === id);
  item.status = "resolved";
  item.resolvedAt = new Date().toISOString();
  refresh();
}

document.querySelector("#incidentForm").addEventListener("submit", event => {
  event.preventDefault();
  const title = document.querySelector("#title").value.trim();
  const priority = document.querySelector("#priority").value;

  if (title === "") {
    errorBox.className = "form-error";
    errorBox.textContent = "Ошибка: введите описание инцидента. Запись не создана.";
    document.querySelector("#title").focus();
    return;
  }

  const id = nextId(incidents, "INC", 3);
  incidents.push({
    id: id,
    title: title,
    priority: priority,
    status: "new",
    createdAt: new Date().toISOString(),
    resolvedAt: null
  });

  refresh();
  event.target.reset();
  errorBox.className = "form-error form-ok";
  errorBox.textContent = `Инцидент ${id} создан. Срок SLA: ${settings.slaHours[priority]} ч.`;
});

statusFilter.addEventListener("change", () => {
  renderIncidents(getFilteredIncidents());
});

renderIncidents(incidents);
