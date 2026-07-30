import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, getDocs, query, orderBy, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---------------------------------------------------------------- data

async function loadExperiences() {
  const list = document.getElementById("experienceList");
  try {
    const q = query(collection(db, "experiences"), orderBy("order"));
    const snap = await getDocs(q);
    if (snap.empty) {
      list.innerHTML = '<p class="empty-note">No experience entries yet.</p>';
      return;
    }
    list.innerHTML = "";
    snap.forEach((docSnap) => {
      const e = docSnap.data();
      const card = document.createElement("div");
      card.className = "experience-card interactive";
      card.innerHTML = `
        <div class="experience-header">
          <span class="experience-role">${escapeHtml(e.role)}</span>
          <span class="experience-time">${escapeHtml(e.timeframe)}</span>
        </div>
        <div class="experience-org">${escapeHtml(e.organization)}</div>
        <p class="experience-desc">${escapeHtml(e.description)}</p>
      `;
      list.appendChild(card);
    });
    bindInteractiveHover(list.querySelectorAll(".interactive"));
    bindCardGlow(list.querySelectorAll(".experience-card"));
  } catch (err) {
    console.error("Failed to load experiences:", err);
    list.innerHTML = '<p class="empty-note">Couldn\u2019t load experience data.</p>';
  }
}

async function loadProjects() {
  const list = document.getElementById("projects");
  try {
    const q = query(collection(db, "projects"), orderBy("order"));
    const snap = await getDocs(q);
    if (snap.empty) {
      list.innerHTML = '<p class="empty-note">No projects yet.</p>';
      return;
    }
    list.innerHTML = "";
    snap.forEach((docSnap) => {
      const p = docSnap.data();
      const card = document.createElement("a");
      card.href = p.url || "#";
      card.target = "_blank";
      card.rel = "noopener";
      card.className = "project-card interactive";
      card.dataset.category = p.category || "Other";
      card.innerHTML = `
        <div class="project-header">
          <span class="project-title">${escapeHtml(p.title)}</span>
          <span class="project-category">${escapeHtml(p.category || "Other")}</span>
        </div>
        <p class="project-desc">${escapeHtml(p.description)}</p>
      `;
      list.appendChild(card);
    });
    bindInteractiveHover(list.querySelectorAll(".interactive"));
    bindCardGlow(list.querySelectorAll(".project-card"));
    bindFilters();
  } catch (err) {
    console.error("Failed to load projects:", err);
    list.innerHTML = '<p class="empty-note">Couldn\u2019t load project data.</p>';
  }
}

async function loadPopup() {
  try {
    const snap = await getDoc(doc(db, "settings", "popup"));
    if (!snap.exists()) return;
    const data = snap.data();
    if (!data.active || !data.text) return;

    const toast = document.getElementById("toast");
    document.getElementById("toastText").textContent = data.text;
    toast.hidden = false;
    setTimeout(() => toast.classList.add("visible"), 600);
  } catch (err) {
    console.error("Failed to load popup:", err);
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// ------------------------------------------------------------- interactions

function bindInteractiveHover(elements) {
  elements.forEach((el) => {
    el.addEventListener("mouseenter", () => document.body.classList.add("hovering"));
    el.addEventListener("mouseleave", () => document.body.classList.remove("hovering"));
  });
}

function bindCardGlow(cards) {
  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    });
  });
}

function bindFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.getAttribute("data-filter");
      projectCards.forEach((card) => {
        if (filter === "all" || card.getAttribute("data-category") === filter) {
          card.style.display = "block";
          card.style.animation = "fadeSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}

// ------------------------------------------------------------------ theme

function initTheme() {
  const themeToggle = document.getElementById("themeToggle");
  function syncIcon() {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    themeToggle.textContent = isLight ? "\u2600\ufe0f" : "\ud83c\udf19";
  }
  syncIcon();
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    syncIcon();
  });
}

// ----------------------------------------------------------------- cursor

function initCursor() {
  const cursorDot = document.getElementById("cursorDot");
  const cursorRing = document.getElementById("cursorRing");
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  function render() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(render);
  }
  render();
}

// ------------------------------------------------------------------- toast

function initToastClose() {
  document.getElementById("toastClose").addEventListener("click", () => {
    const toast = document.getElementById("toast");
    toast.classList.remove("visible");
    setTimeout(() => { toast.hidden = true; }, 500);
  });
}

// ----------------------------------------------------------------- discord

window.copyDiscord = function copyDiscord() {
  const pill = document.getElementById("discordPill");
  navigator.clipboard.writeText("aneesh61").then(() => {
    const original = pill.textContent;
    pill.innerHTML = '<span class="copied-tag">Copied "aneesh61"!</span>';
    setTimeout(() => { pill.textContent = original; }, 1600);
  }).catch(() => {
    // Clipboard API unavailable (e.g. non-HTTPS) — fail silently.
  });
};

// -------------------------------------------------------------------- init

initTheme();
initCursor();
initToastClose();
bindInteractiveHover(document.querySelectorAll(".interactive"));
loadExperiences();
loadProjects();
loadPopup();
