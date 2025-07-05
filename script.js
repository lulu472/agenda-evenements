import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

const form = document.getElementById('event-form');
const eventList = document.getElementById('event-list');
const sortSelect = document.getElementById('sort-select');
const toast = document.getElementById('toast');

const dbRef = ref(db, 'events');
let events = [];

let editId = null; // **Id de l'événement en cours d'édition**

form.addEventListener('submit', e => {
  e.preventDefault();

  const name = document.getElementById('event-name').value.trim();
  const date = document.getElementById('event-date').value;
  const city = document.getElementById('event-city').value.trim();

  if (!name || !date || !city) return;

  if (editId) {
    // === Mode édition ===
    const updateRef = ref(db, 'events/' + editId);
    update(updateRef, { name, date, city })
      .then(() => {
        showToast("✏️ Événement modifié !");
        form.reset();
        editId = null;
        form.querySelector('button').textContent = "Ajouter";
      })
      .catch(err => {
        console.error(err);
        showToast("❌ Erreur lors de la modification.");
      });
  } else {
    // === Mode ajout ===
    push(dbRef, { name, date, city })
      .then(() => {
        form.reset();
        showToast("✅ Événement ajouté !");
      })
      .catch(err => {
        console.error(err);
        showToast("❌ Erreur lors de l’ajout.");
      });
  }
});

onValue(dbRef, snapshot => {
  const data = snapshot.val() || {};
  events = Object.entries(data).map(([id, evt]) => ({ id, ...evt }));
  updateDisplay();
});

sortSelect.addEventListener('change', updateDisplay);

function updateDisplay() {
  const sortValue = sortSelect.value;
  let sortedEvents = [...events];

  switch (sortValue) {
    case 'date':
      sortedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case 'name':
      sortedEvents.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'city':
      sortedEvents.sort((a, b) => (a.city || '').localeCompare(b.city || ''));
      break;
  }

  eventList.innerHTML = '';
  sortedEvents.forEach(evt => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="date">${evt.date}</span> —
      <span class="name">${evt.name}</span> —
      <span class="city">${evt.city}</span>
      <button class="edit-btn" data-id="${evt.id}">✏️</button>
      <button class="delete-btn" data-id="${evt.id}">❌</button>
    `;
    eventList.appendChild(li);
  });

  // Événement bouton modifier
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const eventToEdit = events.find(e => e.id === id);
      if (!eventToEdit) return;

      // Remplir le formulaire avec les données de l'événement
      document.getElementById('event-name').value = eventToEdit.name;
      document.getElementById('event-date').value = eventToEdit.date;
      document.getElementById('event-city').value = eventToEdit.city;

      editId = id; // On passe en mode édition
      form.querySelector('button').textContent = "Modifier";
    });
  });

  // Événement bouton supprimer
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      remove(ref(db, 'events/' + id))
        .then(() => showToast("🗑️ Événement supprimé."))
        .catch(err => {
          console.error(err);
          showToast("❌ Erreur lors de la suppression.");
        });
    });
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
