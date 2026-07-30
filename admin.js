import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc,
  getDocs, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const authScreen = document.getElementById("authScreen");
const dashboard = document.getElementById("dashboard");
const authError = document.getElementById("authError");

// ------------------------------------------------------------------- auth

onAuthStateChanged(auth, (user) => {
  if (user) {
    authScreen.classList.add("hidden");
    dashboard.classList.remove("hidden");
    loadProjects();
    loadExperiences();
    loadPopup();
  } else {
    dashboard.classList.add("hidden");
    authScreen.classList.remove("hidden");
  }
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  authError.textContent = "";
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error("Login failed:", err.code, err.message);
    if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
      authError.textContent = "Wrong email or password.";
    } else if (err.code === "auth/too-many-requests") {
      authError.textContent = "Too many attempts, try again in a bit.";
    } else if (err.code === "auth/invalid-email") {
      authError.textContent = "That's not a valid email format.";
    } else {
      authError.textContent = `Login error: ${err.code || err.message}`;
    }
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => signOut(auth));

// ---------------------------------------------------------------- projects

const projectForm = document.getElementById("projectForm");
const projectRows = document.getElementById("projectRows");

async function loadProjects() {
  const q = query(collection(db, "projects"), orderBy("order"));
  const snap = await getDocs(q);
  document.getElementById("projectCount").textContent = snap.size;
  projectRows.innerHTML = "";
  snap.forEach((docSnap) => {
    const p = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(p.title)}</td>
      <td>${escapeHtml(p.category || "")}</td>
      <td>${p.order ?? 0}</td>
      <td class="row-actions">
        <button type="button" class="btn-ghost edit-btn">Edit</button>
        <button type="button" class="btn-danger delete-btn">Delete</button>
      </td>
    `;
    tr.querySelector(".edit-btn").addEventListener("click", () => {
      document.getElementById("projectId").value = docSnap.id;
      document.getElementById("projectTitle").value = p.title || "";
      document.getElementById("projectLink").value = p.url || "";
      document.getElementById("projectCategory").value = p.category || "Robotics & Vision";
      document.getElementById("projectOrder").value = p.order ?? 0;
      document.getElementById("projectDescription").value = p.description || "";
      projectForm.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    tr.querySelector(".delete-btn").addEventListener("click", async () => {
      if (!confirm(`Delete "${p.title}"?`)) return;
      await deleteDoc(doc(db, "projects", docSnap.id));
      loadProjects();
    });
    projectRows.appendChild(tr);
  });
}

projectForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("projectId").value;
  const data = {
    title: document.getElementById("projectTitle").value.trim(),
    url: document.getElementById("projectLink").value.trim(),
    category: document.getElementById("projectCategory").value,
    order: parseInt(document.getElementById("projectOrder").value || "0", 10),
    description: document.getElementById("projectDescription").value.trim(),
  };
  if (id) {
    await updateDoc(doc(db, "projects", id), data);
  } else {
    await addDoc(collection(db, "projects"), data);
  }
  projectForm.reset();
  document.getElementById("projectId").value = "";
  loadProjects();
});

document.getElementById("projectCancel").addEventListener("click", () => {
  projectForm.reset();
  document.getElementById("projectId").value = "";
});

// -------------------------------------------------------------- experience

const experienceForm = document.getElementById("experienceForm");
const experienceRows = document.getElementById("experienceRows");

async function loadExperiences() {
  const q = query(collection(db, "experiences"), orderBy("order"));
  const snap = await getDocs(q);
  document.getElementById("experienceCount").textContent = snap.size;
  experienceRows.innerHTML = "";
  snap.forEach((docSnap) => {
    const e = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(e.role)}</td>
      <td>${escapeHtml(e.organization)}</td>
      <td>${e.order ?? 0}</td>
      <td class="row-actions">
        <button type="button" class="btn-ghost edit-btn">Edit</button>
        <button type="button" class="btn-danger delete-btn">Delete</button>
      </td>
    `;
    tr.querySelector(".edit-btn").addEventListener("click", () => {
      document.getElementById("experienceId").value = docSnap.id;
      document.getElementById("experienceRole").value = e.role || "";
      document.getElementById("experienceOrg").value = e.organization || "";
      document.getElementById("experienceTimeframe").value = e.timeframe || "";
      document.getElementById("experienceOrder").value = e.order ?? 0;
      document.getElementById("experienceDescription").value = e.description || "";
      experienceForm.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    tr.querySelector(".delete-btn").addEventListener("click", async () => {
      if (!confirm(`Delete "${e.role}"?`)) return;
      await deleteDoc(doc(db, "experiences", docSnap.id));
      loadExperiences();
    });
    experienceRows.appendChild(tr);
  });
}

experienceForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("experienceId").value;
  const data = {
    role: document.getElementById("experienceRole").value.trim(),
    organization: document.getElementById("experienceOrg").value.trim(),
    timeframe: document.getElementById("experienceTimeframe").value.trim(),
    order: parseInt(document.getElementById("experienceOrder").value || "0", 10),
    description: document.getElementById("experienceDescription").value.trim(),
  };
  if (id) {
    await updateDoc(doc(db, "experiences", id), data);
  } else {
    await addDoc(collection(db, "experiences"), data);
  }
  experienceForm.reset();
  document.getElementById("experienceId").value = "";
  loadExperiences();
});

document.getElementById("experienceCancel").addEventListener("click", () => {
  experienceForm.reset();
  document.getElementById("experienceId").value = "";
});

// -------------------------------------------------------------------- popup

const popupForm = document.getElementById("popupForm");

async function loadPopup() {
  const snap = await getDoc(doc(db, "settings", "popup"));
  if (snap.exists()) {
    const data = snap.data();
    document.getElementById("popupText").value = data.text || "";
    document.getElementById("popupActive").checked = !!data.active;
  }
}

popupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  await setDoc(doc(db, "settings", "popup"), {
    text: document.getElementById("popupText").value.trim(),
    active: document.getElementById("popupActive").checked,
  });
  alert("Popup settings saved.");
});

// ---------------------------------------------------------------- starter data

const STARTER_PROJECTS = [
  { title: "ftc30624_25_26_code", description: "Java competition code for FTC Team 30624's 2025-26 DECODE season. Autonomous nav, mecanum drive kinematics, sensor routines.", category: "Robotics & Vision", url: "https://github.com/aneeshlingala/ftc30624_25_26_code", order: 1 },
  { title: "ftc30624_26_offseason_code", description: "Offseason Java code for FTC Team 30624, used to test and tune motion control between seasons.", category: "Robotics & Vision", url: "https://github.com/aneeshlingala/ftc30624_26_offseason_code", order: 2 },
  { title: "FTCCodeSamples", description: "Standalone FTC code samples for vision tracking, AprilTags, and autonomous routines.", category: "Robotics & Vision", url: "https://github.com/aneeshlingala/FTCCodeSamples", order: 3 },
  { title: "weatherstation_pcb", description: "Weather station PCB, designed in KiCad, for logging live environmental data.", category: "Robotics & Vision", url: "https://github.com/aneeshlingala/weatherstation_pcb", order: 4 },
  { title: "ServoTesterPCB", description: "Small custom PCB (KiCad) for bench-testing servo motors.", category: "Robotics & Vision", url: "https://github.com/aneeshlingala/ServoTesterPCB", order: 5 },
  { title: "create-usb", description: "Ubuntu Unity bootstrapper and multi-boot USB creator for mt8183/mt8173 ARM Chromebooks.", category: "Linux & Systems", url: "https://github.com/aneeshlingala/create-usb", order: 6 },
  { title: "ChRadium", description: "Arch Linux ARM build for ARM Chromebooks that Arch doesn't officially support.", category: "Linux & Systems", url: "https://github.com/aneeshlingala/ChRadium", order: 7 },
  { title: "SM-T505-Custom-Rom", description: "Guide for flashing LineageOS onto the Samsung Galaxy Tab A7 (SM-T505).", category: "Linux & Systems", url: "https://github.com/aneeshlingala/SM-T505-Custom-Rom", order: 8 },
  { title: "errordle", description: "Python and web game that trains debugging skills against errors generated on the fly by an AI API.", category: "Tools & Software", url: "https://github.com/aneeshlingala/errordle", order: 9 },
  { title: "paxxer", description: "Scripting and workflow tool, still actively maintained (now on Codeberg).", category: "Tools & Software", url: "https://codeberg.org/aneeshlingala/paxxer", order: 10 },
];

const STARTER_EXPERIENCES = [
  { role: "AI Engineering Intern", organization: "C2S Technologies", timeframe: "2026 - Present", description: "Developing machine learning workflow integrations, optimizing backend architecture, and deploying scalable AI-driven software pipelines.", order: 1 },
  { role: "Lead Programmer & Lead Designer", organization: "FIRST Robotics Competition (FRC - Team 9442)", timeframe: "2026 - Present", description: "Directing software architecture for industrial-scale FRC robots, managing complex multi-subsystem control loops, and designing mechanical layouts.", order: 2 },
  { role: "Lead Programmer & Lead Designer", organization: "FIRST Tech Challenge (FTC - Team 30624)", timeframe: "2025 - Present", description: "Architecting autonomous navigation systems using Limelight 3A vision processing, AprilTags, and precision mecanum kinematics.", order: 3 },
  { role: "Project Lead & Student Researcher", organization: "WSSEF (Washington State Science & Engineering Fair)", timeframe: "2024 - Present", description: "Leading innovative engineering projects, including an assistive navigation system utilizing Raspberry Pi, computer vision, environmental sensors, and haptic feedback loops for the visually impaired.", order: 4 },
  { role: "High School Student", organization: "North Creek High School (NCHS)", timeframe: "2025 - Present", description: "Class of 2030. Actively combining rigorous college-preparatory coursework with advanced extracurricular systems engineering and robotics leadership.", order: 5 },
];

document.getElementById("seedBtn").addEventListener("click", async () => {
  const status = document.getElementById("seedStatus");
  status.textContent = "Loading...";
  try {
    const [projectSnap, experienceSnap, popupSnap] = await Promise.all([
      getDocs(collection(db, "projects")),
      getDocs(collection(db, "experiences")),
      getDoc(doc(db, "settings", "popup")),
    ]);

    const tasks = [];
    if (projectSnap.empty) {
      STARTER_PROJECTS.forEach((p) => tasks.push(addDoc(collection(db, "projects"), p)));
    }
    if (experienceSnap.empty) {
      STARTER_EXPERIENCES.forEach((e) => tasks.push(addDoc(collection(db, "experiences"), e)));
    }
    if (!popupSnap.exists()) {
      tasks.push(setDoc(doc(db, "settings", "popup"), {
        text: "ACT Score: 35 | North Creek High School Class of 2030",
        active: true,
      }));
    }

    if (tasks.length === 0) {
      status.textContent = "Already loaded, nothing to do.";
      return;
    }
    await Promise.all(tasks);
    status.textContent = "Done.";
    loadProjects();
    loadExperiences();
    loadPopup();
  } catch (err) {
    console.error(err);
    status.textContent = "Something went wrong, check the console.";
  }
});

const FULL_PROJECT_LIST = [
  { title: "ftc30624_25_26_code", description: "Core Java competition codebase for FTC Team 30624’s 2025-26 DECODE season, showcasing autonomous navigation, mecanum drive kinematics, and sensor routines.", category: "Robotics & Vision", url: "https://github.com/aneeshlingala/ftc30624_25_26_code", order: 1 },
  { title: "ftc30624_26_offseason_code", description: "Offseason Java experimentation and motion-control optimizations for FTC Team 30624, built between competition seasons.", category: "Robotics & Vision", url: "https://github.com/aneeshlingala/ftc30624_26_offseason_code", order: 2 },
  { title: "FTCCodeSamples", description: "Modular FTC code samples covering vision tracking, AprilTags, and autonomous strategy patterns.", category: "Robotics & Vision", url: "https://github.com/aneeshlingala/FTCCodeSamples", order: 3 },
  { title: "FTC-for-VS-Code-Linux", description: "The FTC-for-VS-Code extension, adapted and fixed to run natively on Linux instead of just Windows/Mac.", category: "Robotics & Vision", url: "https://github.com/aneeshlingala/FTC-for-VS-Code-Linux", order: 4 },
  { title: "weatherstation_pcb", description: "Custom weather-station PCB designed in KiCad for live environmental telemetry.", category: "Robotics & Vision", url: "https://github.com/aneeshlingala/weatherstation_pcb", order: 5 },
  { title: "ServoTesterPCB", description: "A small custom PCB, also designed in KiCad, for bench-testing and benchmarking servo motors.", category: "Robotics & Vision", url: "https://github.com/aneeshlingala/ServoTesterPCB", order: 6 },
  { title: "create-usb", description: "Ubuntu Unity bootstrapper and multi-boot USB creator for mt8183/mt8173 ARM Chromebooks.", category: "Linux & Systems", url: "https://github.com/aneeshlingala/create-usb", order: 7 },
  { title: "ChRadium", description: "A full Arch Linux ARM build tailored to bring a modern rolling-release distro to ARM Chromebooks Arch doesn’t officially support.", category: "Linux & Systems", url: "https://github.com/aneeshlingala/ChRadium", order: 8 },
  { title: "Plymouth-OpenRC-Artix-SDDM", description: "Adds Plymouth boot-splash support to Artix Linux running OpenRC + SDDM.", category: "Linux & Systems", url: "https://github.com/aneeshlingala/Plymouth-OpenRC-Artix-SDDM", order: 9 },
  { title: "chromebooks", description: "Chromebook developer and recovery tooling, extended from the upstream project.", category: "Linux & Systems", url: "https://github.com/aneeshlingala/chromebooks", order: 10 },
  { title: "fydeos_chromebrew", description: "Chromebrew package-management scripts adapted for the FydeOS environment.", category: "Linux & Systems", url: "https://github.com/aneeshlingala/fydeos_chromebrew", order: 11 },
  { title: "chromebook-unity.github.io", description: "Documentation site for the Ubuntu Unity ARM Chromebook Edition project.", category: "Linux & Systems", url: "https://github.com/aneeshlingala/chromebook-unity.github.io", order: 12 },
  { title: "tubuntu.github.io", description: "Project website for Tubuntu, a Chromebook-focused Ubuntu remix.", category: "Linux & Systems", url: "https://github.com/aneeshlingala/tubuntu.github.io", order: 13 },
  { title: "elegant", description: "A lightweight package manager written from scratch in bash.", category: "Linux & Systems", url: "https://github.com/aneeshlingala/elegant", order: 14 },
  { title: "elegant-pkgs", description: "The package repository/build recipes that back the Elegant package manager.", category: "Linux & Systems", url: "https://github.com/aneeshlingala/elegant-pkgs", order: 15 },
  { title: "elegant-pkg.github.io", description: "Project website for the Elegant package manager.", category: "Linux & Systems", url: "https://github.com/aneeshlingala/elegant-pkg.github.io", order: 16 },
  { title: "firmware-samsung-goyavewifi", description: "Wi-Fi firmware files for the Samsung \"Goyave\" device line.", category: "Linux & Systems", url: "https://github.com/aneeshlingala/firmware-samsung-goyavewifi", order: 17 },
  { title: "errordle", description: "A Python + web game that trains debugging skills against programming errors generated on the fly by an AI API.", category: "Tools & Software", url: "https://github.com/aneeshlingala/errordle", order: 18 },
  { title: "paxxer", description: "A scripting/workflow framework, actively maintained on Codeberg.", category: "Tools & Software", url: "https://codeberg.org/aneeshlingala/paxxer", order: 19 },
  { title: "grade-melon-nsd", description: "A modified StudentVUE client (TypeScript) customized for Northshore School District.", category: "Tools & Software", url: "https://github.com/aneeshlingala/grade-melon-nsd", order: 20 },
  { title: "vibecoded-migration-script", description: "A data-migration script for moving state between environments cleanly.", category: "Tools & Software", url: "https://github.com/aneeshlingala/vibecoded-migration-script", order: 21 },
  { title: "pid-site", description: "Early iteration of a website for FTC Team 30624.", category: "Tools & Software", url: "https://github.com/aneeshlingala/pid-site", order: 22 },
  { title: "aneeshlingala.github.io", description: "Earlier Website Experiment.", category: "Tools & Software", url: "https://github.com/aneeshlingala/aneeshlingala.github.io", order: 23 },
  { title: "u-boot", description: "Working tree of the U-Boot bootloader used across several of these porting projects.", category: "Kernel & Firmware", url: "https://github.com/aneeshlingala/u-boot", order: 24 },
  { title: "sakura-firmware", description: "Packaged wcnss Wi-Fi/Bluetooth firmware blobs for postmarketOS.", category: "Kernel & Firmware", url: "https://github.com/aneeshlingala/sakura-firmware", order: 25 },
  { title: "kernel_xiaomi_msm8953", description: "Kernel source dependency for the Xiaomi Redmi 6 Pro (codename \"sakura\").", category: "Kernel & Firmware", url: "https://github.com/aneeshlingala/kernel_xiaomi_msm8953", order: 26 },
  { title: "kernel_xiaomi_sakura", description: "Kernel source for the Redmi 6 Pro, tracking the lineage-17.0 (4.9-based) branch.", category: "Kernel & Firmware", url: "https://github.com/aneeshlingala/kernel_xiaomi_sakura", order: 27 },
  { title: "Xiaomi_Kernel_OpenSource", description: "Xiaomi’s published open-source kernel tree, used as a base for device bring-up.", category: "Kernel & Firmware", url: "https://github.com/aneeshlingala/Xiaomi_Kernel_OpenSource", order: 28 },
  { title: "daisy_msm8953", description: "AOSP/CAF kernel tree targeting the daisy/sakura device family.", category: "Kernel & Firmware", url: "https://github.com/aneeshlingala/daisy_msm8953", order: 29 },
  { title: "blendos_build", description: "blendOS build tooling, extended with ARM device support.", category: "Kernel & Firmware", url: "https://github.com/aneeshlingala/blendos_build", order: 30 },
  { title: "PKGBUILDs", description: "Arch Linux ARM PKGBUILDs, patched to add Bluetooth support for the Mediatek MT8183 Chip.", category: "Kernel & Firmware", url: "https://github.com/aneeshlingala/PKGBUILDs", order: 31 },
  { title: "velvet-os.github.io", description: "Documentation for the systems supported by Velvet OS.", category: "Kernel & Firmware", url: "https://github.com/aneeshlingala/velvet-os.github.io", order: 32 },
  { title: "wiki", description: "Wiki content for the Arch Linux ARM project.", category: "Kernel & Firmware", url: "https://github.com/aneeshlingala/wiki", order: 33 },
  { title: "mac", description: "A one-click Arch Linux installer script.", category: "Kernel & Firmware", url: "https://github.com/aneeshlingala/mac", order: 34 },
  { title: "refind-minimal-nord-mirror", description: "A minimal, Nord-themed rEFInd boot-manager theme.", category: "Kernel & Firmware", url: "https://github.com/aneeshlingala/refind-minimal-nord-mirror", order: 35 },
  { title: "sddm-chili", description: "A theme for SDDM, the Simple Desktop Display Manager.", category: "Kernel & Firmware", url: "https://github.com/aneeshlingala/sddm-chili", order: 36 },
  { title: "paxxer-theming", description: "Theming assets for the Paxxer project.", category: "Kernel & Firmware", url: "https://github.com/aneeshlingala/paxxer-theming", order: 37 },
];



document.getElementById("importBtn").addEventListener("click", async () => {
  const status = document.getElementById("importStatus");
  if (!confirm(`This will delete all ${document.querySelectorAll("#projectRows tr").length} existing project rows and replace them with the full ${FULL_PROJECT_LIST.length}-project list. Continue?`)) {
    return;
  }
  status.textContent = "Deleting existing projects...";
  try {
    const existing = await getDocs(collection(db, "projects"));
    await Promise.all(existing.docs.map((d) => deleteDoc(doc(db, "projects", d.id))));

    status.textContent = "Adding full project list...";
    await Promise.all(FULL_PROJECT_LIST.map((p) => addDoc(collection(db, "projects"), p)));

    status.textContent = "Done.";
    loadProjects();
  } catch (err) {
    console.error(err);
    status.textContent = "Something went wrong, check the console.";
  }
});

// -------------------------------------------------------------------- utils

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
