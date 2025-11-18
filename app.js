// Core state
let sessions = JSON.parse(localStorage.getItem("sessions") || "[]");
let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
let inspoIdeas = JSON.parse(localStorage.getItem("inspoIdeas") || "[]");
let socialPlans = JSON.parse(localStorage.getItem("socialPlans") || "[]");
let socialInspo = JSON.parse(localStorage.getItem("socialInspo") || "[]");
let incomes = JSON.parse(localStorage.getItem("incomes") || "[]");
let expenses = JSON.parse(localStorage.getItem("expenses") || "[]");
let clientGroups = JSON.parse(localStorage.getItem("clientGroups") || "[]");
let clientNotes = JSON.parse(localStorage.getItem("clientNotes") || "{}");

// UTIL
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function saveAll() {
  localStorage.setItem("sessions", JSON.stringify(sessions));
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("inspoIdeas", JSON.stringify(inspoIdeas));
  localStorage.setItem("socialPlans", JSON.stringify(socialPlans));
  localStorage.setItem("socialInspo", JSON.stringify(socialInspo));
  localStorage.setItem("incomes", JSON.stringify(incomes));
  localStorage.setItem("expenses", JSON.stringify(expenses));
  localStorage.setItem("clientGroups", JSON.stringify(clientGroups));
  localStorage.setItem("clientNotes", JSON.stringify(clientNotes));
}

// NAVIGATION
const pages = $$(".page");
const navButtons = $$(".nav-btn");
const topNav = $("#topNav");
const menuToggle = $("#menuToggle");
const pageTitle = $("#pageTitle");

menuToggle.addEventListener("click", () => {
  topNav.classList.toggle("open");
});

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const page = btn.dataset.page;
    pages.forEach((p) => p.classList.remove("active"));
    $("#page-" + page).classList.add("active");
    navButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    pageTitle.textContent = page.charAt(0).toUpperCase() + page.slice(1);
    topNav.classList.remove("open");
  });
});

// ===== HOME: TASKS =====
const taskInput = $("#taskInput");
const taskList = $("#taskList");
$("#addTaskBtn").addEventListener("click", () => {
  const v = taskInput.value.trim();
  if (!v) return;
  tasks.push({ text: v, done: false });
  taskInput.value = "";
  saveAll();
  renderTasks();
});
function toggleTask(idx) {
  tasks[idx].done = !tasks[idx].done;
  saveAll();
  renderTasks();
}
function deleteTask(idx) {
  tasks.splice(idx, 1);
  saveAll();
  renderTasks();
}
function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach((t, idx) => {
    const li = document.createElement("li");
    const left = document.createElement("div");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = t.done;
    cb.addEventListener("change", () => toggleTask(idx));
    const span = document.createElement("span");
    span.textContent = t.text;
    if (t.done) span.style.textDecoration = "line-through";
    left.appendChild(cb);
    left.appendChild(span);
    left.style.display = "flex";
    left.style.gap = "0.4rem";
    const delBtn = document.createElement("button");
    delBtn.textContent = "✕";
    delBtn.className = "btn-small secondary";
    delBtn.addEventListener("click", () => deleteTask(idx));
    li.appendChild(left);
    li.appendChild(delBtn);
    taskList.appendChild(li);
  });
}

// ===== HOME: FLASH IDEAS =====
const flashPromptInput = $("#flashPromptInput");
const flashIdeasList = $("#flashIdeasList");
$("#generateFlashBtn").addEventListener("click", () => {
  const base = flashPromptInput.value.trim() || "dark witchy blackwork";
  const motifs = ["moth", "skull", "fern", "dagger", "hourglass", "tarot eye", "snake"];
  flashIdeasList.innerHTML = "";
  for (let i = 0; i < 4; i++) {
    const m = motifs[(Math.random() * motifs.length) | 0];
    const li = document.createElement("li");
    li.textContent = `${base} – ${m} variation`;
    flashIdeasList.appendChild(li);
  }
});

// ===== HOME: QUICK FINANCE =====
$("#quickIncomeSave").addEventListener("click", () => {
  const name = $("#quickIncomeName").value.trim();
  const amt = parseFloat($("#quickIncomeAmount").value || "0");
  if (!name || !amt) return;
  incomes.push({ id: crypto.randomUUID(), name, date: new Date().toISOString().slice(0,10), amount: amt });
  $("#quickIncomeName").value = "";
  $("#quickIncomeAmount").value = "";
  saveAll();
  renderIncome();
});
$("#quickExpenseSave").addEventListener("click", () => {
  const name = $("#quickExpenseName").value.trim();
  const amt = parseFloat($("#quickExpenseAmount").value || "0");
  if (!name || !amt) return;
  expenses.push({ id: crypto.randomUUID(), name, tag: "", date: new Date().toISOString().slice(0,10), amount: amt });
  $("#quickExpenseName").value = "";
  $("#quickExpenseAmount").value = "";
  saveAll();
  renderExpenses();
});

// ===== HOME: FOCUS TIMER =====
let timerSeconds = 0;
let timerInterval = null;
const timerDisplay = $("#timerDisplay");
function updateTimerDisplay() {
  const m = String(Math.floor(timerSeconds / 60)).padStart(2, "0");
  const s = String(timerSeconds % 60).padStart(2, "0");
  timerDisplay.textContent = `${m}:${s}`;
}
$$(".timer-buttons .btn-pill").forEach((btn) => {
  btn.addEventListener("click", () => {
    const min = parseInt(btn.dataset.min, 10);
    timerSeconds = min * 60;
    updateTimerDisplay();
  });
});
$("#startTimerBtn").addEventListener("click", () => {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    if (timerSeconds > 0) {
      timerSeconds--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
      alert("Timer done!");
    }
  }, 1000);
});
$("#stopTimerBtn").addEventListener("click", () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
});
$("#resetTimerBtn").addEventListener("click", () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerSeconds = 0;
  updateTimerDisplay();
});
updateTimerDisplay();

// ===== BOOKING =====
const bookingForm = $("#bookingForm");
const bookingSessionsList = $("#bookingSessionsList");
const cancelEditSessionBtn = $("#cancelEditSessionBtn");
let editingSessionId = null;

bookingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = {
    id: editingSessionId || crypto.randomUUID(),
    client: $("#bookingClientName").value.trim(),
    contact: $("#bookingContact").value.trim(),
    date: $("#bookingDate").value,
    time: $("#bookingTime").value,
    placement: $("#bookingPlacement").value.trim(),
    price: parseFloat($("#bookingPrice").value || "0"),
    deposit: parseFloat($("#bookingDeposit").value || "0"),
    description: $("#bookingDescription").value.trim()
  };
  if (!data.client || !data.date || !data.time) return;
  if (editingSessionId) {
    const idx = sessions.findIndex((s) => s.id === editingSessionId);
    if (idx !== -1) sessions[idx] = data;
  } else {
    sessions.push(data);
  }
  editingSessionId = null;
  cancelEditSessionBtn.classList.add("hidden");
  bookingForm.reset();
  saveAll();
  renderSessions();
  renderHomeFromSessions();
  renderBookingCalendar();
  renderClientsList();
});

cancelEditSessionBtn.addEventListener("click", () => {
  editingSessionId = null;
  bookingForm.reset();
  cancelEditSessionBtn.classList.add("hidden");
});

function renderSessions() {
  bookingSessionsList.innerHTML = "";
  const sorted = [...sessions].sort((a,b) => (a.date + a.time).localeCompare(b.date + b.time));
  sorted.forEach((s) => {
    const card = document.createElement("div");
    card.className = "session-card";
    card.innerHTML = `
      <div><strong>${s.client}</strong> – ${s.date} ${s.time}</div>
      <div>${s.placement || ""}</div>
      <div>$${s.price || 0} (dep $${s.deposit || 0})</div>
      <div class="small-text muted">${s.description || ""}</div>
    `;
    const btnRow = document.createElement("div");
    btnRow.style.display = "flex";
    btnRow.style.gap = "0.4rem";
    btnRow.style.marginTop = "0.35rem";
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "btn-small";
    editBtn.addEventListener("click", () => {
      editingSessionId = s.id;
      $("#bookingClientName").value = s.client;
      $("#bookingContact").value = s.contact;
      $("#bookingDate").value = s.date;
      $("#bookingTime").value = s.time;
      $("#bookingPlacement").value = s.placement || "";
      $("#bookingPrice").value = s.price || "";
      $("#bookingDeposit").value = s.deposit || "";
      $("#bookingDescription").value = s.description || "";
      cancelEditSessionBtn.classList.remove("hidden");
      pages.forEach((p) => p.classList.remove("active"));
      $("#page-booking").classList.add("active");
      navButtons.forEach((b) => b.classList.remove("active"));
      document.querySelector('[data-page="booking"]').classList.add("active");
      pageTitle.textContent = "Booking";
    });
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "btn-small secondary";
    delBtn.addEventListener("click", () => {
      if (!confirm("Delete this session?")) return;
      sessions = sessions.filter((x) => x.id !== s.id);
      saveAll();
      renderSessions();
      renderHomeFromSessions();
      renderBookingCalendar();
      renderClientsList();
    });
    btnRow.appendChild(editBtn);
    btnRow.appendChild(delBtn);
    card.appendChild(btnRow);
    bookingSessionsList.appendChild(card);
  });
}

// ===== HOME: NEXT SESSION + FOLLOWUPS =====
const homeNextSession = $("#homeNextSession");
const contactTodayList = $("#contactTodayList");
const nextFollowupInfo = $("#nextFollowupInfo");

function getNextSession() {
  const now = new Date();
  const future = sessions
    .map((s) => ({ ...s, dt: new Date(s.date + "T" + (s.time || "00:00")) }))
    .filter((s) => s.dt >= now)
    .sort((a,b) => a.dt - b.dt);
  return future[0] || null;
}

function buildFollowups() {
  const list = [];
  sessions.forEach((s) => {
    if (!s.date) return;
    const base = new Date(s.date + "T" + (s.time || "00:00"));
    if (isNaN(base.getTime())) return;
    const week = new Date(base); week.setDate(week.getDate() + 7);
    const month = new Date(base); month.setDate(month.getDate() + 30);
    list.push({ client: s.client, type: "1-week", date: week.toISOString().slice(0,10) });
    list.push({ client: s.client, type: "1-month", date: month.toISOString().slice(0,10) });
  });
  return list.sort((a,b) => a.date.localeCompare(b.date));
}

function renderHomeFromSessions() {
  const next = getNextSession();
  if (!next) {
    homeNextSession.textContent = "No upcoming sessions.";
  } else {
    homeNextSession.innerHTML = `
      <strong>${next.client}</strong><br/>
      ${next.date} ${next.time || ""}<br/>
      ${next.placement || ""} – $${next.price || 0}
    `;
  }

  contactTodayList.innerHTML = "";
  nextFollowupInfo.textContent = "";
  const todayStr = new Date().toISOString().slice(0,10);
  const followups = buildFollowups();
  const todays = followups.filter((f) => f.date === todayStr);
  const nextUpcoming = followups.find((f) => f.date > todayStr);

  if (todays.length === 0 && !nextUpcoming) {
    const li = document.createElement("li");
    li.textContent = "No follow-ups today or upcoming.";
    contactTodayList.appendChild(li);
    return;
  }

  if (todays.length > 0) {
    todays.forEach((f) => {
      const li = document.createElement("li");
      li.textContent = `${f.client} – ${f.type.replace("-", " ")}`;
      contactTodayList.appendChild(li);
    });
  } else if (nextUpcoming) {
    const li = document.createElement("li");
    li.textContent = `${nextUpcoming.client} – ${nextUpcoming.type.replace("-", " ")} (${nextUpcoming.date})`;
    contactTodayList.appendChild(li);
  }

  if (nextUpcoming) {
    nextFollowupInfo.textContent = `Next follow-up after today: ${nextUpcoming.client} on ${nextUpcoming.date}`;
  }
}

// ===== HOME: MESSAGE GENERATOR =====
const messageIdea = $("#messageIdea");
$("#generateMessageBtn").addEventListener("click", () => {
  const templates = [
    "Hey NAME! Just checking in to see how the tattoo is healing and how you're feeling about it.",
    "Yo NAME, hope you're doing well. How's the piece healing up? Any questions or touch-up thoughts?",
    "Hey NAME, quick check-in from your tattoo artist — everything healing alright? Anything you want me to look at?",
    "Hi NAME! Just wanted to make sure the tattoo is healing smooth and you're still loving it."
  ];
  const followups = buildFollowups();
  const todayStr = new Date().toISOString().slice(0,10);
  const todays = followups.filter((f) => f.date === todayStr);
  const target = todays[0] || followups[0];
  const name = target ? target.client : "you";
  const t = templates[(Math.random() * templates.length) | 0].replace("NAME", name);
  messageIdea.textContent = t;
});

// ===== BOOKING CALENDAR =====
let bookingCalMonthOffset = 0;
const bookingCalendarGrid = $("#bookingCalendarGrid");
const bookingCalendarMonthLabel = $("#calendarMonthLabel");
const bookingCalendarDayDetails = $("#calendarDayDetails");

$("#calendarPrev").addEventListener("click", () => {
  bookingCalMonthOffset--;
  renderBookingCalendar();
});
$("#calendarNext").addEventListener("click", () => {
  bookingCalMonthOffset++;
  renderBookingCalendar();
});

function renderBookingCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  let month = now.getMonth() + bookingCalMonthOffset;
  let displayYear = year;
  while (month < 0) { month += 12; displayYear--; }
  while (month > 11) { month -= 12; displayYear++; }
  const first = new Date(displayYear, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(displayYear, month + 1, 0).getDate();
  bookingCalendarMonthLabel.textContent =
    first.toLocaleString(undefined, { month: "long", year: "numeric" });

  bookingCalendarGrid.innerHTML = "";
  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];
  dayNames.forEach((d) => {
    const div = document.createElement("div");
    div.textContent = d;
    div.className = "calendar-day-label";
    bookingCalendarGrid.appendChild(div);
  });
  for (let i = 0; i < startDay; i++) {
    const div = document.createElement("div");
    div.className = "calendar-day-empty";
    bookingCalendarGrid.appendChild(div);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const div = document.createElement("div");
    div.className = "calendar-day";
    const dateStr = new Date(displayYear, month, day).toISOString().slice(0,10);
    const hasSession = sessions.some((s) => s.date === dateStr);
    if (hasSession) div.classList.add("has-session");
    div.textContent = String(day);
    div.addEventListener("click", () => {
      const daySessions = sessions.filter((s) => s.date === dateStr);
      if (daySessions.length === 0) {
        bookingCalendarDayDetails.textContent = "No sessions on this date.";
      } else {
        bookingCalendarDayDetails.innerHTML = daySessions
          .map((s) => `${s.time || ""} – <strong>${s.client}</strong> (${s.placement || ""})`)
          .join("<br>");
      }
    });
    bookingCalendarGrid.appendChild(div);
  }
}

// ===== CLIENTS =====
const clientSearch = $("#clientSearch");
const clientGroupFilter = $("#clientGroupFilter");
const newClientGroupName = $("#newClientGroupName");
const addClientGroupBtn = $("#addClientGroupBtn");
const clientList = $("#clientList");
const clientDetailCard = $("#clientDetailCard");
const clientDetailName = $("#clientDetailName");
const deleteClientBtn = $("#deleteClientBtn");
const clientDetailContact = $("#clientDetailContact");
const clientDetailGroup = $("#clientDetailGroup");
const clientDetailLastSession = $("#clientDetailLastSession");
const clientDetailTotalSpend = $("#clientDetailTotalSpend");
const clientNotesThem = $("#clientNotesThem");
const clientNotesSession = $("#clientNotesSession");
const saveClientMetaBtn = $("#saveClientMetaBtn");
const saveClientNotesBtn = $("#saveClientNotesBtn");
const clientSessionsList = $("#clientSessionsList");
let selectedClientName = null;

function buildClientsFromSessions() {
  const map = new Map();
  sessions.forEach((s) => {
    if (!s.client) return;
    const existing = map.get(s.client) || { name: s.client, contact: s.contact || "", sessions: [] };
    existing.sessions.push(s);
    if (!existing.contact && s.contact) existing.contact = s.contact;
    map.set(s.client, existing);
  });
  return Array.from(map.values());
}

function ensureClientGroupsSelectOptions() {
  clientGroupFilter.innerHTML = `<option value="">All groups</option>`;
  clientGroups.forEach((g) => {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    clientGroupFilter.appendChild(opt);
  });
  clientDetailGroup.innerHTML = `<option value="">None</option>`;
  clientGroups.forEach((g) => {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    clientDetailGroup.appendChild(opt);
  });
}

addClientGroupBtn.addEventListener("click", () => {
  const name = newClientGroupName.value.trim();
  if (!name) return;
  if (!clientGroups.includes(name)) clientGroups.push(name);
  newClientGroupName.value = "";
  saveAll();
  ensureClientGroupsSelectOptions();
});

clientSearch.addEventListener("input", renderClientsList);
clientGroupFilter.addEventListener("change", renderClientsList);

function renderClientsList() {
  const list = buildClientsFromSessions();
  clientList.innerHTML = "";
  const q = clientSearch.value.trim().toLowerCase();
  const groupFilter = clientGroupFilter.value;
  list.forEach((c) => {
    if (q && !c.name.toLowerCase().includes(q)) return;
    const notes = clientNotes[c.name] || {};
    const group = notes.group || "";
    if (groupFilter && group !== groupFilter) return;
    const li = document.createElement("li");
    const left = document.createElement("div");
    left.textContent = c.name;
    const right = document.createElement("div");
    right.textContent = group || "";
    right.className = "small-text muted";
    li.appendChild(left);
    li.appendChild(right);
    li.addEventListener("click", () => openClientDetail(c.name));
    clientList.appendChild(li);
  });
}

function openClientDetail(name) {
  selectedClientName = name;
  const all = buildClientsFromSessions();
  const c = all.find((x) => x.name === name);
  if (!c) return;
  clientDetailName.textContent = name;
  const notes = clientNotes[name] || {};
  clientDetailContact.value = c.contact || notes.contact || "";
  ensureClientGroupsSelectOptions();
  clientDetailGroup.value = notes.group || "";
  const sortedSessions = [...c.sessions].sort((a,b) => (a.date + a.time).localeCompare(b.date + b.time));
  const last = sortedSessions[sortedSessions.length - 1];
  clientDetailLastSession.textContent = last ? `${last.date} ${last.time || ""}` : "—";
  const total = c.sessions.reduce((sum, s) => sum + (s.price || 0), 0);
  clientDetailTotalSpend.textContent = total.toFixed(2);
  clientNotesThem.value = notes.them || "";
  clientNotesSession.value = notes.session || "";
  clientSessionsList.innerHTML = "";
  sortedSessions.forEach((s) => {
    const li = document.createElement("li");
    li.innerHTML = `${s.date} ${s.time || ""} – ${s.placement || ""} – $${s.price || 0}`;
    clientSessionsList.appendChild(li);
  });
  clientDetailCard.hidden = false;
}

saveClientMetaBtn.addEventListener("click", () => {
  if (!selectedClientName) return;
  const n = clientNotes[selectedClientName] || {};
  n.contact = clientDetailContact.value.trim();
  n.group = clientDetailGroup.value;
  clientNotes[selectedClientName] = n;
  saveAll();
  renderClientsList();
});

saveClientNotesBtn.addEventListener("click", () => {
  if (!selectedClientName) return;
  const n = clientNotes[selectedClientName] || {};
  n.them = clientNotesThem.value;
  n.session = clientNotesSession.value;
  clientNotes[selectedClientName] = n;
  saveAll();
});

deleteClientBtn.addEventListener("click", () => {
  if (!selectedClientName) return;
  if (!confirm("Delete this client from notes? (Sessions stay)")) return;
  delete clientNotes[selectedClientName];
  saveAll();
  selectedClientName = null;
  clientDetailCard.hidden = true;
  renderClientsList();
});

// ===== INSPO =====
const inspoIdeaForm = $("#inspoIdeaForm");
const cancelEditInspoBtn = $("#cancelEditInspoBtn");
const inspoIdeasList = $("#inspoIdeasList");
const inspoSearch = $("#inspoSearch");
const inspoTierFilter = $("#inspoTierFilter");
let editingInspoId = null;

$("#generateInspoIdeaBtn").addEventListener("click", () => {
  const tier = $("#inspoTier").value;
  let base = "";
  if (tier === "flash") base = "Small bold blackwork flash focusing on ";
  else if (tier === "medium") base = "Medium sized composition with ";
  else base = "Full concept sleeve built around ";
  const motifs = ["moths and mushrooms", "tarot moons", "wolves and ferns", "witch hands", "daggers and webs"];
  const m = motifs[(Math.random() * motifs.length) | 0];
  $("#inspoIdeaText").value = base + m + ".";
});

inspoIdeaForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const idea = {
    id: editingInspoId || crypto.randomUUID(),
    name: $("#inspoName").value.trim(),
    tier: $("#inspoTier").value,
    idea: $("#inspoIdeaText").value.trim()
  };
  if (!idea.name) return;
  if (editingInspoId) {
    const idx = inspoIdeas.findIndex((i) => i.id === editingInspoId);
    if (idx !== -1) inspoIdeas[idx] = idea;
  } else {
    inspoIdeas.push(idea);
  }
  editingInspoId = null;
  cancelEditInspoBtn.classList.add("hidden");
  inspoIdeaForm.reset();
  saveAll();
  renderInspoIdeas();
});

cancelEditInspoBtn.addEventListener("click", () => {
  editingInspoId = null;
  cancelEditInspoBtn.classList.add("hidden");
  inspoIdeaForm.reset();
});

inspoSearch.addEventListener("input", renderInspoIdeas);
inspoTierFilter.addEventListener("change", renderInspoIdeas);

function renderInspoIdeas() {
  inspoIdeasList.innerHTML = "";
  const q = inspoSearch.value.trim().toLowerCase();
  const tFilter = inspoTierFilter.value;
  inspoIdeas.forEach((i) => {
    if (q && !i.name.toLowerCase().includes(q) && !i.idea.toLowerCase().includes(q)) return;
    if (tFilter && i.tier !== tFilter) return;
    const card = document.createElement("div");
    card.innerHTML = `
      <div><strong>${i.name}</strong> – ${i.tier}</div>
      <div class="small-text muted">${i.idea}</div>
    `;
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.gap = "0.4rem";
    row.style.marginTop = "0.35rem";
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "btn-small";
    editBtn.addEventListener("click", () => {
      editingInspoId = i.id;
      $("#inspoName").value = i.name;
      $("#inspoTier").value = i.tier;
      $("#inspoIdeaText").value = i.idea;
      cancelEditInspoBtn.classList.remove("hidden");
      pages.forEach((p) => p.classList.remove("active"));
      $("#page-inspo").classList.add("active");
      navButtons.forEach((b) => b.classList.remove("active"));
      document.querySelector('[data-page="inspo"]').classList.add("active");
      pageTitle.textContent = "Inspo";
    });
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "btn-small secondary";
    delBtn.addEventListener("click", () => {
      if (!confirm("Delete this idea?")) return;
      inspoIdeas = inspoIdeas.filter((x) => x.id !== i.id);
      saveAll();
      renderInspoIdeas();
    });
    row.appendChild(editBtn);
    row.appendChild(delBtn);
    card.appendChild(row);
    inspoIdeasList.appendChild(card);
  });
}

// ===== SOCIAL =====
const socialForm = $("#socialForm");
const cancelEditSocialBtn = $("#cancelEditSocialBtn");
const socialPlansList = $("#socialPlansList");
const lastSocialSummary = $("#lastSocialSummary");
let socialCalMonthOffset = 0;
const socialCalendarGrid = $("#socialCalendarGrid");
const socialCalMonthLabel = $("#socialCalMonthLabel");
const socialCalendarDayDetails = $("#socialCalendarDayDetails");

$("#generateCaptionBtn").addEventListener("click", () => {
  const platform = $("#socialPlatform").value;
  const concept = $("#socialConcept").value || "today's piece";
  const base = [
    `Little look at ${concept} from the studio today.`,
    `Really stoked on how this ${concept} turned out.`,
    `Had a lot of fun with this ${concept}.`,
    `${concept} from today's session.`
  ];
  const line = base[(Math.random() * base.length) | 0];
  $("#socialCaption").value = line + (platform === "Instagram" ? " 🖤" : "");
});
$("#improveCaptionBtn").addEventListener("click", () => {
  const txt = $("#socialCaption").value || "";
  if (!txt) return;
  $("#socialCaption").value = txt + " | Book via DM or link in bio.";
});
$("#generateHashtagsBtn").addEventListener("click", () => {
  const base = ["#tattoo", "#tattooartist", "#blackwork", "#darkart", "#inked", "#tattoosofinstagram"];
  $("#socialHashtags").value = base.join(" ");
});

socialForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const plan = {
    id: $("#editingSocialId").value || crypto.randomUUID(),
    platform: $("#socialPlatform").value,
    date: $("#socialDate").value,
    concept: $("#socialConcept").value.trim(),
    caption: $("#socialCaption").value.trim(),
    hashtags: $("#socialHashtags").value.trim(),
    notes: $("#socialNotes").value.trim()
  };
  if (!plan.concept) return;
  const idx = socialPlans.findIndex((p) => p.id === plan.id);
  if (idx !== -1) socialPlans[idx] = plan;
  else socialPlans.push(plan);
  $("#editingSocialId").value = "";
  cancelEditSocialBtn.classList.add("hidden");
  socialForm.reset();
  saveAll();
  renderSocialPlans();
  renderSocialCalendar();
});

cancelEditSocialBtn.addEventListener("click", () => {
  $("#editingSocialId").value = "";
  cancelEditSocialBtn.classList.add("hidden");
  socialForm.reset();
});

function renderSocialPlans() {
  socialPlansList.innerHTML = "";
  const sorted = [...socialPlans].sort((a,b) => (a.date || "").localeCompare(b.date || ""));
  sorted.forEach((p) => {
    const card = document.createElement("div");
    card.innerHTML = `
      <div><strong>${p.platform}</strong> – ${p.date || "No date"}</div>
      <div>${p.concept}</div>
      <div class="small-text muted">${p.caption}</div>
    `;
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.gap = "0.4rem";
    row.style.marginTop = "0.35rem";
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "btn-small";
    editBtn.addEventListener("click", () => {
      $("#editingSocialId").value = p.id;
      $("#socialPlatform").value = p.platform;
      $("#socialDate").value = p.date;
      $("#socialConcept").value = p.concept;
      $("#socialCaption").value = p.caption;
      $("#socialHashtags").value = p.hashtags;
      $("#socialNotes").value = p.notes;
      cancelEditSocialBtn.classList.remove("hidden");
      pages.forEach((pg) => pg.classList.remove("active"));
      $("#page-social").classList.add("active");
      navButtons.forEach((b) => b.classList.remove("active"));
      document.querySelector('[data-page="social"]').classList.add("active");
      pageTitle.textContent = "Social";
    });
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "btn-small secondary";
    delBtn.addEventListener("click", () => {
      if (!confirm("Delete this plan?")) return;
      socialPlans = socialPlans.filter((x) => x.id !== p.id);
      saveAll();
      renderSocialPlans();
      renderSocialCalendar();
    });
    row.appendChild(editBtn);
    row.appendChild(delBtn);
    card.appendChild(row);
    socialPlansList.appendChild(card);
  });
  if (sorted.length > 0) {
    const last = sorted[sorted.length - 1];
    lastSocialSummary.textContent = `Last planned: ${last.platform} – ${last.date || "No date"} – ${last.concept}`;
  } else {
    lastSocialSummary.textContent = "No planned posts yet.";
  }
}

// SOCIAL CALENDAR
$("#socialCalPrev").addEventListener("click", () => {
  socialCalMonthOffset--;
  renderSocialCalendar();
});
$("#socialCalNext").addEventListener("click", () => {
  socialCalMonthOffset++;
  renderSocialCalendar();
});

function renderSocialCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  let month = now.getMonth() + socialCalMonthOffset;
  let displayYear = year;
  while (month < 0) { month += 12; displayYear--; }
  while (month > 11) { month -= 12; displayYear++; }
  const first = new Date(displayYear, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(displayYear, month + 1, 0).getDate();
  socialCalMonthLabel.textContent =
    first.toLocaleString(undefined, { month: "long", year: "numeric" });

  socialCalendarGrid.innerHTML = "";
  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];
  dayNames.forEach((d) => {
    const div = document.createElement("div");
    div.textContent = d;
    div.className = "calendar-day-label";
    socialCalendarGrid.appendChild(div);
  });
  for (let i = 0; i < startDay; i++) {
    const div = document.createElement("div");
    div.className = "calendar-day-empty";
    socialCalendarGrid.appendChild(div);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const div = document.createElement("div");
    div.className = "calendar-day";
    const dateStr = new Date(displayYear, month, day).toISOString().slice(0,10);
    const hasSocial = socialPlans.some((p) => p.date === dateStr);
    if (hasSocial) div.classList.add("has-social");
    div.textContent = String(day);
    div.addEventListener("click", () => {
      const dayPosts = socialPlans.filter((p) => p.date === dateStr);
      if (dayPosts.length === 0) {
        socialCalendarDayDetails.textContent = "No planned posts on this date.";
      } else {
        socialCalendarDayDetails.innerHTML = dayPosts
          .map((p) => `${p.platform} – ${p.concept}`)
          .join("<br>");
      }
    });
    socialCalendarGrid.appendChild(div);
  }
}

// SOCIAL INSPO
const socialInspoPlatform = $("#socialInspoPlatform");
const socialInspoIdea = $("#socialInspoIdea");
const socialInspoList = $("#socialInspoList");
$("#generateSocialInspoBtn").addEventListener("click", () => {
  const plat = socialInspoPlatform.value;
  const ideas = {
    Instagram: [
      "Post a healed close-up of a recent blackwork piece with a story about the client.",
      "Share a 3-image carousel: sketch, stencil on skin, finished piece.",
      "Do a flash sheet preview for upcoming booking day."
    ],
    TikTok: [
      "Quick before/after transition from bare skin to finished tattoo.",
      "15-second process montage with lo-fi music.",
      "Tattoo care tip with a piece in the background."
    ],
    Facebook: [
      "Show a large healed piece and ask followers what theme they'd pick for a sleeve.",
      "Share a client testimonial with their tattoo.",
      "Announce limited flash slots with a collage."
    ],
    Other: [
      "Share your workspace vibes and tools.",
      "Post a time-lapse of you drawing flash.",
      "Ask followers what they want to see more of."
    ]
  };
  const list = ideas[plat] || ideas.Other;
  const idea = list[(Math.random() * list.length) | 0];
  socialInspoIdea.textContent = idea;
});
$("#pinSocialInspoBtn").addEventListener("click", () => {
  const text = socialInspoIdea.textContent.trim();
  if (!text) return;
  socialInspo.push({
    id: crypto.randomUUID(),
    platform: socialInspoPlatform.value,
    idea: text
  });
  saveAll();
  renderSocialInspo();
});
function renderSocialInspo() {
  socialInspoList.innerHTML = "";
  socialInspo.forEach((i) => {
    const card = document.createElement("div");
    card.innerHTML = `<div><strong>${i.platform}</strong></div><div class="small-text muted">${i.idea}</div>`;
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "btn-small secondary";
    delBtn.style.marginTop = "0.35rem";
    delBtn.addEventListener("click", () => {
      socialInspo = socialInspo.filter((x) => x.id !== i.id);
      saveAll();
      renderSocialInspo();
    });
    card.appendChild(delBtn);
    socialInspoList.appendChild(card);
  });
}

// ===== FINANCE =====
const incomeForm = $("#incomeForm");
const incomeList = $("#incomeList");
const incomeSearch = $("#incomeSearch");
const expenseForm = $("#expenseForm");
const expenseList = $("#expenseList");
const expenseSearch = $("#expenseSearch");

incomeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const inc = {
    id: crypto.randomUUID(),
    name: $("#incomeName").value.trim(),
    date: $("#incomeDate").value,
    amount: parseFloat($("#incomeAmount").value || "0")
  };
  if (!inc.name || !inc.date || !inc.amount) return;
  incomes.push(inc);
  incomeForm.reset();
  saveAll();
  renderIncome();
});

expenseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const exp = {
    id: crypto.randomUUID(),
    name: $("#expenseName").value.trim(),
    tag: $("#expenseTag").value.trim(),
    date: $("#expenseDate").value,
    amount: parseFloat($("#expenseAmount").value || "0")
  };
  if (!exp.name || !exp.date || !exp.amount) return;
  expenses.push(exp);
  expenseForm.reset();
  saveAll();
  renderExpenses();
});

incomeSearch.addEventListener("input", renderIncome);
expenseSearch.addEventListener("input", renderExpenses);

function renderIncome() {
  const q = incomeSearch.value.trim().toLowerCase();
  incomeList.innerHTML = "";
  incomes.forEach((i) => {
    if (q && !i.name.toLowerCase().includes(q) && !i.date.includes(q)) return;
    const card = document.createElement("div");
    card.innerHTML = `
      <div><strong>${i.name}</strong> – ${i.date}</div>
      <div>$${i.amount.toFixed(2)}</div>
    `;
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "btn-small secondary";
    delBtn.style.marginTop = "0.35rem";
    delBtn.addEventListener("click", () => {
      if (!confirm("Delete this income?")) return;
      incomes = incomes.filter((x) => x.id !== i.id);
      saveAll();
      renderIncome();
    });
    card.appendChild(delBtn);
    incomeList.appendChild(card);
  });
}

function renderExpenses() {
  const q = expenseSearch.value.trim().toLowerCase();
  expenseList.innerHTML = "";
  expenses.forEach((e) => {
    if (q && !e.name.toLowerCase().includes(q) && !e.tag.toLowerCase().includes(q) && !e.date.includes(q)) return;
    const card = document.createElement("div");
    card.innerHTML = `
      <div><strong>${e.name}</strong> – ${e.date}</div>
      <div class="small-text muted">${e.tag || ""}</div>
      <div>$${e.amount.toFixed(2)}</div>
    `;
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "btn-small secondary";
    delBtn.style.marginTop = "0.35rem";
    delBtn.addEventListener("click", () => {
      if (!confirm("Delete this expense?")) return;
      expenses = expenses.filter((x) => x.id !== e.id);
      saveAll();
      renderExpenses();
    });
    card.appendChild(delBtn);
    expenseList.appendChild(card);
  });
}

// INITIAL RENDER
renderTasks();
renderSessions();
renderHomeFromSessions();
renderBookingCalendar();
ensureClientGroupsSelectOptions();
renderClientsList();
renderInspoIdeas();
renderSocialPlans();
renderSocialCalendar();
renderSocialInspo();
renderIncome();
renderExpenses();

// REGISTER SW
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js").catch(() => {});
}
