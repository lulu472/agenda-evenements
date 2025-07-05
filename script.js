const form = document.getElementById('event-form');
const eventList = document.getElementById('event-list');
let events = [];

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('event-name').value.trim();
  const date = document.getElementById('event-date').value;

  if (!name || !date) return;

  events.push({ name, date });
  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  updateList();
  form.reset();
});

function updateList() {
  eventList.innerHTML = '';
  events.forEach(event => {
    const li = document.createElement('li');
    li.textContent = `${event.date} — ${event.name}`;
    eventList.appendChild(li);
  });
}
