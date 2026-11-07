// Smart Support Hub — страница «Релизы»

let releases = loadData(KEYS.releases, startReleases);

const releaseList = document.querySelector("#releaseList");
const levelSelect = document.querySelector("#releaseLevel");
const nextVersionEl = document.querySelector("#nextVersion");
const releaseError = document.querySelector("#releaseError");
const dateInput = document.querySelector("#releaseDate");

function todayString() {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${m}-${d}`;
}

function updateNextVersion() {
  nextVersionEl.textContent = getNextVersion(getCurrentVersion(releases), levelSelect.value);
}

function renderReleases() {
  releaseList.innerHTML = "";

  [...releases]
    .sort((a, b) => compareVersions(b.version, a.version))
    .forEach(item => {
      const card = document.createElement("article");
      card.className = "release";

      const head = document.createElement("div");
      head.className = "release-head";
      const title = document.createElement("h3");
      title.textContent = item.version;
      const date = document.createElement("span");
      date.className = "muted";
      date.textContent = formatDate(item.date);
      head.append(title, makeBadge(item.level, item.level), date);

      const list = document.createElement("ul");
      item.changes.forEach(change => {
        const li = document.createElement("li");
        li.textContent = change;
        list.append(li);
      });

      card.append(head, list);
      releaseList.append(card);
    });

  updateNextVersion();
  const versionEl = document.querySelector("#currentVersion");
  if (versionEl) versionEl.textContent = getCurrentVersion(releases);
}

levelSelect.addEventListener("change", updateNextVersion);
dateInput.value = todayString();

document.querySelector("#releaseForm").addEventListener("submit", event => {
  event.preventDefault();

  const changes = document.querySelector("#releaseChanges").value
    .split("\n")
    .map(line => line.trim())
    .filter(line => line !== "");

  releaseError.className = "form-error";
  if (changes.length === 0) {
    releaseError.textContent = "Ошибка: укажите хотя бы одно изменение. Релиз не создан.";
    return;
  }

  const level = levelSelect.value;
  const version = getNextVersion(getCurrentVersion(releases), level);
  const id = nextId(releases, "REL", 3);

  releases.push({ id, version, date: dateInput.value || todayString(), level, changes });
  saveData(KEYS.releases, releases);
  renderReleases();

  event.target.reset();
  dateInput.value = todayString();
  updateNextVersion();
  releaseError.className = "form-error form-ok";
  releaseError.textContent = `Выпущена версия ${version}.`;
});

renderReleases();
