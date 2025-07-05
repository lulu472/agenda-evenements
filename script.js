import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
  update
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ─── 1) Config Firebase ─────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyAl_nnZWIVZii_pXVAM58YjY4njuFkBg4s",
  authDomain: "agenda-evenements-44d7d.firebaseapp.com",
  databaseURL: "https://agenda-evenements-44d7d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "agenda-evenements-44d7d",
  storageBucket: "agenda-evenements-44d7d.appspot.com",
  messagingSenderId: "652437255270",
  appId: "1:652437255270:web:4ed8ed8631cca5621429a7"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ─── 2) Sélecteurs DOM ──────────────────────────────────────────────────────
const form = document.getElementById("event-form");
const eventList = document.getElementById("event-list");
const sortSelect = document.getElementById("sort-select");
const searchInput = document.getElementById("search-input");
const toast = document.getElementById("toast");

// ─── 3) Demande de permission de notification ──────────────────────────────
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission().then(permission => {
    console.log("Permission notifications :", permission);
  });
}

// ─── 4) Référence Firebase & état ──────────────────────────────────────────
const dbRef = ref(db, "events");
let events = [];
let editId = null;

// Empêcher les dates passées
const today = new Date().toISOString().split("T")[0];
document.getElementById("event-date").setAttribute("min", today);

// ─── 5) Soumission du formulaire (ajout ou modification) ──────────────────
form.addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("event-name").value.trim();
  const date = document.getElementById("event-date").value;
  const city = document.getElementById("event-city").value.trim();
  const btn = form.querySelector("button");
  if (!name || !date || !city) return;
  btn.disabled = true;

  const payload = { name, date, city };
  const action = editId
    ? update(ref(db, "events/" + editId), payload)
    : push(dbRef, payload);

  action
    .then(() => {
      showToast(editId ? "✏️ Événement modifié !" : "✅ Événement ajouté !");
      form.reset();
      if (editId) {
        editId = null;
        btn.textContent = "Ajouter";
      }
    })
    .catch(() => {
      showToast("❌ Une erreur est survenue.");
    })
    .finally(() => {
      btn.disabled = false;
    });
});

// ─── 6) Écoute en temps réel et mise à jour ───────────────────────────────
onValue(dbRef, snapshot => {
  const data = snapshot.val() || {};
  events = Object.entries(data).map(([id, evt]) => ({ id, ...evt, notified: false }));
  updateDisplay();
});

// ─── 7) Recherche & tri déclenchés ─────────────────────────────────────────
searchInput.addEventListener("input", updateDisplay);
sortSelect.addEventListener("change", updateDisplay);

// ─── 8) Fonction d’affichage des événements ───────────────────────────────
function updateDisplay() {
  let list = [...events];

  // Tri
  switch (sortSelect.value) {
    case "date":
      list.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case "name":
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "city":
      list.sort((a, b) => a.city.localeCompare(b.city));
      break;
  }

  // Filtre recherche
  const q = searchInput.value.trim().toLowerCase();
  if (q) {
    list = list.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.city.toLowerCase().includes(q)
    );
  }

  // Affichage
  eventList.innerHTML = "";
  if (list.length === 0) {
    eventList.innerHTML = '<li style="text-align:center;color:#aaa">Aucun événement trouvé.</li>';
    return;
  }
  list.forEach(evt => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="date">${formatDate(evt.date)}</span> —
      <span class="name">${evt.name}</span> —
      <span class="city">${evt.city}</span>
      <button class="edit-btn" data-id="${evt.id}">✏️</button>
      <button class="delete-btn" data-id="${evt.id}">❌</button>
    `;
    eventList.appendChild(li);
  });

  // Bouton modifier
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const e = events.find(x => x.id === id);
      if (!e) return;
      document.getElementById("event-name").value = e.name;
      document.getElementById("event-date").value = e.date;
      document.getElementById("event-city").value = e.city;
      editId = id;
      form.querySelector("button").textContent = "Modifier";
    };
  });

  // Bouton supprimer
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      if (confirm("Confirmer la suppression ?")) {
        remove(ref(db, "events/" + id))
          .then(() => showToast("🗑️ Événement supprimé !"))
          .catch(() => showToast("❌ Erreur lors de la suppression."));
      }
    };
  });
}

// ─── 9) Notifications avant événement ─────────────────────────────────────
setInterval(checkNotifications, 30000);
function checkNotifications() {
  const now = new Date();
  const oneMinLater = new Date(now.getTime() + 60000);
  events.forEach(evt => {
    const eventDate = new Date(evt.date + "T00:00:00");
    if (
      eventDate.toDateString() === oneMinLater.toDateString() &&
      !evt.notified &&
      Notification.permission === "granted"
    ) {
      new Notification("🗓️ Rappel", {
        body: `${evt.name} à ${evt.city} est dans 1 minute !`
      });
      evt.notified = true;
    }
  });
}

// ─── 10) Helpers ──────────────────────────────────────────────────────────
function formatDate(d) {
  return new Date(d).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric" });
}
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}
