// Tattoo Studio Hub – localStorage only, no backend.
(function () {
  const $ = (id) => document.getElementById(id);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const load = (k, fb) => {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; }
  };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const uid = (p) => p + "_" + Math.random().toString(36).slice(2, 9);

  let sessions = load("tsh_sessions", []);
  let tasks = load("tsh_tasks", []);
  let flashSheets = load("tsh_flashSheets", []);
  let inspoIdeas = load("tsh_inspoIdeas", []);
  let socialPlans = load("tsh_socialPlans", []);
  let socialInspoPinned = load("tsh_socialInspo", []);
  let incomeEntries = load("tsh_income", []);
  let expenseEntries = load("tsh_expenses", []);
  let clientGroups = load("tsh_clientGroups", []);
  let clients = load("tsh_clients", []);

  const getDateTime = (s) => new Date((s.date || "1970-01-01") + "T" + (s.time || "00:00"));

  function ensureClientForSession(s) {
    const name = (s.clientName || "").trim();
    if (!name) return;
    let c = clients.find((x) => x.name.toLowerCase() === name.toLowerCase());
    if (!c) {
      c = { id: uid("client"), name, contact: s.contact || "", groupId: "", notesThem: "", notesSession: "" };
      clients.push(c);
      save("tsh_clients", clients);
    } else if (s.contact && !c.contact) {
      c.contact = s.contact;
      save("tsh_clients", clients);
    }
  }
  sessions.forEach(ensureClientForSession);

  // NAV
  const menuToggle = $("menuToggle");
  const topNav = $("topNav");
  const pageTitle = $("pageTitle");
  const pages = qsa(".page");
  const navBtns = qsa(".nav-btn");

  function showPage(name) {
    pages.forEach(p => p.classList.toggle("active", p.id === "page-" + name));
    navBtns.forEach(b => b.classList.toggle("active", b.dataset.page === name));
    pageTitle.textContent = { home:"Home", booking:"Booking", clients:"Clients", inspiration:"Inspo", social:"Social", finance:"Finance" }[name] || "Studio Hub";
    if (name === "booking") renderBookingCalendar();
    if (name === "social") renderSocialCalendar();
    if (name === "clients") renderClientList();
    if (name === "inspiration") renderInspoList();
    if (name === "finance") { renderIncome(); renderExpenses(); }
  }

  menuToggle.addEventListener("click", () => topNav.classList.toggle("open"));
  navBtns.forEach(btn => btn.addEventListener("click", () => {
    showPage(btn.dataset.page);
    topNav.classList.remove("open");
  }));

  // HOME: NEXT SESSION
  function renderHomeNextSession() {
    const el = $("homeNextSession");
    const now = new Date();
    const future = sessions
      .filter(s => s.date)
      .map(s => ({ s, dt: getDateTime(s) }))
      .filter(x => x.dt >= now)
      .sort((a,b) => a.dt - b.dt);
    if (!future.length) {
      el.textContent = "No upcoming sessions.";
      return;
    }
    const { s, dt } = future[0];
    el.innerHTML = `<strong>${s.clientName || "Client"}</strong><br>
      ${dt.toLocaleDateString()} – ${dt.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}<br>
      ${s.placement || ""} ${s.description ? "— " + s.description : ""}`;
  }

  // HOME: TASKS
  const taskInput = $("taskInput");
  const addTaskBtn = $("addTaskBtn");
  const taskList = $("taskList");

  function renderTasks() {
    taskList.innerHTML = "";
    tasks.sort((a,b) => a.createdAt - b.createdAt);
    for (const t of tasks) {
      const li = document.createElement("li");
      const left = document.createElement("div");
      const right = document.createElement("div");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = t.done;
      cb.addEventListener("change", () => {
        t.done = cb.checked;
        save("tsh_tasks", tasks);
        renderTasks();
      });
      const span = document.createElement("span");
      span.textContent = t.text;
      if (t.done) span.style.textDecoration = "line-through";
      left.appendChild(cb); left.appendChild(span);

      const del = document.createElement("button");
      del.textContent = "✕";
      del.className = "btn-small secondary";
      del.style.fontSize = "0.7rem";
      del.addEventListener("click", () => {
        tasks = tasks.filter(x => x.id !== t.id);
        save("tsh_tasks", tasks);
        renderTasks();
      });
      right.appendChild(del);

      li.appendChild(left); li.appendChild(right);
      taskList.appendChild(li);
    }
  }
  addTaskBtn.addEventListener("click", () => {
    const text = taskInput.value.trim();
    if (!text) return;
    tasks.push({ id: uid("task"), text, done:false, createdAt:Date.now() });
    save("tsh_tasks", tasks);
    taskInput.value = "";
    renderTasks();
  });
  taskInput.addEventListener("keydown", e => e.key === "Enter" && addTaskBtn.click());

  // HOME: FLASH SHEETS
  const motifs = ["mushrooms","moth","skull","fern","dagger","gauntlet","tarot card","snake","crescent moon","eye","wolf","lantern"];
  const flashPromptInput = $("flashPromptInput");
  const generateFlashBtn = $("generateFlashBtn");
  const flashIdeasList = $("flashIdeasList");

  function makeFlashSheet(prompt) {
    const ideas = [];
    for (let i=0;i<4;i++) {
      const motif = motifs[Math.floor(Math.random()*motifs.length)];
      const detail = ["heavy black shading","bold negative space","engraving-style linework","occult framing","medieval border","fine stippling"][Math.floor(Math.random()*6)];
      ideas.push(`${motif} (${detail}) inspired by "${prompt || "dark medieval blackwork"}"`);
    }
    return ideas;
  }

  function renderFlashSheets() {
    flashIdeasList.innerHTML = "";
    flashSheets.sort((a,b) => b.createdAt - a.createdAt);
    for (const sheet of flashSheets) {
      const li = document.createElement("li");
      li.style.flexDirection = "column";
      const title = document.createElement("div");
      title.textContent = sheet.prompt || "Flash sheet";
      const ul = document.createElement("ul");
      ul.style.margin = "0.25rem 0";
      ul.style.paddingLeft = "1rem";
      for (const idea of sheet.ideas) {
        const li2 = document.createElement("li");
        li2.textContent = "• " + idea;
        li2.style.fontSize = "0.8rem";
        ul.appendChild(li2);
      }
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "flex-end";
      row.style.gap = "0.35rem";
      const pin = document.createElement("button");
      pin.textContent = sheet.pinned ? "Pinned" : "Pin to Inspo";
      pin.className = "btn-small" + (sheet.pinned ? " secondary" : "");
      pin.style.fontSize = "0.7rem";
      pin.addEventListener("click", () => {
        if (!sheet.pinned) {
          inspoIdeas.push({
            id: uid("inspo"),
            name: sheet.prompt || "Flash sheet",
            tier: "flash",
            idea: sheet.ideas.join("\n"),
            createdAt: Date.now()
          });
          save("tsh_inspoIdeas", inspoIdeas);
          renderInspoList();
        }
        sheet.pinned = true;
        save("tsh_flashSheets", flashSheets);
        renderFlashSheets();
      });
      const del = document.createElement("button");
      del.textContent = "Delete";
      del.className = "btn-small secondary";
      del.style.fontSize = "0.7rem";
      del.addEventListener("click", () => {
        flashSheets = flashSheets.filter(x => x.id !== sheet.id);
        save("tsh_flashSheets", flashSheets);
        renderFlashSheets();
      });
      row.appendChild(pin); row.appendChild(del);
      li.appendChild(title); li.appendChild(ul); li.appendChild(row);
      flashIdeasList.appendChild(li);
    }
  }
  generateFlashBtn.addEventListener("click", () => {
    const prompt = flashPromptInput.value.trim();
    const ideas = makeFlashSheet(prompt);
    flashSheets.push({ id: uid("flash"), prompt, ideas, pinned:false, createdAt:Date.now() });
    save("tsh_flashSheets", flashSheets);
    renderFlashSheets();
  });

  // HOME: QUICK FINANCE
  $("quickIncomeSave").addEventListener("click", () => {
    const name = $("quickIncomeName").value.trim();
    const amt = parseFloat($("quickIncomeAmount").value || "0");
    if (!name || !amt) return;
    const today = new Date().toISOString().slice(0,10);
    incomeEntries.push({ id:uid("inc"), name, date:today, amount:amt, createdAt:Date.now() });
    save("tsh_income", incomeEntries);
    $("quickIncomeName").value = "";
    $("quickIncomeAmount").value = "";
  });
  $("quickExpenseSave").addEventListener("click", () => {
    const name = $("quickExpenseName").value.trim();
    const amt = parseFloat($("quickExpenseAmount").value || "0");
    if (!name || !amt) return;
    const today = new Date().toISOString().slice(0,10);
    expenseEntries.push({ id:uid("exp"), name, tag:"", date:today, amount:amt, createdAt:Date.now() });
    save("tsh_expenses", expenseEntries);
    $("quickExpenseName").value = "";
    $("quickExpenseAmount").value = "";
  });

  // HOME: TIMER
  let timerSec = 0;
  let timerRunning = false;
  let timerInterval = null;
  const timerDisplay = $("timerDisplay");
  function updateTimer() {
    const s = Math.max(0, Math.floor(timerSec));
    const m = String(Math.floor(s/60)).padStart(2,"0");
    const sec = String(s%60).padStart(2,"0");
    timerDisplay.textContent = m + ":" + sec;
  }
  qsa(".timer-buttons button").forEach(b => {
    b.addEventListener("click", () => {
      timerSec = parseInt(b.dataset.min,10)*60;
      timerRunning = false;
      if (timerInterval) clearInterval(timerInterval);
      updateTimer();
    });
  });
  $("startTimerBtn").addEventListener("click", () => {
    if (timerRunning || !timerSec) return;
    timerRunning = true;
    timerInterval = setInterval(() => {
      if (!timerRunning) return;
      timerSec -= 1;
      if (timerSec <= 0) {
        timerSec = 0; timerRunning = false; clearInterval(timerInterval);
      }
      updateTimer();
    },1000);
  });
  $("stopTimerBtn").addEventListener("click", () => { timerRunning = false; if (timerInterval) clearInterval(timerInterval); });
  $("resetTimerBtn").addEventListener("click", () => { timerRunning=false; timerSec=0; if (timerInterval) clearInterval(timerInterval); updateTimer(); });
  updateTimer();

  // FOLLOW-UPS (HOME)
  const contactTodayList = $("contactTodayList");
  const nextFollowupInfo = $("nextFollowupInfo");
  function getFollowups() {
    const arr = [];
    for (const s of sessions) {
      if (!s.date) continue;
      const base = new Date(s.date);
      const oneW = new Date(base.getTime() + 7*24*3600*1000);
      const oneM = new Date(base.getTime() + 30*24*3600*1000);
      arr.push({ clientName:s.clientName, type:"1 week check-in", date: oneW.toISOString().slice(0,10) });
      arr.push({ clientName:s.clientName, type:"1 month check-in", date: oneM.toISOString().slice(0,10) });
    }
    return arr;
  }
  function renderHomeFollowups() {
    contactTodayList.innerHTML = "";
    nextFollowupInfo.textContent = "";
    const todayStr = new Date().toISOString().slice(0,10);
    const all = getFollowups().sort((a,b) => a.date.localeCompare(b.date));
    const today = all.filter(f => f.date === todayStr);
    const upcoming = all.filter(f => f.date >= todayStr);
    if (today.length) {
      for (const f of today) {
        const li = document.createElement("li");
        li.innerHTML = `<span><strong>${f.clientName || "Client"}</strong> – ${f.type}</span>`;
        contactTodayList.appendChild(li);
      }
    } else if (upcoming.length) {
      const n = upcoming[0];
      nextFollowupInfo.textContent = `Next follow-up: ${n.clientName || "Client"} (${n.type}) on ${new Date(n.date).toLocaleDateString()}`;
    } else {
      nextFollowupInfo.textContent = "No follow-ups scheduled.";
    }
  }

  // MESSAGE GENERATOR
  const generateMessageBtn = $("generateMessageBtn");
  const messageIdea = $("messageIdea");
  const msgTemplates = [
    (n) => `Hey ${n}, just checking in on your tattoo from last session – how's the healing going? If anything feels off, message me.`,
    (n) => `Hi ${n}! Wanted to see how you're feeling about your piece now that you've had some time with it. If you want to plan the next one, I'm down.`,
    (n) => `Yo ${n}, hope you're doing good. If you can, send me an updated pic of your tattoo when you get a chance – I love seeing how they heal.`
  ];
  generateMessageBtn.addEventListener("click", () => {
    const today = getFollowups().filter(f => f.date === new Date().toISOString().slice(0,10));
    const name = (today[0] && today[0].clientName) || "friend";
    const tmpl = msgTemplates[Math.floor(Math.random()*msgTemplates.length)];
    messageIdea.textContent = tmpl(name);
  });

  // BOOKING
  const bookingForm = $("bookingForm");
  const bookingSessionsList = $("bookingSessionsList");
  const cancelEditSessionBtn = $("cancelEditSessionBtn");

  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = $("editingSessionId").value || uid("sess");
    const s = {
      id,
      clientName: $("bookingClientName").value.trim(),
      contact: $("bookingContact").value.trim(),
      date: $("bookingDate").value,
      time: $("bookingTime").value,
      placement: $("bookingPlacement").value.trim(),
      price: parseFloat($("bookingPrice").value || "0"),
      deposit: parseFloat($("bookingDeposit").value || "0"),
      description: $("bookingDescription").value.trim()
    };
    const existing = sessions.find(x => x.id === id);
    if (existing) Object.assign(existing, s); else sessions.push(s);
    save("tsh_sessions", sessions);
    $("editingSessionId").value = "";
    cancelEditSessionBtn.classList.add("hidden");
    bookingForm.reset();
    ensureClientForSession(s);
    renderBookingSessions();
    renderBookingCalendar();
    renderHomeNextSession();
    renderHomeFollowups();
    renderClientList();
  });
  cancelEditSessionBtn.addEventListener("click", () => {
    $("editingSessionId").value = "";
    bookingForm.reset();
    cancelEditSessionBtn.classList.add("hidden");
  });

  function renderBookingSessions() {
    bookingSessionsList.innerHTML = "";
    const sorted = [...sessions].sort((a,b) => getDateTime(a)-getDateTime(b));
    for (const s of sorted) {
      const div = document.createElement("div");
      const dt = getDateTime(s);
      div.innerHTML = `<strong>${s.clientName || "Client"}</strong><br>
        ${dt.toLocaleDateString()} – ${dt.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}<br>
        ${s.placement || ""} ${s.description ? "— " + s.description : ""}`;
      const row = document.createElement("div");
      row.style.display = "flex"; row.style.gap="0.35rem"; row.style.marginTop="0.35rem";

      const edit = document.createElement("button");
      edit.textContent = "Edit";
      edit.className = "btn-small";
      edit.style.fontSize = "0.7rem";
      edit.addEventListener("click", () => {
        $("editingSessionId").value = s.id;
        $("bookingClientName").value = s.clientName || "";
        $("bookingContact").value = s.contact || "";
        $("bookingDate").value = s.date || "";
        $("bookingTime").value = s.time || "";
        $("bookingPlacement").value = s.placement || "";
        $("bookingPrice").value = s.price || "";
        $("bookingDeposit").value = s.deposit || "";
        $("bookingDescription").value = s.description || "";
        cancelEditSessionBtn.classList.remove("hidden");
        showPage("booking");
      });

      const del = document.createElement("button");
      del.textContent = "Delete";
      del.className = "btn-small secondary";
      del.style.fontSize = "0.7rem";
      del.addEventListener("click", () => {
        sessions = sessions.filter(x => x.id !== s.id);
        save("tsh_sessions", sessions);
        renderBookingSessions();
        renderBookingCalendar();
        renderHomeNextSession();
        renderHomeFollowups();
        renderClientList();
      });

      const gcal = document.createElement("button");
      gcal.textContent = "Google Calendar";
      gcal.className = "btn-small secondary";
      gcal.style.fontSize = "0.7rem";
      gcal.addEventListener("click", () => {
        const start = getDateTime(s);
        const end = new Date(start.getTime()+2*60*60*1000);
        const fmt = d => d.toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";
        const text = encodeURIComponent(`Tattoo session – ${s.clientName || "Client"}`);
        const details = encodeURIComponent(`${s.placement || ""} ${s.description || ""}`);
        const url = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${text}&dates=${fmt(start)}/${fmt(end)}&details=${details}`;
        window.open(url, "_blank");
      });

      row.appendChild(edit); row.appendChild(del); row.appendChild(gcal);
      div.appendChild(row);
      bookingSessionsList.appendChild(div);
    }
  }

  // CALENDAR helper
  function renderCalendarGrid(container, monthDate, opts) {
    container.innerHTML = "";
    const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth()+1, 0).getDate();
    const labels = ["S","M","T","W","T","F","S"];
    for (const l of labels) {
      const d = document.createElement("div");
      d.textContent = l; d.className = "calendar-day-label";
      container.appendChild(d);
    }
    for (let i=0;i<startDay;i++) {
      const d = document.createElement("div");
      d.className = "calendar-day-empty"; d.textContent = "";
      container.appendChild(d);
    }
    for (let day=1; day<=daysInMonth; day++) {
      const d = document.createElement("div");
      d.className = "calendar-day";
      const dateStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth()+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
      if (opts.hasSession && opts.hasSession(dateStr)) d.classList.add("has-session");
      if (opts.hasSocial) {
        const c = opts.hasSocial(dateStr);
        if (c) d.classList.add(c);
      }
      d.textContent = String(day);
      d.addEventListener("click", () => opts.onClickDay && opts.onClickDay(dateStr));
      container.appendChild(d);
    }
  }

  // BOOKING CALENDAR
  let bookingCalCurrent = new Date();
  function renderBookingCalendar() {
    $("calendarMonthLabel").textContent = bookingCalCurrent.toLocaleDateString(undefined,{month:"long",year:"numeric"});
    renderCalendarGrid($("bookingCalendarGrid"), bookingCalCurrent, {
      hasSession: (dateStr) => sessions.some(s => s.date === dateStr),
      onClickDay: (dateStr) => {
        const list = sessions.filter(s => s.date === dateStr).sort((a,b) => getDateTime(a)-getDateTime(b));
        const el = $("calendarDayDetails");
        if (!list.length) { el.textContent = "No sessions on this date."; return; }
        el.innerHTML = `<strong>${new Date(dateStr).toLocaleDateString()}:</strong><br>`;
        for (const s of list) {
          el.innerHTML += `${getDateTime(s).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})} – ${s.clientName || "Client"} (${s.placement || ""})<br>`;
        }
      }
    });
  }
  $("calendarPrev").addEventListener("click", () => {
    bookingCalCurrent = new Date(bookingCalCurrent.getFullYear(), bookingCalCurrent.getMonth()-1, 1);
    renderBookingCalendar();
  });
  $("calendarNext").addEventListener("click", () => {
    bookingCalCurrent = new Date(bookingCalCurrent.getFullYear(), bookingCalCurrent.getMonth()+1, 1);
    renderBookingCalendar();
  });

  // CLIENTS
  const clientSearch = $("clientSearch");
  const clientGroupFilter = $("clientGroupFilter");
  const newClientGroupName = $("newClientGroupName");
  const addClientGroupBtn = $("addClientGroupBtn");
  const clientList = $("clientList");
  const clientDetailCard = $("clientDetailCard");
  const clientDetailName = $("clientDetailName");
  const clientDetailContact = $("clientDetailContact");
  const clientDetailGroup = $("clientDetailGroup");
  const clientDetailLastSession = $("clientDetailLastSession");
  const clientDetailTotalSpend = $("clientDetailTotalSpend");
  const clientNotesThem = $("clientNotesThem");
  const clientNotesSession = $("clientNotesSession");
  const saveClientMetaBtn = $("saveClientMetaBtn");
  const saveClientNotesBtn = $("saveClientNotesBtn");
  const deleteClientBtn = $("deleteClientBtn");
  const clientSessionsList = $("clientSessionsList");
  let selectedClientId = null;

  function populateClientGroupSelects() {
    clientGroupFilter.innerHTML = '<option value="">All groups</option>';
    clientDetailGroup.innerHTML = '<option value="">No group</option>';
    for (const g of clientGroups) {
      const o1 = document.createElement("option");
      o1.value = g.id; o1.textContent = g.name;
      clientGroupFilter.appendChild(o1);
      const o2 = document.createElement("option");
      o2.value = g.id; o2.textContent = g.name;
      clientDetailGroup.appendChild(o2);
    }
  }

  function renderClientList() {
    populateClientGroupSelects();
    const search = clientSearch.value.trim().toLowerCase();
    const groupId = clientGroupFilter.value;
    clientList.innerHTML = "";
    const byNameSessions = {};
    for (const s of sessions) {
      const name = (s.clientName || "").trim();
      if (!name) continue;
      (byNameSessions[name] || (byNameSessions[name]=[])).push(s);
    }
    // ensure clients for names
    for (const name of Object.keys(byNameSessions)) {
      if (!clients.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        clients.push({ id:uid("client"), name, contact:"", groupId:"", notesThem:"", notesSession:"" });
      }
    }
    save("tsh_clients", clients);

    const filtered = clients.filter(c => {
      if (search && !c.name.toLowerCase().includes(search)) return false;
      if (groupId && c.groupId !== groupId) return false;
      return true;
    }).sort((a,b) => a.name.localeCompare(b.name));

    for (const c of filtered) {
      const li = document.createElement("li");
      const left = document.createElement("div");
      const right = document.createElement("div");
      left.innerHTML = `<strong>${c.name}</strong><br><span class="small-text">${c.contact || ""}</span>`;
      const sess = byNameSessions[c.name] || [];
      if (sess.length) {
        const last = sess.slice().sort((a,b)=>getDateTime(b)-getDateTime(a))[0];
        const span = document.createElement("span");
        span.className = "small-text muted";
        span.textContent = "Last: " + new Date(last.date).toLocaleDateString();
        left.appendChild(document.createElement("br"));
        left.appendChild(span);
      }
      const open = document.createElement("button");
      open.textContent = "Open";
      open.className = "btn-small secondary";
      open.style.fontSize = "0.7rem";
      open.addEventListener("click", () => openClientDetail(c.id));
      right.appendChild(open);
      li.appendChild(left); li.appendChild(right);
      clientList.appendChild(li);
    }
  }

  addClientGroupBtn.addEventListener("click", () => {
    const name = newClientGroupName.value.trim();
    if (!name) return;
    clientGroups.push({ id:uid("cg"), name });
    save("tsh_clientGroups", clientGroups);
    newClientGroupName.value = "";
    populateClientGroupSelects();
  });

  function openClientDetail(id) {
    selectedClientId = id;
    const c = clients.find(x => x.id === id);
    if (!c) return;
    clientDetailCard.hidden = false;
    clientDetailName.textContent = c.name;
    clientDetailContact.value = c.contact || "";
    clientDetailGroup.value = c.groupId || "";
    clientNotesThem.value = c.notesThem || "";
    clientNotesSession.value = c.notesSession || "";

    const sess = sessions.filter(s => (s.clientName || "").trim() === c.name).sort((a,b)=>getDateTime(b)-getDateTime(a));
    if (sess.length) {
      clientDetailLastSession.textContent = new Date(sess[0].date).toLocaleDateString();
      const total = sess.reduce((sum,s)=>sum+(s.price||0),0);
      clientDetailTotalSpend.textContent = total.toFixed(2);
    } else {
      clientDetailLastSession.textContent = "—";
      clientDetailTotalSpend.textContent = "0.00";
    }
    clientSessionsList.innerHTML = "";
    for (const s of sess) {
      const li = document.createElement("li");
      li.textContent = `${new Date(s.date).toLocaleDateString()} – ${s.placement || ""} ${s.price ? "($" + s.price + ")" : ""}`;
      clientSessionsList.appendChild(li);
    }
  }

  saveClientMetaBtn.addEventListener("click", () => {
    const c = clients.find(x => x.id === selectedClientId);
    if (!c) return;
    c.contact = clientDetailContact.value.trim();
    c.groupId = clientDetailGroup.value;
    save("tsh_clients", clients);
    renderClientList();
  });
  saveClientNotesBtn.addEventListener("click", () => {
    const c = clients.find(x => x.id === selectedClientId);
    if (!c) return;
    c.notesThem = clientNotesThem.value;
    c.notesSession = clientNotesSession.value;
    save("tsh_clients", clients);
  });
  deleteClientBtn.addEventListener("click", () => {
    if (!selectedClientId) return;
    clients = clients.filter(c => c.id !== selectedClientId);
    save("tsh_clients", clients);
    clientDetailCard.hidden = true;
    selectedClientId = null;
    renderClientList();
  });

  clientSearch.addEventListener("input", renderClientList);
  clientGroupFilter.addEventListener("change", renderClientList);

  // INSPO
  const inspoIdeaForm = $("inspoIdeaForm");
  const editingInspoId = $("editingInspoId");
  const inspoName = $("inspoName");
  const inspoTier = $("inspoTier");
  const inspoIdeaText = $("inspoIdeaText");
  const inspoSearch = $("inspoSearch");
  const inspoTierFilter = $("inspoTierFilter");
  const inspoIdeasList = $("inspoIdeasList");
  const generateInspoIdeaBtn = $("generateInspoIdeaBtn");
  const cancelEditInspoBtn = $("cancelEditInspoBtn");

  function generateInspoText(tier) {
    const base = "dark medieval blackwork tattoo";
    if (tier === "flash") return `${base} – small icon-style motif with bold black and clean silhouette.`;
    if (tier === "medium") return `${base} – mid-size piece, one main subject with supporting elements and balanced negative space.`;
    return `${base} – full concept scene with multiple elements, storytelling composition, and flowing placement.`;
  }

  generateInspoIdeaBtn.addEventListener("click", () => {
    inspoIdeaText.value = generateInspoText(inspoTier.value);
  });

  inspoIdeaForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = editingInspoId.value || uid("inspo");
    const obj = {
      id,
      name: inspoName.value.trim() || "Untitled idea",
      tier: inspoTier.value,
      idea: inspoIdeaText.value.trim(),
      createdAt: Date.now()
    };
    const ex = inspoIdeas.find(x => x.id === id);
    if (ex) Object.assign(ex, obj); else inspoIdeas.push(obj);
    save("tsh_inspoIdeas", inspoIdeas);
    editingInspoId.value = "";
    cancelEditInspoBtn.classList.add("hidden");
    inspoIdeaForm.reset();
    renderInspoList();
  });

  cancelEditInspoBtn.addEventListener("click", () => {
    editingInspoId.value = "";
    cancelEditInspoBtn.classList.add("hidden");
    inspoIdeaForm.reset();
  });

  function renderInspoList() {
    inspoIdeasList.innerHTML = "";
    const search = inspoSearch.value.trim().toLowerCase();
    const tier = inspoTierFilter.value;
    const arr = inspoIdeas
      .filter(i => (!search || i.name.toLowerCase().includes(search) || i.idea.toLowerCase().includes(search)))
      .filter(i => (!tier || i.tier === tier))
      .sort((a,b) => b.createdAt - a.createdAt);
    for (const i of arr) {
      const div = document.createElement("div");
      div.innerHTML = `<strong>${i.name}</strong> <span class="small-text muted">(${i.tier})</span><br>${i.idea}`;
      const row = document.createElement("div");
      row.style.display="flex"; row.style.gap="0.35rem"; row.style.marginTop="0.35rem";
      const edit = document.createElement("button");
      edit.textContent = "Edit";
      edit.className = "btn-small";
      edit.style.fontSize = "0.7rem";
      edit.addEventListener("click", () => {
        editingInspoId.value = i.id;
        inspoName.value = i.name;
        inspoTier.value = i.tier;
        inspoIdeaText.value = i.idea;
        cancelEditInspoBtn.classList.remove("hidden");
        showPage("inspiration");
      });
      const del = document.createElement("button");
      del.textContent = "Delete";
      del.className = "btn-small secondary";
      del.style.fontSize = "0.7rem";
      del.addEventListener("click", () => {
        inspoIdeas = inspoIdeas.filter(x => x.id !== i.id);
        save("tsh_inspoIdeas", inspoIdeas);
        renderInspoList();
      });
      row.appendChild(edit); row.appendChild(del);
      div.appendChild(row);
      inspoIdeasList.appendChild(div);
    }
  }
  inspoSearch.addEventListener("input", renderInspoList);
  inspoTierFilter.addEventListener("change", renderInspoList);

  // SOCIAL
  const socialForm = $("socialForm");
  const editingSocialId = $("editingSocialId");
  const socialPlatform = $("socialPlatform");
  const socialDate = $("socialDate");
  const socialConcept = $("socialConcept");
  const socialCaption = $("socialCaption");
  const socialHashtags = $("socialHashtags");
  const socialNotes = $("socialNotes");
  const cancelEditSocialBtn = $("cancelEditSocialBtn");
  const socialPlansList = $("socialPlansList");
  const lastSocialSummary = $("lastSocialSummary");
  const generateCaptionBtn = $("generateCaptionBtn");
  const improveCaptionBtn = $("improveCaptionBtn");
  const generateHashtagsBtn = $("generateHashtagsBtn");
  const socialCalPrev = $("socialCalPrev");
  const socialCalNext = $("socialCalNext");
  const socialCalMonthLabel = $("socialCalMonthLabel");
  const socialCalendarGrid = $("socialCalendarGrid");
  const socialCalendarDayDetails = $("socialCalendarDayDetails");
  const socialInspoPlatform = $("socialInspoPlatform");
  const generateSocialInspoBtn = $("generateSocialInspoBtn");
  const socialInspoIdea = $("socialInspoIdea");
  const pinSocialInspoBtn = $("pinSocialInspoBtn");
  const socialInspoList = $("socialInspoList");

  generateCaptionBtn.addEventListener("click", () => {
    const plat = socialPlatform.value;
    const piece = socialConcept.value || "this piece";
    socialCaption.value = plat === "TikTok"
      ? `Process video of ${piece}. Grab a drink, vibe out, and tell me what you think.`
      : `Little look at ${piece}. Stoked with how this one turned out – thanks for trusting me with your skin.`;
  });
  improveCaptionBtn.addEventListener("click", () => {
    if (!socialCaption.value.trim()) return;
    socialCaption.value = socialCaption.value.trim() + " 🖤";
  });
  generateHashtagsBtn.addEventListener("click", () => {
    const base = ["#tattoo","#tattoos","#tattooartist","#blackwork","#darkart"];
    socialHashtags.value = base.join(" ");
  });

  socialForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = editingSocialId.value || uid("soc");
    const obj = {
      id,
      platform: socialPlatform.value,
      date: socialDate.value,
      concept: socialConcept.value.trim(),
      caption: socialCaption.value.trim(),
      hashtags: socialHashtags.value.trim(),
      notes: socialNotes.value.trim(),
      createdAt: Date.now()
    };
    const ex = socialPlans.find(x => x.id === id);
    if (ex) Object.assign(ex, obj); else socialPlans.push(obj);
    save("tsh_socialPlans", socialPlans);
    editingSocialId.value = "";
    cancelEditSocialBtn.classList.add("hidden");
    socialForm.reset();
    renderSocialPlans();
    renderSocialCalendar();
  });
  cancelEditSocialBtn.addEventListener("click", () => {
    editingSocialId.value = ""; cancelEditSocialBtn.classList.add("hidden"); socialForm.reset();
  });

  function renderSocialPlans() {
    socialPlansList.innerHTML = "";
    const sorted = [...socialPlans].sort((a,b) => (a.date || "").localeCompare(b.date || ""));
    let last = sorted[sorted.length-1];
    if (last) {
      lastSocialSummary.textContent = `Last planned: ${last.platform} on ${last.date || "unscheduled"}`;
    } else {
      lastSocialSummary.textContent = "No posts planned yet.";
    }
    for (const p of sorted) {
      const div = document.createElement("div");
      div.innerHTML = `<strong>${p.platform}</strong> – ${p.date || "unscheduled"}<br>
        ${p.concept || ""}<br>
        <span class="small-text muted">${p.caption}</span>`;
      const row = document.createElement("div");
      row.style.display="flex"; row.style.gap="0.35rem"; row.style.marginTop="0.35rem";
      const edit = document.createElement("button");
      edit.textContent = "Edit";
      edit.className = "btn-small";
      edit.style.fontSize = "0.7rem";
      edit.addEventListener("click", () => {
        editingSocialId.value = p.id;
        socialPlatform.value = p.platform;
        socialDate.value = p.date || "";
        socialConcept.value = p.concept || "";
        socialCaption.value = p.caption || "";
        socialHashtags.value = p.hashtags || "";
        socialNotes.value = p.notes || "";
        cancelEditSocialBtn.classList.remove("hidden");
        showPage("social");
      });
      const del = document.createElement("button");
      del.textContent = "Delete";
      del.className = "btn-small secondary";
      del.style.fontSize = "0.7rem";
      del.addEventListener("click", () => {
        socialPlans = socialPlans.filter(x => x.id !== p.id);
        save("tsh_socialPlans", socialPlans);
        renderSocialPlans();
        renderSocialCalendar();
      });
      row.appendChild(edit); row.appendChild(del);
      div.appendChild(row);
      socialPlansList.appendChild(div);
    }
  }

  let socialCalCurrent = new Date();
  function renderSocialCalendar() {
    socialCalMonthLabel.textContent = socialCalCurrent.toLocaleDateString(undefined,{month:"long",year:"numeric"});
    renderCalendarGrid(socialCalendarGrid, socialCalCurrent, {
      hasSession: null,
      hasSocial: (dateStr) => {
        const posts = socialPlans.filter(p => p.date === dateStr);
        if (!posts.length) return "";
        const plats = new Set(posts.map(p => p.platform));
        if (plats.has("Instagram")) return "has-social-instagram";
        if (plats.has("TikTok")) return "has-social-tiktok";
        if (plats.has("Facebook")) return "has-social-facebook";
        return "has-session";
      },
      onClickDay: (dateStr) => {
        const posts = socialPlans.filter(p => p.date === dateStr);
        if (!posts.length) { socialCalendarDayDetails.textContent = "No posts planned this day."; return; }
        socialCalendarDayDetails.innerHTML = `<strong>${new Date(dateStr).toLocaleDateString()}:</strong><br>`;
        for (const p of posts) {
          socialCalendarDayDetails.innerHTML += `${p.platform} – ${p.concept || ""}<br>`;
        }
      }
    });
  }
  socialCalPrev.addEventListener("click", () => {
    socialCalCurrent = new Date(socialCalCurrent.getFullYear(), socialCalCurrent.getMonth()-1, 1);
    renderSocialCalendar();
  });
  socialCalNext.addEventListener("click", () => {
    socialCalCurrent = new Date(socialCalCurrent.getFullYear(), socialCalCurrent.getMonth()+1, 1);
    renderSocialCalendar();
  });

  generateSocialInspoBtn.addEventListener("click", () => {
    const plat = socialInspoPlatform.value;
    const idea =
      plat === "TikTok"
        ? "Record a quick before/after of a healed tattoo with a trending sound and simple overlay text."
        : plat === "Instagram"
        ? "Post a 3-image carousel: stencil, in-progress, and healed shot of the same piece with a short story in the caption."
        : "Share a client story + healed photo focusing on why the piece matters to them.";
    socialInspoIdea.textContent = idea;
  });
  pinSocialInspoBtn.addEventListener("click", () => {
    const txt = socialInspoIdea.textContent.trim();
    if (!txt) return;
    socialInspoPinned.push({ id:uid("sinspo"), text:txt, createdAt:Date.now() });
    save("tsh_socialInspo", socialInspoPinned);
    renderSocialInspoList();
  });
  function renderSocialInspoList() {
    socialInspoList.innerHTML = "";
    const arr = [...socialInspoPinned].sort((a,b)=>b.createdAt-a.createdAt);
    for (const i of arr) {
      const div = document.createElement("div");
      div.textContent = i.text;
      const btn = document.createElement("button");
      btn.textContent = "Delete";
      btn.className = "btn-small secondary";
      btn.style.fontSize = "0.7rem";
      btn.style.marginTop = "0.35rem";
      btn.addEventListener("click", () => {
        socialInspoPinned = socialInspoPinned.filter(x => x.id !== i.id);
        save("tsh_socialInspo", socialInspoPinned);
        renderSocialInspoList();
      });
      div.appendChild(document.createElement("br"));
      div.appendChild(btn);
      socialInspoList.appendChild(div);
    }
  }

  // FINANCE
  const incomeForm = $("incomeForm");
  const incomeName = $("incomeName");
  const incomeDate = $("incomeDate");
  const incomeAmount = $("incomeAmount");
  const incomeSearch = $("incomeSearch");
  const incomeList = $("incomeList");

  incomeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = incomeName.value.trim();
    const date = incomeDate.value;
    const amount = parseFloat(incomeAmount.value || "0");
    if (!name || !date || !amount) return;
    incomeEntries.push({ id:uid("inc"), name, date, amount, createdAt:Date.now() });
    save("tsh_income", incomeEntries);
    incomeForm.reset();
    renderIncome();
  });

  function renderIncome() {
    incomeList.innerHTML = "";
    const q = incomeSearch.value.trim().toLowerCase();
    const arr = incomeEntries
      .filter(i => !q || i.name.toLowerCase().includes(q) || i.date.includes(q))
      .sort((a,b)=>a.date.localeCompare(b.date));
    for (const i of arr) {
      const div = document.createElement("div");
      div.textContent = `${i.date} – ${i.name} ($${i.amount.toFixed(2)})`;
      incomeList.appendChild(div);
    }
  }
  incomeSearch.addEventListener("input", renderIncome);

  const expenseForm = $("expenseForm");
  const expenseName = $("expenseName");
  const expenseTag = $("expenseTag");
  const expenseDate = $("expenseDate");
  const expenseAmount = $("expenseAmount");
  const expenseSearch = $("expenseSearch");
  const expenseList = $("expenseList");

  expenseForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = expenseName.value.trim();
    const date = expenseDate.value;
    const amount = parseFloat(expenseAmount.value || "0");
    if (!name || !date || !amount) return;
    expenseEntries.push({ id:uid("exp"), name, tag:expenseTag.value.trim(), date, amount, createdAt:Date.now() });
    save("tsh_expenses", expenseEntries);
    expenseForm.reset();
    renderExpenses();
  });

  function renderExpenses() {
    expenseList.innerHTML = "";
    const q = expenseSearch.value.trim().toLowerCase();
    const arr = expenseEntries
      .filter(i => !q || i.name.toLowerCase().includes(q) || i.tag.toLowerCase().includes(q) || i.date.includes(q))
      .sort((a,b)=>a.date.localeCompare(b.date));
    for (const i of arr) {
      const div = document.createElement("div");
      div.textContent = `${i.date} – ${i.name} (${i.tag || "no tag"}) ($${i.amount.toFixed(2)})`;
      expenseList.appendChild(div);
    }
  }
  expenseSearch.addEventListener("input", renderExpenses);

  // INIT
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }

  renderHomeNextSession();
  renderTasks();
  renderFlashSheets();
  renderHomeFollowups();
  renderBookingSessions();
  renderBookingCalendar();
  renderClientList();
  renderInspoList();
  renderSocialPlans();
  renderSocialCalendar();
  renderSocialInspoList();
  renderIncome();
  renderExpenses();
})();