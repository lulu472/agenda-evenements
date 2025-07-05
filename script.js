import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

form.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('event-name').value.trim();
  const date = document.getElementById('event-date').value;
  const city = document.getElementById('event-city').value.trim();

  if (!name || !date || !city) return;

  push(dbRef, { name, date, city })
    .then(() => {
      form.reset();
      showToast("✅ Événement ajouté !");
    })
    .catch(err => {
      console.error(err);
      showToast("❌ Erreur lors de l’ajout.");
    });
});

onValue(dbRef, snapshot => {
  const data = snapshot.val() || {};
  events = Object.values(data);
  updateDisplay();
});

sortSelect.addEventListener('change', updateDisplay);

function updateDisplay() {
  let sortedEvents = [...events];
  const sortValue = sortSelect.value;

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
    li.innerHTML = `<span class="date">${evt.date}</span> — <span class="name">${evt.name}</span> — <span class="city">${evt.city}</span>`;
    eventList.appendChild(li);
  });
}

// 🔔 Fonction toast
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
