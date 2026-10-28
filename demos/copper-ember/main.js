/* Copper & Ember demo: all the settings a real client changes live in this block */
const SETTINGS = {
  // Formspree form endpoint, e.g. "https://formspree.io/f/abcdwxyz". Leave empty for demo mode.
  FORMSPREE_ENDPOINT: "",
  PHONE_DISPLAY: "01632 960 123",
  // Opening hours by day (0 = Sunday). [open, close] in 24h hours. null = closed.
  HOURS: { 0: [12, 17], 1: null, 2: null, 3: [17, 22], 4: [17, 22], 5: [17, 22], 6: [17, 22] },
  LAST_BOOKING_BEFORE_CLOSE: 1.5, // hours
  SLOT_MINUTES: 30,
};

document.documentElement.classList.add("js");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const fmtHour = (h) => {
  const hr = Math.floor(h), min = Math.round((h - hr) * 60);
  const suffix = hr >= 12 ? "pm" : "am";
  const h12 = ((hr + 11) % 12) + 1;
  return min ? `${h12}:${String(min).padStart(2, "0")}${suffix}` : `${h12}${suffix}`;
};

/* ---------- Open now / today in hours table ---------- */
(function openStatus() {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours() + now.getMinutes() / 60;
  const row = document.querySelector(`#hours-table tr[data-day="${day}"]`);
  if (row) row.classList.add("is-today");

  const el = document.getElementById("open-status");
  if (!el) return;
  const today = SETTINGS.HOURS[day];
  if (today && hour >= today[0] && hour < today[1]) {
    el.textContent = `Open now until ${fmtHour(today[1])}`;
    el.classList.add("is-open");
    return;
  }
  // find next opening
  for (let i = 0; i < 8; i++) {
    const d = (day + i) % 7;
    const h = SETTINGS.HOURS[d];
    if (!h) continue;
    if (i === 0 && hour >= h[0]) continue;
    const when = i === 0 ? "today" : i === 1 ? "tomorrow" : DAYS[d];
    el.textContent = `Closed now. Opens ${when} at ${fmtHour(h[0])}`;
    return;
  }
})();

/* ---------- Ticket rail ---------- */
(function rail() {
  const rail = document.getElementById("rail");
  if (!rail) return;
  const tickets = [...rail.querySelectorAll(".ticket")];
  tickets.forEach((t, i) => t.style.setProperty("--i", i));
  const prev = document.querySelector('[data-rail="prev"]');
  const next = document.querySelector('[data-rail="next"]');
  const step = () => (tickets[0]?.getBoundingClientRect().width || 240) + 18;
  const behavior = reduceMotion ? "auto" : "smooth";

  const update = () => {
    const max = rail.scrollWidth - rail.clientWidth - 2;
    prev.disabled = rail.scrollLeft <= 2;
    next.disabled = rail.scrollLeft >= max;
  };
  prev.addEventListener("click", () => rail.scrollBy({ left: -step(), behavior }));
  next.addEventListener("click", () => rail.scrollBy({ left: step(), behavior }));
  rail.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();

  rail.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); rail.scrollBy({ left: step(), behavior }); }
    if (e.key === "ArrowLeft") { e.preventDefault(); rail.scrollBy({ left: -step(), behavior }); }
    if (e.key === "Home") { e.preventDefault(); rail.scrollTo({ left: 0, behavior }); }
    if (e.key === "End") { e.preventDefault(); rail.scrollTo({ left: rail.scrollWidth, behavior }); }
  });

  // mouse drag (touch uses native swipe)
  let down = false, startX = 0, startLeft = 0, moved = false;
  rail.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    down = true; moved = false; startX = e.clientX; startLeft = rail.scrollLeft;
  });
  window.addEventListener("pointermove", (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 4) { moved = true; rail.classList.add("is-dragging"); }
    if (moved) rail.scrollLeft = startLeft - dx;
  });
  window.addEventListener("pointerup", () => {
    if (!down) return;
    down = false;
    rail.classList.remove("is-dragging");
  });
  rail.addEventListener("dragstart", (e) => e.preventDefault());

  // one gentle nudge the first time the rail is seen, to show it moves
  if (!reduceMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      if (rail.scrollWidth <= rail.clientWidth) return;
      setTimeout(() => {
        if (rail.scrollLeft > 0) return;
        rail.scrollBy({ left: 70, behavior: "smooth" });
        setTimeout(() => rail.scrollTo({ left: 0, behavior: "smooth" }), 650);
      }, 1100);
    }, { threshold: 0.6 });
    io.observe(rail);
  }
})();

/* ---------- Booking: floor plan + form ---------- */
(function booking() {
  const form = document.getElementById("book-form");
  if (!form) return;
  const tables = [...document.querySelectorAll(".table")];
  const status = document.getElementById("plan-status");
  const tableInput = document.getElementById("f-table");
  const guests = document.getElementById("f-guests");
  const date = document.getElementById("f-date");
  const time = document.getElementById("f-time");
  const msg = document.getElementById("form-msg");
  const confirm = document.getElementById("confirm");
  let picked = null;

  // taken tables (demo)
  tables.filter((t) => t.dataset.taken).forEach((t) => {
    t.setAttribute("aria-disabled", "true");
    t.setAttribute("aria-label", `${t.dataset.table}, already booked`);
  });

  const isTooSmall = (t) => Number(t.dataset.seats) < Number(guests.value);

  const refreshSizes = () => {
    tables.forEach((t) => {
      if (t.dataset.taken) return;
      const small = isTooSmall(t);
      t.setAttribute("aria-disabled", small ? "true" : "false");
      t.setAttribute("aria-label", `${t.dataset.table}, up to ${t.dataset.seats} guests${small ? ", too small for your group" : ""}`);
    });
    if (picked && isTooSmall(picked)) {
      select(null);
      status.textContent = `That table is too small for ${guests.value}. Pick another, or leave it to us.`;
    }
  };

  const select = (t) => {
    tables.forEach((x) => x.setAttribute("aria-pressed", String(x === t)));
    picked = t;
    tableInput.value = t ? t.dataset.table : "Any table";
    if (t) status.textContent = `${t.dataset.table} picked, seats up to ${t.dataset.seats}. Tap it again to let us choose.`;
    else status.textContent = "No table picked yet. You can also leave it to us.";
  };

  tables.forEach((t) => t.addEventListener("click", () => {
    if (t.dataset.taken) { status.textContent = `${t.dataset.table} is already booked tonight. Pick another table.`; return; }
    if (isTooSmall(t)) { status.textContent = `${t.dataset.table} seats up to ${t.dataset.seats}. Pick a bigger table or fewer guests.`; return; }
    select(picked === t ? null : t);
  }));
  guests.addEventListener("change", refreshSizes);
  refreshSizes();

  // dates and time slots
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = new Date();
  date.min = iso(today);
  const max = new Date(); max.setDate(max.getDate() + 90);
  date.max = iso(max);

  const fillTimes = () => {
    const chosen = time.value;
    time.innerHTML = '<option value="">Pick a time</option>';
    if (!date.value) return;
    const d = new Date(date.value + "T12:00:00");
    const h = SETTINGS.HOURS[d.getDay()];
    if (!h) return;
    const nowH = today.getHours() + today.getMinutes() / 60;
    const isToday = date.value === iso(today);
    for (let t = h[0]; t <= h[1] - SETTINGS.LAST_BOOKING_BEFORE_CLOSE; t += SETTINGS.SLOT_MINUTES / 60) {
      if (isToday && t <= nowH + 0.5) continue;
      const v = `${pad(Math.floor(t))}:${pad(Math.round((t % 1) * 60))}`;
      const o = new Option(fmtHour(t), v);
      if (v === chosen) o.selected = true;
      time.add(o);
    }
  };
  date.addEventListener("change", () => { fillTimes(); validateField("date"); });

  // validation
  const rules = {
    date: () => {
      if (!date.value) return "Pick the date you'd like to come in.";
      if (date.value < date.min) return "That date has passed. Pick today or a later date.";
      if (date.value > date.max) return "We take bookings up to 3 months ahead. Pick an earlier date.";
      const d = new Date(date.value + "T12:00:00");
      if (!SETTINGS.HOURS[d.getDay()]) return `We're closed on ${DAYS[d.getDay()]}s. Pick Wednesday to Sunday.`;
      if (time.options.length <= 1) return "There are no times left on that day. Pick another date.";
      return "";
    },
    time: () => (!time.value ? "Pick a time from the list (choose a date first)." : ""),
    guests: () => (picked && isTooSmall(picked) ? "Your table is too small for this many guests." : ""),
    name: () => (document.getElementById("f-name").value.trim().length < 2 ? "Add your name so we know who's coming." : ""),
    phone: () => {
      const digits = document.getElementById("f-phone").value.replace(/\D/g, "");
      if (!digits) return "Add a phone number in case we need to reach you.";
      if (digits.length < 10 || digits.length > 13) return "That number looks too short or long. Try a UK number like 07700 900123.";
      return "";
    },
    email: () => {
      const v = document.getElementById("f-email").value.trim();
      if (!v) return "Add your email for the confirmation.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "That email doesn't look right. Check for a missing @ or dot.";
      return "";
    },
  };
  const validateField = (name) => {
    const err = rules[name]();
    const el = document.getElementById("e-" + name);
    const input = document.getElementById("f-" + name);
    el.textContent = err;
    input.closest(".field").classList.toggle("has-error", !!err);
    input.setAttribute("aria-invalid", err ? "true" : "false");
    if (err) input.setAttribute("aria-describedby", "e-" + name); else input.removeAttribute("aria-describedby");
    return !err;
  };
  Object.keys(rules).forEach((name) => {
    const input = document.getElementById("f-" + name);
    input.addEventListener("blur", () => { if (input.value) validateField(name); });
    input.addEventListener("input", () => { if (input.closest(".field").classList.contains("has-error")) validateField(name); });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    const results = Object.keys(rules).map((n) => [n, validateField(n)]);
    const firstBad = results.find(([, ok]) => !ok);
    if (firstBad) {
      document.getElementById("f-" + firstBad[0]).focus();
      msg.textContent = "A couple of things need fixing above.";
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.setAttribute("aria-busy", "true");
    btn.textContent = "Sending...";
    try {
      if (SETTINGS.FORMSPREE_ENDPOINT) {
        const res = await fetch(SETTINGS.FORMSPREE_ENDPOINT, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error("send failed");
      } else {
        await new Promise((r) => setTimeout(r, 600)); // demo mode
      }
      showConfirm();
    } catch {
      msg.textContent = `Sorry, that didn't send. Please try again or call us on ${SETTINGS.PHONE_DISPLAY}.`;
    } finally {
      btn.removeAttribute("aria-busy");
      btn.textContent = "Send booking";
    }
  });

  const showConfirm = () => {
    const d = new Date(date.value + "T12:00:00");
    const dayStr = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
    const [hh, mm] = time.value.split(":").map(Number);
    document.getElementById("c-ref").textContent = "#" + Math.floor(1000 + Math.random() * 9000);
    document.getElementById("c-title").textContent = tableInput.value;
    document.getElementById("c-detail").textContent = `${dayStr} at ${fmtHour(hh + mm / 60)}, booked for ${document.getElementById("f-name").value.trim()}.`;
    document.getElementById("c-covers").textContent = `${guests.value} ${guests.value === "1" ? "cover" : "covers"}`;
    form.hidden = true;
    confirm.hidden = false;
    confirm.focus();
  };

  document.getElementById("book-again").addEventListener("click", () => {
    form.reset();
    select(null);
    fillTimes();
    refreshSizes();
    Object.keys(rules).forEach((n) => {
      document.getElementById("e-" + n).textContent = "";
      document.getElementById("f-" + n).closest(".field").classList.remove("has-error");
    });
    confirm.hidden = true;
    form.hidden = false;
    document.getElementById("book-title").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  });
})();

/* ---------- Header: solid once the hero has scrolled past ---------- */
(function header() {
  const h = document.getElementById("site-header");
  if (!h) return;
  const update = () => h.classList.toggle("is-solid", window.scrollY > 40);
  window.addEventListener("scroll", update, { passive: true });
  update();
})();

/* ---------- Hero video: autoplay muted, pause button, respects reduced motion ---------- */
(function heroVideo() {
  const v = document.getElementById("hero-video");
  const btn = document.getElementById("video-toggle");
  if (!v || !btn) return;
  const label = btn.querySelector(".sr-only");
  const setState = (paused) => {
    btn.setAttribute("aria-pressed", String(paused));
    label.textContent = paused ? "Play background video" : "Pause background video";
  };
  if (reduceMotion) { setState(true); btn.hidden = false; btn.addEventListener("click", () => { if (v.paused) { v.play().catch(() => {}); setState(false); } else { v.pause(); setState(true); } }); return; }
  v.muted = true;
  const p = v.play();
  if (p && p.then) p.then(() => { btn.hidden = false; setState(false); }).catch(() => { btn.hidden = false; setState(true); });
  btn.addEventListener("click", () => {
    if (v.paused) { v.play().catch(() => {}); setState(false); } else { v.pause(); setState(true); }
  });
})();

/* ---------- Menu: dish photos (hover/focus on desktop, tap opens a photo on phones) ---------- */
(function dishPhotos() {
  const rows = [...document.querySelectorAll(".dish-row[data-photo]")];
  const img = document.getElementById("preview-img");
  const cap = document.getElementById("preview-cap");
  const dialog = document.getElementById("photo-dialog");
  if (!rows.length || !img) return;
  const wide = window.matchMedia("(min-width: 961px)");
  const name = (row) => row.querySelector(".dish").textContent.replace(/\s*\((v|vg)\)\s*$/, "").trim();
  let current = null, swapTimer;

  const preview = (row) => {
    if (row === current) return;
    current = row;
    rows.forEach((r) => r.classList.toggle("is-active", r === row));
    clearTimeout(swapTimer);
    img.classList.add("is-swapping");
    swapTimer = setTimeout(() => {
      img.src = row.dataset.photo;
      img.alt = row.dataset.alt || "";
      cap.textContent = name(row);
      img.classList.remove("is-swapping");
    }, reduceMotion ? 0 : 120);
  };

  const open = (row) => {
    const di = document.getElementById("dialog-img");
    di.src = row.dataset.photo;
    di.alt = row.dataset.alt || "";
    document.getElementById("dialog-cap").textContent = name(row);
    if (dialog.showModal) dialog.showModal(); else dialog.setAttribute("open", "");
  };

  rows.forEach((row) => {
    row.setAttribute("aria-label", `${name(row)}, ${row.querySelector(".price").textContent}. Show photo`);
    row.addEventListener("mouseenter", () => { if (wide.matches) preview(row); });
    row.addEventListener("focus", () => { if (wide.matches) preview(row); });
    row.addEventListener("click", () => { if (wide.matches) preview(row); else open(row); });
  });
  rows[0].classList.add("is-active"); current = rows[0];

  // warm the cache so hover swaps are instant
  const warm = () => rows.forEach((r) => { const i = new Image(); i.src = r.dataset.photo; });
  if ("requestIdleCallback" in window) requestIdleCallback(warm); else setTimeout(warm, 1500);

  if (dialog) {
    document.getElementById("dialog-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  }
})();
