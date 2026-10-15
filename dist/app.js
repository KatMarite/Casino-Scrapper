"use strict";

let allCasinos = [];
let currentView = "cards"; // default view

function getInitials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0])
    .join("")
    .toUpperCase();
}

function renderTable(casinos) {
  const tbody = document.getElementById("offers");
  tbody.replaceChildren();

  if (casinos.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 6;
    td.style.textAlign = "center";
    td.style.padding = "32px";
    td.style.color = "var(--text-muted)";
    td.textContent = "No matching casino offers found.";
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  const minWagering = Math.min(...allCasinos.map(c => c.wagering_requirement));

  casinos.forEach((item, index) => {
    const tr = document.createElement("tr");

    // Rank
    const tdRank = document.createElement("td");
    tdRank.className = "td-rank-num";
    tdRank.textContent = String(index + 1).padStart(2, "0");
    tr.appendChild(tdRank);

    // Casino Name
    const tdCasino = document.createElement("td");
    tdCasino.className = "td-casino-name";
    tdCasino.textContent = item.casino;
    tr.appendChild(tdCasino);

    // Welcome Bonus
    const tdBonus = document.createElement("td");
    tdBonus.className = "td-bonus-text";
    tdBonus.textContent = item.welcome_bonus;
    tr.appendChild(tdBonus);

    // Wagering
    const tdWagering = document.createElement("td");
    const badge = document.createElement("span");
    const isBest = item.wagering_requirement === minWagering;
    badge.className = `wagering-badge ${isBest ? "wagering-badge-best" : "wagering-badge-standard"}`;
    badge.textContent = `${item.wagering_requirement}×${isBest ? " (Best)" : ""}`;
    tdWagering.appendChild(badge);
    tr.appendChild(tdWagering);

    // Min Deposit
    const tdDeposit = document.createElement("td");
    const chip = document.createElement("span");
    chip.className = "deposit-chip";
    chip.textContent = item.minimum_deposit;
    tdDeposit.appendChild(chip);
    tr.appendChild(tdDeposit);

    // Source link
    const tdSource = document.createElement("td");
    const link = document.createElement("a");
    link.href = item.source_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "table-source-link";
    link.innerHTML = `Verify terms <span aria-hidden="true">↗</span>`;
    link.setAttribute("aria-label", `Verify terms for ${item.casino}`);
    tdSource.appendChild(link);
    tr.appendChild(tdSource);

    tbody.appendChild(tr);
  });
}

function renderCards(casinos) {
  const container = document.getElementById("cards-container");
  container.replaceChildren();

  if (casinos.length === 0) {
    const emptyDiv = document.createElement("div");
    emptyDiv.style.gridColumn = "1 / -1";
    emptyDiv.style.textAlign = "center";
    emptyDiv.style.padding = "48px 24px";
    emptyDiv.style.color = "var(--text-muted)";
    emptyDiv.textContent = "No matching casino offers found.";
    container.appendChild(emptyDiv);
    return;
  }

  const minWagering = Math.min(...allCasinos.map(c => c.wagering_requirement));

  casinos.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "casino-card";

    const isBestWagering = item.wagering_requirement === minWagering;
    const highlightBadge = document.createElement("span");
    highlightBadge.className = `card-highlight-badge ${isBestWagering ? "card-highlight-best" : "card-highlight-standard"}`;
    highlightBadge.textContent = isBestWagering ? "⚡ LOWEST WAGERING" : "VERIFIED OFFER";
    card.appendChild(highlightBadge);

    // Card Header
    const header = document.createElement("div");
    header.className = "card-header";

    const avatar = document.createElement("div");
    avatar.className = "card-avatar";
    avatar.textContent = getInitials(item.casino);

    const titleGroup = document.createElement("div");
    titleGroup.className = "card-title-group";

    const rank = document.createElement("span");
    rank.className = "card-rank";
    rank.textContent = `RANK #${String(index + 1).padStart(2, "0")}`;

    const title = document.createElement("h3");
    title.className = "card-casino-name";
    title.textContent = item.casino;

    titleGroup.appendChild(rank);
    titleGroup.appendChild(title);
    header.appendChild(avatar);
    header.appendChild(titleGroup);
    card.appendChild(header);

    // Bonus Box
    const bonusBox = document.createElement("div");
    bonusBox.className = "card-bonus-box";

    const bonusLabel = document.createElement("div");
    bonusLabel.className = "card-bonus-label";
    bonusLabel.textContent = "WELCOME PROMOTION";

    const bonusVal = document.createElement("div");
    bonusVal.className = "card-bonus-value";
    bonusVal.textContent = item.welcome_bonus;

    bonusBox.appendChild(bonusLabel);
    bonusBox.appendChild(bonusVal);
    card.appendChild(bonusBox);

    // Metrics Row
    const metricsGrid = document.createElement("div");
    metricsGrid.className = "card-metrics";

    // Metric 1: Wagering
    const tile1 = document.createElement("div");
    tile1.className = "card-metric-tile";
    const lbl1 = document.createElement("div");
    lbl1.className = "metric-tile-label";
    lbl1.textContent = "WAGERING";
    const val1 = document.createElement("div");
    val1.className = `metric-tile-val ${isBestWagering ? "metric-val-emerald" : ""}`;
    val1.textContent = `${item.wagering_requirement}×`;
    tile1.appendChild(lbl1);
    tile1.appendChild(val1);

    // Metric 2: Min Deposit
    const tile2 = document.createElement("div");
    tile2.className = "card-metric-tile";
    const lbl2 = document.createElement("div");
    lbl2.className = "metric-tile-label";
    lbl2.textContent = "MIN. DEPOSIT";
    const val2 = document.createElement("div");
    val2.className = "metric-tile-val";
    val2.textContent = item.minimum_deposit;
    tile2.appendChild(lbl2);
    tile2.appendChild(val2);

    metricsGrid.appendChild(tile1);
    metricsGrid.appendChild(tile2);
    card.appendChild(metricsGrid);

    // CTA
    const actionBtn = document.createElement("a");
    actionBtn.className = "card-action-btn";
    actionBtn.href = item.source_url;
    actionBtn.target = "_blank";
    actionBtn.rel = "noopener noreferrer";
    actionBtn.innerHTML = `Inspect Source Terms <span aria-hidden="true">↗</span>`;
    actionBtn.setAttribute("aria-label", `Inspect source terms for ${item.casino}`);
    card.appendChild(actionBtn);

    container.appendChild(card);
  });
}

function updateView() {
  const cardsContainer = document.getElementById("cards-container");
  const tableContainer = document.getElementById("table-container");
  const btnCards = document.getElementById("toggle-cards");
  const btnTable = document.getElementById("toggle-table");

  if (currentView === "cards") {
    cardsContainer.hidden = false;
    tableContainer.hidden = true;
    btnCards.classList.add("active");
    btnCards.setAttribute("aria-pressed", "true");
    btnTable.classList.remove("active");
    btnTable.setAttribute("aria-pressed", "false");
  } else {
    cardsContainer.hidden = true;
    tableContainer.hidden = false;
    btnCards.classList.remove("active");
    btnCards.setAttribute("aria-pressed", "false");
    btnTable.classList.add("active");
    btnTable.setAttribute("aria-pressed", "true");
  }
}

function filterAndSortCasinos() {
  const searchTerm = (document.getElementById("search-input")?.value || "").toLowerCase().trim();
  const sortMode = document.getElementById("sort-select")?.value || "default";

  let filtered = allCasinos.filter(item => {
    return (
      item.casino.toLowerCase().includes(searchTerm) ||
      item.welcome_bonus.toLowerCase().includes(searchTerm) ||
      item.minimum_deposit.toLowerCase().includes(searchTerm) ||
      String(item.wagering_requirement).includes(searchTerm)
    );
  });

  if (sortMode === "wagering-asc") {
    filtered.sort((a, b) => a.wagering_requirement - b.wagering_requirement);
  } else if (sortMode === "wagering-desc") {
    filtered.sort((a, b) => b.wagering_requirement - a.wagering_requirement);
  } else if (sortMode === "name-asc") {
    filtered.sort((a, b) => a.casino.localeCompare(b.casino));
  }

  renderCards(filtered);
  renderTable(filtered);
}

async function loadOffers() {
  const status = document.getElementById("status");
  try {
    const response = await fetch("bonuses.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("Could not load snapshot");

    const snapshot = await response.json();
    if (!Array.isArray(snapshot.casinos) || snapshot.casinos.length !== 3) {
      throw new Error("Invalid snapshot structure");
    }

    const date = new Date(snapshot.fetched_at);
    if (!Number.isFinite(date.getTime())) {
      throw new Error("Invalid timestamp");
    }

    // Strict validation
    snapshot.casinos.forEach(casino => {
      const url = new URL(casino.source_url);
      if (url.protocol !== "https:" || url.hostname !== "www.bonusreviewers.com") {
        throw new Error("Invalid source URL");
      }
      if (
        ![casino.casino, casino.welcome_bonus, casino.minimum_deposit].every(
          val => typeof val === "string" && val.length > 0
        ) ||
        typeof casino.wagering_requirement !== "number" ||
        !Number.isFinite(casino.wagering_requirement) ||
        casino.wagering_requirement < 0
      ) {
        throw new Error("Invalid offer data");
      }
    });

    allCasinos = snapshot.casinos;

    // Render initial views
    renderCards(allCasinos);
    renderTable(allCasinos);
    updateView();

    const formattedDate = new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC"
    }).format(date);

    const modelBadge = snapshot.model ? ` · Model: ${snapshot.model}` : "";
    status.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--emerald);" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>3 casinos verified · Source: <strong>${snapshot.source_name}</strong> · Retrieved ${formattedDate} UTC${modelBadge}</span>
    `;

    // Setup interactive events
    document.getElementById("toggle-cards")?.addEventListener("click", () => {
      currentView = "cards";
      updateView();
    });

    document.getElementById("toggle-table")?.addEventListener("click", () => {
      currentView = "table";
      updateView();
    });

    document.getElementById("search-input")?.addEventListener("input", filterAndSortCasinos);
    document.getElementById("sort-select")?.addEventListener("change", filterAndSortCasinos);

  } catch (err) {
    status.classList.add("error");
    status.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>The verified snapshot could not be loaded. Please ensure <code>bonuses.json</code> is accessible over HTTP.</span>
    `;
    document.getElementById("table-container").hidden = true;
    document.getElementById("cards-container").hidden = true;
  }
}

loadOffers();
