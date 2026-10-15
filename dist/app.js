"use strict";

async function loadOffers() {
  const status = document.getElementById("status");
  try {
    const response = await fetch("bonuses.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("Could not load snapshot");
    const snapshot = await response.json();
    if (!Array.isArray(snapshot.casinos) || snapshot.casinos.length !== 3) throw new Error("Invalid snapshot");
    const date = new Date(snapshot.fetched_at);
    if (!Number.isFinite(date.getTime())) throw new Error("Invalid timestamp");
    const rows = document.createDocumentFragment();
    snapshot.casinos.forEach((casino, index) => {
      const url = new URL(casino.source_url);
      if (url.protocol !== "https:" || url.hostname !== "www.bonusreviewers.com") throw new Error("Invalid source URL");
      if (![casino.casino, casino.welcome_bonus, casino.minimum_deposit].every(value => typeof value === "string" && value.length > 0) || typeof casino.wagering_requirement !== "number" || !Number.isFinite(casino.wagering_requirement) || casino.wagering_requirement < 0) throw new Error("Invalid offer");
      const row = document.createElement("tr");
      function cell(label, value) {
        const td = document.createElement("td");
        td.dataset.label = label;
        td.textContent = value;
        row.append(td);
        return td;
      }
      const name = cell("Casino", casino.casino);
      const rank = document.createElement("span");
      rank.className = "rank";
      rank.textContent = String(index + 1).padStart(2, "0");
      name.prepend(rank);
      cell("Welcome bonus", casino.welcome_bonus);
      const wagering = cell("Wagering", "");
      const badge = document.createElement("span");
      badge.className = "multiplier";
      badge.textContent = `${casino.wagering_requirement}×`;
      wagering.append(badge);
      cell("Min. deposit", casino.minimum_deposit);
      const source = cell("Source", "");
      const link = document.createElement("a");
      link.href = url.href;
      link.className = "source-link";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "View source ↗";
      link.setAttribute("aria-label", `View source for ${casino.casino}`);
      source.append(link);
      rows.append(row);
    });
    document.getElementById("offers").replaceChildren(rows);
    status.textContent = `3 casinos · Source: ${snapshot.source_name} · Retrieved ${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(date)} UTC`;
    document.getElementById("table-container").hidden = false;
  } catch {
    status.classList.add("error");
    status.textContent = "The saved snapshot could not be loaded. Please refresh or try again later.";
    document.getElementById("table-container").hidden = true;
  }
}

loadOffers();
