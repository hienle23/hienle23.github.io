'use strict';

// ===== STATE =====
const STORAGE_KEY = 'cal_events_v1';

let state = {
  today: new Date(),
  viewDate: new Date(),   // month/week being shown
  selectedDate: new Date(),
  view: 'month',          // 'month' | 'week'
  events: loadEvents(),
  editingId: null,
  selectedColor: '#6366f1',
};

// ===== STORAGE =====
function loadEvents() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveEvents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.events));
}
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ===== DATE HELPERS =====
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}
function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function parseDate(str) {
  const [y,m,d] = str.split('-').map(Number);
  return new Date(y, m-1, d);
}
function startOfWeek(d) {
  const c = new Date(d);
  c.setDate(c.getDate() - c.getDay());
  return c;
}
function addDays(d, n) {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}
function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2,'0')} ${ampm}`;
}
function eventsOnDay(date) {
  const key = dateKey(date);
  return state.events
    .filter(e => e.date === key)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
}

// ===== MONTH LABEL =====
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ===== RENDER DISPATCH =====
function render() {
  renderMiniCal();
  updateMonthTitle();
  if (state.view === 'month') renderMonth();
  else renderWeek();
}

// ===== MONTH TITLE =====
function updateMonthTitle() {
  const d = state.viewDate;
  const label = state.view === 'week'
    ? weekTitle(d)
    : `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  document.getElementById('monthTitle').textContent = label;
}
function weekTitle(d) {
  const start = startOfWeek(d);
  const end = addDays(start, 6);
  if (start.getMonth() === end.getMonth())
    return `${MONTHS[start.getMonth()]} ${start.getFullYear()}`;
  return `${MONTHS[start.getMonth()].slice(0,3)} – ${MONTHS[end.getMonth()].slice(0,3)} ${end.getFullYear()}`;
}

// ===== MINI CALENDAR =====
function renderMiniCal() {
  const d = state.viewDate;
  document.getElementById('miniMonthLabel').textContent =
    `${MONTHS[d.getMonth()].slice(0,3)} ${d.getFullYear()}`;

  const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const startPad = firstDay.getDay();

  const container = document.getElementById('miniCalDays');
  container.innerHTML = '';

  const total = startPad + lastDay.getDate();
  const cells = Math.ceil(total / 7) * 7;

  for (let i = 0; i < cells; i++) {
    const dayOffset = i - startPad;
    const cellDate = new Date(d.getFullYear(), d.getMonth(), 1 + dayOffset);
    const isOther = dayOffset < 0 || dayOffset >= lastDay.getDate();
    const isToday = sameDay(cellDate, state.today);
    const isSel = sameDay(cellDate, state.selectedDate);
    const hasEv = eventsOnDay(cellDate).length > 0;

    const btn = document.createElement('button');
    btn.className = 'mini-day' +
      (isOther ? ' other-month' : '') +
      (isToday ? ' today' : '') +
      (isSel && !isToday ? ' selected' : '') +
      (hasEv ? ' has-event' : '');
    btn.textContent = cellDate.getDate();
    btn.title = dateKey(cellDate);
    btn.addEventListener('click', () => {
      state.selectedDate = new Date(cellDate);
      state.viewDate = new Date(cellDate);
      render();
    });
    container.appendChild(btn);
  }
}

// ===== MONTH VIEW =====
function renderMonth() {
  const grid = document.getElementById('calGrid');
  grid.innerHTML = '';

  const d = state.viewDate;
  const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const startPad = firstDay.getDay();
  const total = startPad + lastDay.getDate();
  const cells = Math.ceil(total / 7) * 7;

  grid.style.gridTemplateRows = `repeat(${Math.ceil(total / 7)}, 1fr)`;

  for (let i = 0; i < cells; i++) {
    const dayOffset = i - startPad;
    const cellDate = new Date(d.getFullYear(), d.getMonth(), 1 + dayOffset);
    const isOther = dayOffset < 0 || dayOffset >= lastDay.getDate();
    const isToday = sameDay(cellDate, state.today);
    const isSel = sameDay(cellDate, state.selectedDate);

    const cell = document.createElement('div');
    cell.className = 'cal-cell' +
      (isOther ? ' other-month' : '') +
      (isToday ? ' today' : '') +
      (isSel ? ' selected-day' : '');
    cell.dataset.date = dateKey(cellDate);

    const numEl = document.createElement('div');
    numEl.className = 'day-num';
    numEl.textContent = cellDate.getDate();
    cell.appendChild(numEl);

    const evContainer = document.createElement('div');
    evContainer.className = 'cell-events';
    const dayEvs = eventsOnDay(cellDate);
    const MAX_SHOW = 3;
    dayEvs.slice(0, MAX_SHOW).forEach(ev => {
      const chip = makeChip(ev);
      evContainer.appendChild(chip);
    });
    if (dayEvs.length > MAX_SHOW) {
      const more = document.createElement('div');
      more.className = 'more-events';
      more.textContent = `+${dayEvs.length - MAX_SHOW} more`;
      more.addEventListener('click', e => { e.stopPropagation(); openDayEvents(cellDate); });
      evContainer.appendChild(more);
    }
    cell.appendChild(evContainer);

    cell.addEventListener('click', () => {
      state.selectedDate = new Date(cellDate);
      openNewEvent(dateKey(cellDate));
      render();
    });
    grid.appendChild(cell);
  }
}

function makeChip(ev) {
  const chip = document.createElement('div');
  chip.className = 'event-chip';
  chip.style.background = hexAlpha(ev.color || '#6366f1', 0.25);
  chip.style.color = lighten(ev.color || '#6366f1');

  const dot = document.createElement('span');
  dot.className = 'chip-dot';
  dot.style.background = ev.color || '#6366f1';
  chip.appendChild(dot);

  if (ev.time) {
    const t = document.createElement('span');
    t.className = 'chip-time';
    t.textContent = formatTime(ev.time);
    chip.appendChild(t);
  }

  const title = document.createElement('span');
  title.textContent = ev.title;
  chip.appendChild(title);

  chip.addEventListener('click', e => {
    e.stopPropagation();
    showDetailPopup(ev, chip);
  });
  return chip;
}

function hexAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
function lighten(hex) {
  const r = Math.min(255, parseInt(hex.slice(1,3), 16) + 80);
  const g = Math.min(255, parseInt(hex.slice(3,5), 16) + 80);
  const b = Math.min(255, parseInt(hex.slice(5,7), 16) + 80);
  return `rgb(${r},${g},${b})`;
}

// ===== WEEK VIEW =====
const HOUR_HEIGHT = 60; // px per hour

function renderWeek() {
  const weekStart = startOfWeek(state.viewDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Header
  const header = document.getElementById('weekHeader');
  header.style.display = 'grid';
  header.style.gridTemplateColumns = '52px repeat(7, 1fr)';
  header.innerHTML = '<div class="week-header-gutter"></div>';
  days.forEach(day => {
    const col = document.createElement('div');
    col.className = 'week-col-header' + (sameDay(day, state.today) ? ' today' : '');
    col.innerHTML = `<div class="wday">${DAYS_SHORT[day.getDay()]}</div>
      <div class="wdate">${day.getDate()}</div>`;
    header.appendChild(col);
  });

  // Time gutter
  const gutter = document.getElementById('timeGutter');
  gutter.style.height = `${24 * HOUR_HEIGHT}px`;
  gutter.innerHTML = '';
  for (let h = 0; h < 24; h++) {
    const label = document.createElement('div');
    label.className = 'time-label';
    label.style.top = `${h * HOUR_HEIGHT}px`;
    label.textContent = h === 0 ? '' : formatHour(h);
    gutter.appendChild(label);
  }

  // Week columns
  const cols = document.getElementById('weekCols');
  cols.style.gridTemplateColumns = `repeat(7, 1fr)`;
  cols.style.height = `${24 * HOUR_HEIGHT}px`;
  cols.innerHTML = '';

  days.forEach(day => {
    const col = document.createElement('div');
    col.className = 'week-col' + (sameDay(day, state.today) ? ' today' : '');
    col.style.height = `${24 * HOUR_HEIGHT}px`;

    // Hour lines
    for (let h = 0; h < 24; h++) {
      const line = document.createElement('div');
      line.className = 'hour-line';
      line.style.top = `${h * HOUR_HEIGHT}px`;
      col.appendChild(line);
      if (h > 0) {
        const half = document.createElement('div');
        half.className = 'half-line';
        half.style.top = `${h * HOUR_HEIGHT - HOUR_HEIGHT / 2}px`;
        col.appendChild(half);
      }
    }

    // Events
    const dayEvs = eventsOnDay(day);
    dayEvs.forEach(ev => {
      if (!ev.time) return;
      const [sh, sm] = ev.time.split(':').map(Number);
      const topPx = (sh + sm / 60) * HOUR_HEIGHT;
      let heightPx = HOUR_HEIGHT;
      if (ev.endTime) {
        const [eh, em] = ev.endTime.split(':').map(Number);
        heightPx = Math.max(20, ((eh + em / 60) - (sh + sm / 60)) * HOUR_HEIGHT);
      }
      const evEl = document.createElement('div');
      evEl.className = 'week-event';
      evEl.style.top = `${topPx}px`;
      evEl.style.height = `${heightPx}px`;
      evEl.style.background = hexAlpha(ev.color || '#6366f1', 0.3);
      evEl.style.color = lighten(ev.color || '#6366f1');
      evEl.style.borderLeft = `3px solid ${ev.color || '#6366f1'}`;
      evEl.innerHTML = `<div>${ev.title}</div><div class="we-time">${formatTime(ev.time)}${ev.endTime ? ' – ' + formatTime(ev.endTime) : ''}</div>`;
      evEl.addEventListener('click', e => { e.stopPropagation(); showDetailPopup(ev, evEl); });
      col.appendChild(evEl);
    });

    // Click to add all-day events (without time)
    col.addEventListener('click', e => {
      if (e.target !== col && !e.target.classList.contains('hour-line') && !e.target.classList.contains('half-line')) return;
      const rect = col.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;
      const hour = Math.floor(offsetY / HOUR_HEIGHT);
      const min = Math.round((offsetY % HOUR_HEIGHT) / HOUR_HEIGHT * 60 / 15) * 15;
      state.selectedDate = new Date(day);
      openNewEvent(dateKey(day), `${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}`);
    });
    cols.appendChild(col);
  });

  // Now line
  if (days.some(d => sameDay(d, state.today))) {
    const now = new Date();
    const dayIdx = days.findIndex(d => sameDay(d, state.today));
    const colEls = cols.querySelectorAll('.week-col');
    if (colEls[dayIdx]) {
      const topPx = (now.getHours() + now.getMinutes() / 60) * HOUR_HEIGHT;
      const line = document.createElement('div');
      line.className = 'now-line';
      line.style.top = `${topPx}px`;
      colEls[dayIdx].appendChild(line);
      // Scroll to now
      const weekBody = document.querySelector('.week-body');
      if (weekBody) {
        setTimeout(() => { weekBody.scrollTop = Math.max(0, topPx - 120); }, 50);
      }
    }
  }
}

function formatHour(h) {
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12} ${ampm}`;
}

// ===== NAVIGATION =====
function navigate(dir) {
  const d = state.viewDate;
  if (state.view === 'month') {
    state.viewDate = new Date(d.getFullYear(), d.getMonth() + dir, 1);
  } else {
    state.viewDate = addDays(d, dir * 7);
  }
  render();
}

// ===== DETAIL POPUP =====
let detailEvent = null;
function showDetailPopup(ev, anchor) {
  detailEvent = ev;
  const popup = document.getElementById('detailPopup');
  document.getElementById('detailColorBar').style.background = ev.color || '#6366f1';
  document.getElementById('detailTitle').textContent = ev.title;

  let timeStr = '';
  if (ev.time) {
    timeStr = formatTime(ev.time);
    if (ev.endTime) timeStr += ' – ' + formatTime(ev.endTime);
  }
  const dateLabel = parseDate(ev.date).toLocaleDateString(undefined, { weekday:'long', month:'long', day:'numeric' });
  document.getElementById('detailTime').textContent = timeStr ? `${dateLabel} · ${timeStr}` : dateLabel;

  const noteEl = document.getElementById('detailNote');
  noteEl.textContent = ev.note || '';
  noteEl.style.display = ev.note ? 'block' : 'none';

  popup.classList.remove('hidden');

  // Position popup near anchor
  const rect = anchor.getBoundingClientRect();
  const popW = 280;
  const popH = popup.offsetHeight || 140;
  let left = rect.right + 8;
  let top = rect.top;
  if (left + popW > window.innerWidth) left = rect.left - popW - 8;
  if (top + popH > window.innerHeight) top = window.innerHeight - popH - 12;
  if (left < 8) left = 8;
  if (top < 8) top = 8;
  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
}

function closeDetailPopup() {
  document.getElementById('detailPopup').classList.add('hidden');
  detailEvent = null;
}

// ===== MODAL =====
function openModal(title) {
  document.getElementById('modalTitle').textContent = title;
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.add('open');
  setTimeout(() => document.getElementById('eventTitle').focus(), 100);
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('eventForm').reset();
  state.editingId = null;
  state.selectedColor = '#6366f1';
  document.querySelectorAll('.color-swatch').forEach(s => s.classList.toggle('selected', s.dataset.color === '#6366f1'));
  document.getElementById('deleteEventBtn').classList.add('hidden');
}

function openNewEvent(dateStr, timeStr) {
  state.editingId = null;
  document.getElementById('eventDate').value = dateStr || dateKey(state.selectedDate);
  document.getElementById('eventTime').value = timeStr || '';
  document.getElementById('eventEndTime').value = '';
  document.getElementById('eventId').value = '';
  document.getElementById('eventTitle').value = '';
  document.getElementById('eventNote').value = '';
  state.selectedColor = '#6366f1';
  document.querySelectorAll('.color-swatch').forEach(s => s.classList.toggle('selected', s.dataset.color === '#6366f1'));
  document.getElementById('deleteEventBtn').classList.add('hidden');
  openModal('New Event');
}

function openEditEvent(ev) {
  closeDetailPopup();
  state.editingId = ev.id;
  document.getElementById('eventTitle').value = ev.title;
  document.getElementById('eventDate').value = ev.date;
  document.getElementById('eventTime').value = ev.time || '';
  document.getElementById('eventEndTime').value = ev.endTime || '';
  document.getElementById('eventNote').value = ev.note || '';
  document.getElementById('eventId').value = ev.id;
  state.selectedColor = ev.color || '#6366f1';
  document.querySelectorAll('.color-swatch').forEach(s => s.classList.toggle('selected', s.dataset.color === state.selectedColor));
  document.getElementById('deleteEventBtn').classList.remove('hidden');
  openModal('Edit Event');
}

function openDayEvents(date) {
  // Switch to that day in week view if needed; for now just open new event
  state.viewDate = new Date(date);
  state.view = 'week';
  document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === 'week'));
  document.getElementById('monthView').classList.add('hidden');
  document.getElementById('weekView').classList.remove('hidden');
  render();
}

// ===== SAVE EVENT =====
function handleFormSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('eventTitle').value.trim();
  if (!title) return;

  const ev = {
    id: state.editingId || genId(),
    title,
    date: document.getElementById('eventDate').value,
    time: document.getElementById('eventTime').value || '',
    endTime: document.getElementById('eventEndTime').value || '',
    note: document.getElementById('eventNote').value.trim(),
    color: state.selectedColor,
  };

  if (state.editingId) {
    const idx = state.events.findIndex(e => e.id === state.editingId);
    if (idx !== -1) state.events[idx] = ev;
  } else {
    state.events.push(ev);
  }

  saveEvents();
  closeModal();
  render();
}

function deleteEvent() {
  if (!state.editingId) return;
  if (!confirm('Delete this event?')) return;
  state.events = state.events.filter(e => e.id !== state.editingId);
  saveEvents();
  closeModal();
  render();
}

// ===== INIT =====
function init() {
  // Navigation
  document.getElementById('prevMonth').addEventListener('click', () => navigate(-1));
  document.getElementById('nextMonth').addEventListener('click', () => navigate(1));
  document.getElementById('goToday').addEventListener('click', () => {
    state.viewDate = new Date(state.today);
    state.selectedDate = new Date(state.today);
    render();
  });
  document.getElementById('miniPrev').addEventListener('click', () => {
    const d = state.viewDate;
    state.viewDate = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    render();
  });
  document.getElementById('miniNext').addEventListener('click', () => {
    const d = state.viewDate;
    state.viewDate = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    render();
  });

  // View toggle
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.view = btn.dataset.view;
      document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b === btn));
      document.getElementById('monthView').classList.toggle('hidden', state.view !== 'month');
      document.getElementById('weekView').classList.toggle('hidden', state.view !== 'week');
      render();
    });
  });

  // New event
  document.getElementById('newEventBtn').addEventListener('click', () => openNewEvent(dateKey(state.selectedDate)));

  // Modal
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  document.getElementById('eventForm').addEventListener('submit', handleFormSubmit);
  document.getElementById('deleteEventBtn').addEventListener('click', deleteEvent);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });

  // Color picker
  document.getElementById('colorPicker').addEventListener('click', e => {
    const swatch = e.target.closest('.color-swatch');
    if (!swatch) return;
    state.selectedColor = swatch.dataset.color;
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.toggle('selected', s === swatch));
  });

  // Detail popup
  document.getElementById('detailClose').addEventListener('click', closeDetailPopup);
  document.getElementById('detailEditBtn').addEventListener('click', () => {
    if (detailEvent) openEditEvent(detailEvent);
  });
  document.addEventListener('click', e => {
    const popup = document.getElementById('detailPopup');
    if (!popup.classList.contains('hidden') && !popup.contains(e.target)) {
      closeDetailPopup();
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal();
      closeDetailPopup();
    }
    if ((e.key === 'n' || e.key === 'N') && !e.target.matches('input,textarea')) {
      openNewEvent(dateKey(state.selectedDate));
    }
    if (e.key === 'ArrowLeft' && !e.target.matches('input,textarea')) navigate(-1);
    if (e.key === 'ArrowRight' && !e.target.matches('input,textarea')) navigate(1);
    if (e.key === 't' && !e.target.matches('input,textarea')) {
      state.viewDate = new Date(state.today);
      state.selectedDate = new Date(state.today);
      render();
    }
  });

  render();
}

document.addEventListener('DOMContentLoaded', init);
