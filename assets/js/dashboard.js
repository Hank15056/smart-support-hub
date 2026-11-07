// Smart Support Hub — главная панель: показатели и графики

const dashDeployments = loadData(KEYS.deployments, startDeployments);
const dashIncidents = loadData(KEYS.incidents, startIncidents);
const dashRequests = loadData(KEYS.requests, startRequests);
const dashReleases = loadData(KEYS.releases, startReleases);

// ---------- 4 показателя ----------

document.querySelector("#kpiDeployments").textContent =
  dashDeployments.filter(item => item.done < item.total).length;

document.querySelector("#kpiIncidents").textContent =
  dashIncidents.filter(item => item.status !== "resolved").length;

document.querySelector("#kpiSla").textContent =
  getSlaPercent(dashIncidents, settings) + "%";

document.querySelector("#kpiVersion").textContent =
  getCurrentVersion(dashReleases);

// ---------- Таблица открытых инцидентов ----------

const openTable = document.querySelector("#openIncidentTable");
const openIncidents = dashIncidents.filter(item => item.status !== "resolved");

if (openIncidents.length === 0) {
  const row = document.createElement("tr");
  const cell = makeCell("Открытых инцидентов нет");
  cell.colSpan = 5;
  row.append(cell);
  openTable.append(row);
}

openIncidents.forEach(item => {
  const sla = getSlaState(item, settings);
  const row = document.createElement("tr");
  row.append(
    makeCell(item.id),
    makeCell(item.title),
    makeCell(makeBadge(item.priority, labels.priority[item.priority])),
    makeCell(makeBadge(item.status, labels.incidentStatus[item.status])),
    makeCell(makeBadge(sla, labels.sla[sla]))
  );
  openTable.append(row);
});

// ---------- Графики Chart.js ----------

const levels = ["critical", "high", "medium", "low"];
const types = ["corrective", "adaptive", "perfective", "preventive"];
let charts = [];

function cssVar(name) {
  return getComputedStyle(document.body).getPropertyValue(name).trim();
}

function drawCharts() {
  if (typeof Chart === "undefined") {
    document.querySelectorAll(".chart-box").forEach(box => {
      box.textContent = "Графики не загрузились: нет подключения к интернету (Chart.js подключается через CDN).";
    });
    return;
  }

  charts.forEach(chart => chart.destroy());
  Chart.defaults.color = cssVar("--muted");
  Chart.defaults.borderColor = cssVar("--line");

  const priorityChart = new Chart(document.querySelector("#priorityChart"), {
    type: "bar",
    data: {
      labels: levels.map(level => labels.priority[level]),
      datasets: [{
        label: "Инциденты",
        data: levels.map(level =>
          dashIncidents.filter(item => item.priority === level).length
        ),
        backgroundColor: ["#ef4444", "#f59e0b", cssVar("--accent"), "#22c55e"],
        borderRadius: 6
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });

  const requestChart = new Chart(document.querySelector("#requestChart"), {
    type: "doughnut",
    data: {
      labels: types.map(type => labels.requestType[type]),
      datasets: [{
        label: "Заявки",
        data: types.map(type =>
          dashRequests.filter(item => item.type === type).length
        ),
        backgroundColor: ["#ef4444", cssVar("--accent"), "#22c55e", "#a855f7"],
        borderColor: cssVar("--panel")
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } }
    }
  });

  charts = [priorityChart, requestChart];
}

// Тема применяется в storage.js на DOMContentLoaded — рисуем после неё
document.addEventListener("DOMContentLoaded", drawCharts);
document.addEventListener("themechange", drawCharts);
