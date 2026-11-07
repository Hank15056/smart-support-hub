// Smart Support Hub — страница «Внедрения»

let deployments = loadData(KEYS.deployments, startDeployments);

const deploymentTable = document.querySelector("#deploymentTable");
const deploymentError = document.querySelector("#deploymentError");

function makeProgress(done, total) {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  const wrap = document.createElement("div");
  wrap.className = "progress";

  const track = document.createElement("div");
  track.className = "progress-track";
  const bar = document.createElement("div");
  bar.className = "progress-bar" + (percent === 100 ? " full" : "");
  bar.style.width = percent + "%";
  track.append(bar);

  const text = document.createElement("span");
  text.textContent = `${percent}% (${done}/${total})`;

  wrap.append(track, text);
  return wrap;
}

function renderDeployments() {
  deploymentTable.innerHTML = "";

  deployments.forEach(item => {
    const row = document.createElement("tr");

    let action = "";
    if (item.done < item.total) {
      action = document.createElement("button");
      action.type = "button";
      action.className = "btn ghost small";
      action.textContent = "+ задача";
      action.addEventListener("click", () => completeTask(item.id));
    }

    row.append(
      makeCell(item.id),
      makeCell(item.client),
      makeCell(item.product),
      makeCell(item.version),
      makeCell(makeBadge(item.stage, labels.stage[item.stage])),
      makeCell(item.owner),
      makeCell(formatDate(item.plannedDate)),
      makeCell(makeProgress(item.done, item.total)),
      makeCell(action)
    );
    deploymentTable.append(row);
  });
}

// Отметить выполненную задачу; когда все задачи готовы — внедрение переходит в эксплуатацию
function completeTask(id) {
  const item = deployments.find(deployment => deployment.id === id);
  item.done = Math.min(item.done + 1, item.total);
  if (item.done === item.total) item.stage = "production";
  saveData(KEYS.deployments, deployments);
  renderDeployments();
}

document.querySelector("#deploymentForm").addEventListener("submit", event => {
  event.preventDefault();

  const client = document.querySelector("#client").value.trim();
  const product = document.querySelector("#product").value.trim();
  const version = document.querySelector("#version").value.trim() || "v1.0.0";
  const stage = document.querySelector("#stage").value;
  const owner = document.querySelector("#owner").value.trim();
  const plannedDate = document.querySelector("#plannedDate").value;
  const done = Number(document.querySelector("#done").value);
  const total = Number(document.querySelector("#total").value);

  deploymentError.className = "form-error";
  if (client === "" || product === "" || owner === "") {
    deploymentError.textContent = "Заполните поля «Заказчик», «Продукт» и «Ответственный».";
    return;
  }
  if (!/^v\d+\.\d+\.\d+$/.test(version)) {
    deploymentError.textContent = "Версия должна быть в формате v1.2.3.";
    return;
  }
  if (!Number.isInteger(total) || total < 1 || !Number.isInteger(done) || done < 0 || done > total) {
    deploymentError.textContent = "Число выполненных задач должно быть от 0 до общего количества.";
    return;
  }

  const id = nextId(deployments, "DEP", 2);
  deployments.push({ id, client, product, version, stage, owner, plannedDate, done, total });
  saveData(KEYS.deployments, deployments);
  renderDeployments();

  event.target.reset();
  deploymentError.className = "form-error form-ok";
  deploymentError.textContent = `Внедрение ${id} добавлено.`;
});

renderDeployments();
