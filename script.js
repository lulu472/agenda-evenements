import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
  update
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

const form = document.getElementById("event-form");
const eventList = document.getElementById("event-list");
const sortSelect = document.getElementById("sort-select");
const toast = document.getElementById("toast");
const searchInput = document.getElementById("search-input"); // 🔍

const dbRef = ref(db, "events");
let events = [];
let editId = null;

// Date min aujourd'hui
const today = new Date().toISOString().split("T")[0];
document.getElementById("event-date").setAttribute("min", today);

// Soumission du formulaire
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("event-name").value.trim();
  const date = document.getElementById("event-date").value;
  const city = document.getElementById("event-city").value.trim();
  const submitBtn = form.querySelector("button");

  if (!name || !date || !city) return;

  submitBtn.disabled = true;

  if (editId) {
    // === MODE MODIFICATION ===
    const updateRef = ref(db, "events/" + editId);
    update(updateRef, { name, date, city })
      .then(() => {
        showToast("✏️ Événement modifié !");
        form.reset();
        editId = null;
        submitBtn.textContent = "Ajouter";
      })
      .catch(() => showToast("❌ Erreur lors de la modification."))
      .finally(() => (submitBtn.disabled = false));
  } else {
    // === MODE AJOUT ===
    push(dbRef, { name, date, city })
      .then(() => {
        form.reset();
        showToast("✅ Événement ajouté !");
      })
      .catch(() => showToast("❌ Erreur lors de l’ajout."))
      .finally(() => (submitBtn.disabled = false));
  }
});

// Lecture en temps réel
onValue(dbRef, (snapshot) => {
  const data = snapshot.val() || {};
  events = Object.entries(data).map(([id, evt]) => ({ id, ...evt }));
  updateDisplay();
});

// Recherche dynamique 🔍
searchInput.addEventListener("input", updateDisplay);

// Tri
sortSelect.addEventListener("change", updateDisplay);

// Fonction d’affichage
function updateDisplay() {
  let sortedEvents = [...events];

  // Tri sélectionné
  const sortValue = sortSelect.value;
  switch (sortValue) {
    case "date":
      sortedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case "name":
      sortedEvents.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "city":
      sortedEvents.sort((a, b) => a.city.localeCompare(b.city));
      break;
  }

  // Recherche active
  const query = searchInput.value.trim().toLowerCase();
  if (query) {
    sortedEvents = sortedEvents.filter(
      (e) =>
        e.name.toLowerCase().includes(query) ||
        e.city.toLowerCase().includes(query)
    );
  }

  eventList.innerHTML = "";

  if (sortedEvents.length === 0) {
    eventList.innerHTML =
      '<li style="text-align:center; color:#aaa;">Aucun événement trouvé.</li>';
    return;
  }

  sortedEvents.forEach((evt) => {
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

  // Boutons modifier
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const evt = events.find((e) => e.id === id);
      if (!evt) return;
      document.getElementById("event-name").value = evt.name;
      document.getElementById("event-date").value = evt.date;
      document.getElementById("event-city").value = evt.city;
      editId = id;
      form.querySelector("button").textContent = "Modifier";
    });
  });

  // Boutons supprimer
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      if (confirm("Confirmer la suppression ?")) {
        remove(ref(db, "events/" + id))
          .then(() => showToast("🗑️ Événement supprimé."))
          .catch(() => showToast("❌ Erreur lors de la suppression."));
      }
    });
  });
}

// Format de date FR
function formatDate(dateStr) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateStr).toLocaleDateString("fr-FR", options);
}

// Affiche un toast
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}
