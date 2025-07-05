// ✅ Import des modules Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ✅ Configuration Firebase (corrigé : storageBucket et measurementId retiré si inutilisé ici)
const firebaseConfig = {
  apiKey: "AIzaSyAl_nnZWIVZii_pXVAM58YjY4njuFkBg4s",
  authDomain: "agenda-evenements-44d7d.firebaseapp.com",
  databaseURL: "https://agenda-evenements-44d7d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "agenda-evenements-44d7d",
  storageBucket: "agenda-evenements-44d7d.appspot.com", // ✅ corrigé ici
  messagingSenderId: "652437255270",
  appId: "1:652437255270:web:4ed8ed8631cca5621429a7"
};

// ✅ Initialisation Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
console.log("✅ Firebase initialisé :", app.name);

// ✅ Sélection des éléments HTML
const form = document.getElementById('event-form');
const eventList = document.getElementById('event-list');
const dbRef = ref(db, 'events');

// ✅ Ajout d’un événement dans Firebase
form.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('event-name').value.trim();
  const date = document.getElementById('event-date').value;

  if (!name || !date) return;

  push(dbRef, { name, date })
    .then(() => console.log("✅ Événement ajouté :", name, date))
    .catch(err => console.error("❌ Erreur lors de l’ajout :", err));

  form.reset();
});

// ✅ Récupération et affichage en temps réel
onValue(dbRef, snapshot => {
  const data = snapshot.val() || {};
  const events = Object.values(data).sort((a, b) => new Date(a.date) - new Date(b.date));

  eventList.innerHTML = '';
  events.forEach(evt => {
    const li = document.createElement('li');
    li.textContent = `${evt.date} — ${evt.name}`;
    eventList.appendChild(li);
  });

  console.log("📥 Événements reçus :", events);
});
