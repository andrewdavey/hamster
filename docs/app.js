"use strict";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

const STORAGE_KEY = "hamsterLastFed";

function toDateString(date) {
  // Returns YYYY-MM-DD in local time
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysBetween(dateStrA, dateStrB) {
  const a = new Date(dateStrA + "T00:00:00");
  const b = new Date(dateStrB + "T00:00:00");
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function formatDisplay(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function updateUI() {
  const today = toDateString(new Date());
  const lastFed = localStorage.getItem(STORAGE_KEY);

  document.getElementById("today-date").textContent = formatDisplay(today);

  const statusCard = document.getElementById("status-card");
  const statusIcon = document.getElementById("status-icon");
  const statusHeading = document.getElementById("status-heading");
  const statusDetail = document.getElementById("status-detail");
  const feedBtn = document.getElementById("feed-btn");
  const lastFedCard = document.getElementById("last-fed-card");
  const lastFedDate = document.getElementById("last-fed-date");

  if (!lastFed) {
    // No record yet
    statusCard.className = "card status-unknown";
    statusIcon.textContent = "❓";
    statusHeading.textContent = "No feeding recorded yet";
    statusDetail.textContent =
      "Record when the hamster was last fed to get started.";
    feedBtn.textContent = "Record fed today";
    feedBtn.style.display = "block";
    lastFedCard.style.display = "none";
    return;
  }

  const daysSince = daysBetween(lastFed, today);
  lastFedCard.style.display = "block";
  lastFedDate.textContent = formatDisplay(lastFed);

  if (daysSince >= 2) {
    // Needs feeding today
    statusCard.className = "card status-hungry";
    statusIcon.textContent = "🍽️";
    statusHeading.textContent = "Feeding day!";
    if (daysSince === 2) {
      statusDetail.textContent = "The hamster is due a feed today.";
    } else {
      statusDetail.textContent = `Overdue! Last fed ${daysSince} days ago.`;
    }
    feedBtn.textContent = "Record feeding now";
    feedBtn.style.display = "block";
  } else {
    // Fed recently, next feeding is in (2 - daysSince) days
    statusCard.className = "card status-fed";
    statusIcon.textContent = "✅";
    const nextFedDate = new Date(lastFed + "T00:00:00");
    nextFedDate.setDate(nextFedDate.getDate() + 2);
    const nextFedStr = toDateString(nextFedDate);
    if (daysSince === 0) {
      statusHeading.textContent = "Fed today!";
      statusDetail.textContent = `Next feeding: ${formatDisplay(nextFedStr)}`;
    } else {
      statusHeading.textContent = "Not needed today";
      statusDetail.textContent = `Next feeding: ${formatDisplay(nextFedStr)}`;
    }
    feedBtn.style.display = "none";
  }
}

function recordFeeding() {
  const today = toDateString(new Date());
  localStorage.setItem(STORAGE_KEY, today);
  updateUI();
}

window.addEventListener("DOMContentLoaded", updateUI);
