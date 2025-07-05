import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// 1) Ta config ici :
const firebaseConfig = {
  apiKey: "AIzaSyDoitVR08c-uQHd9B-Tc6KpZchAphrBu9c",
  authDomain: "agenda-evenements-44d7d.firebaseapp.com",
  databaseURL: "https://agenda-evenements-44d7d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "agenda-evenements-44d7d",
  storageBucket: "agenda-evenements-44d7d.firebasestorage.app",
  messagingSenderId: "652437255270",
  appId: "1:652437255270:web:4ed8ed8631cca5621429a7",
  measurementId: "G-6G72S5LH3X"
};

// 2) Initialisation
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
console.log("Firebase initialisé", app.name);

// 3) Sélecteurs
const form = document.getElementById('event-form');
const eventList = document.getElementById('event-list');
const dbRef = ref(db, 'events');

// 4) Envoi d’un événement
form.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('event-name').value.trim();
  const date = document.getElementById('event-date').value;
  console.log("Envoi événement", name, date);

  if (!name || !date) return;
  push(dbRef, { name, date })
    .then(() => console.log("Événement ajouté"))
    .catch(err => console.error("Erreur push :", err));
  form.reset();
});

// 5) Lecture en temps réel
onValue(dbRef, snapshot => {
  const data = snapshot.val() || {};
  const events = Object.values(data).sort((a, b) => new Date(a.date) - new Date(b.date));
  console.log("Événements reçus", events);

  eventList.innerHTML = '';
  events.forEach(evt => {
    const li = document.createElement('li');
    li.textContent = `${evt.date} — ${evt.name}`;
    eventList.appendChild(li);
  });
});

