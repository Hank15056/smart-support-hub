// Smart Support Hub — страница «Заявки на изменения»

let requests = loadData(KEYS.requests, startRequests);
const currentVersion = getCurrentVersion(loadData(KEYS.releases, startReleases));

const requestTable = document.querySelector("#requestTable");
const requestError = document.querySelector("#requestError");
const targetInput = document.querySelector("#targetVersion");

// Корректирующие заявки обычно идут в patch, остальные — в minor
function suggestTarget(type) {
  return getNextVersion(currentVersion, type === "corrective" ? "patch" : "minor");
}

const statusOrder = ["new", "planned", "done"];
const nextStatusText = { new: "Запланировать", planned: "Выполнено" };

function renderRequests() {
  requestTable.innerHTML = "";

  [...requests].sort((a, b) => b.id.localeCompare(a.id)).forEach(item => {
    const row = document.createElement("tr");

    let action = "";
    if (item.status !== "done") {
      action = document.createElement("button");
      action.type = "button";
      action.className = "btn ghost small";
      action.textContent = nextStatusText[item.status];
      action.addEventListener("click", () => advanceRequest(item.id));
    }

    row.append(
      makeCell(item.id),
      makeCell(item.title),
      makeCell(makeBadge(item.type, labels.requestType[item.type])),
      makeCell(makeBadge(item.status, labels.requestStatus[item.status])),
      makeCell(item.targetVersion),
      makeCell(action)
    );
    requestTable.append(row);
  });
}

function advanceRequest(id) {
  const item = requests.find(request => request.id === id);
  const index = statusOrder.indexOf(item.status);
  item.status = statusOrder[Math.min(index + 1, statusOrder.length - 1)];
  saveData(KEYS.requests, requests);
  renderRequests();
}

const typeSelect = document.querySelector("#requestType");
targetInput.value = suggestTarget(typeSelect.value);
typeSelect.addEventListener("change", () => {
  targetInput.value = suggestTarget(typeSelect.value);
});

document.querySelector("#requestForm").addEventListener("submit", event => {
  event.preventDefault();

  const title = document.querySelector("#requestTitle").value.trim();
  const type = typeSelect.value;
  const targetVersion = targetInput.value.trim();

  requestError.className = "form-error";
  if (title === "") {
    requestError.textContent = "Ошибка: опишите, что нужно сделать. Заявка не создана.";
    return;
  }
  if (!/^v\d+\.\d+\.\d+$/.test(targetVersion)) {
    requestError.textContent = "Целевая версия должна быть в формате v1.2.3.";
    return;
  }

  const id = nextId(requests, "REQ", 3);
  requests.push({ id, title, type, status: "new", targetVersion });
  saveData(KEYS.requests, requests);
  renderRequests();

  event.target.reset();
  targetInput.value = suggestTarget(typeSelect.value);
  requestError.className = "form-error form-ok";
  requestError.textContent = `Заявка ${id} создана (${labels.requestType[type].toLowerCase()} сопровождение).`;
});

renderRequests();
