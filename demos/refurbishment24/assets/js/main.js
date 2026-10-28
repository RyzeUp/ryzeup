/* refurbishment24 — site script (no build step) */

/* =====================================================================
   SITE SETTINGS — the only block you should need to edit
   ===================================================================== */
const SITE = {
  // true = show the "Draft preview" bar, dashed "To confirm" markers and
  // the reviews placeholder. Set to false before going live.
  draft: false,

  // WhatsApp number in international format, digits only (no +, no spaces).
  // PLACEHOLDER: 07700 900000 is an Ofcom drama number, not Greg's.
  whatsapp: "447700900000",

  // Formspree form ID (the part after https://formspree.io/f/).
  // Leave empty until set up; the "Send by email" button then explains that.
  formspreeId: "",

  // Area map: centre (lat, lng), radius in miles, and the base town label.
  area: {
    center: [52.8030, -1.6400],   // Burton upon Trent
    radiusMiles: 25,
    label: "Burton upon Trent"
  },

  // Claims that still need confirming with Greg. Set any that are NOT true
  // to false and they are removed from the page. (Gas Safe: only if he does
  // gas work himself. NICEIC: only if he does notifiable electrical work.)
  claims: {
    years: true,        // "10+ years" (hero tile + about)
    insurance: true,    // Public liability insurance
    guarantee: true,    // Workmanship guarantee
    freeQuotes: true,   // Free quotes (Checkatrade lists "free estimates")
    trustmark: true,    // TrustMark
    checkatrade: true,  // Checkatrade (confirmed: member since Feb 2023)
    niceic: true,       // NICEIC
    gasSafe: true       // Gas Safe registered
  }
};
/* ===================================================================== */

(function () {
  "use strict";
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- draft mode + claims ---------- */
  if (SITE.draft) root.classList.add("is-draft");
  Object.keys(SITE.claims).forEach(function (key) {
    if (SITE.claims[key]) return;
    document.querySelectorAll('[data-claim="' + key + '"]').forEach(function (el) {
      // the hero "years" tile: hide the whole tile so the wall stays filled
      const tile = el.closest(".hero-years");
      if (tile) {
        tile.innerHTML = '<a class="years-cta" href="#quote">Get a quote <svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a>';
      }
      else el.remove();
    });
  });

  /* ---------- year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- hero: tiles set into the wall ---------- */
  const wall = document.querySelector(".hero-wall");
  if (wall) {
    wall.querySelectorAll(":scope > .tile").forEach(function (t, i) { t.style.setProperty("--i", i); });
    if (!reduceMotion) root.classList.add("motion");

  }

  /* ---------- before / after sliders ---------- */
  document.querySelectorAll("[data-ba]").forEach(function (ba) {
    const handle = ba.querySelector(".ba-handle");
    let pos = 50;
    let touched = false;

    const set = function (p) {
      pos = Math.max(0, Math.min(100, p));
      ba.style.setProperty("--pos", pos + "%");
      handle.setAttribute("aria-valuenow", Math.round(pos));
      handle.setAttribute("aria-valuetext", "Showing " + Math.round(pos) + "% before");
    };
    const fromEvent = function (e) {
      const r = ba.getBoundingClientRect();
      set(((e.clientX - r.left) / r.width) * 100);
    };

    ba.addEventListener("pointerdown", function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      touched = true;
      ba.setPointerCapture(e.pointerId);
      ba.classList.add("is-dragging");
      fromEvent(e);
    });
    ba.addEventListener("pointermove", function (e) {
      if (ba.classList.contains("is-dragging")) fromEvent(e);
    });
    const stop = function () { ba.classList.remove("is-dragging"); };
    ba.addEventListener("pointerup", stop);
    ba.addEventListener("pointercancel", stop);

    handle.addEventListener("keydown", function (e) {
      const step = e.shiftKey ? 20 : 5;
      let next = null;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = pos - step;
      else if (e.key === "ArrowRight" || e.key === "ArrowUp") next = pos + step;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = 100;
      else if (e.key === "PageDown") next = pos - 20;
      else if (e.key === "PageUp") next = pos + 20;
      if (next === null) return;
      e.preventDefault();
      touched = true;
      set(next);
    });

    // one gentle nudge the first time it scrolls into view
    if (!reduceMotion && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          io.disconnect();
          const frames = [50, 60, 40, 50];
          const t0 = performance.now(), dur = 1300;
          const tick = function (now) {
            if (touched) return;
            const t = Math.min(1, (now - t0) / dur);
            const seg = t * (frames.length - 1);
            const i = Math.min(frames.length - 2, Math.floor(seg));
            const k = seg - i;
            const ease = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
            set(frames[i] + (frames[i + 1] - frames[i]) * ease);
            if (t < 1) requestAnimationFrame(tick);
          };
          setTimeout(function () { requestAnimationFrame(tick); }, 250);
        });
      }, { threshold: 0.6 });
      io.observe(ba);
    }
    set(50);
  });

  /* ---------- area map (Leaflet + OpenStreetMap) ---------- */
  const mapEl = document.getElementById("area-map");
  if (mapEl && window.L) {
    try {
      const a = SITE.area;
      const radiusM = a.radiusMiles * 1609.34;
      const bounds = L.latLng(a.center).toBounds(radiusM * 2);
      const map = L.map(mapEl, {
        scrollWheelZoom: false,       // don't hijack page scrolling
        dragging: !L.Browser.mobile,  // on phones, one finger scrolls the page
        tap: false,
        zoomControl: true,
        attributionControl: true
      }).fitBounds(bounds, { padding: [16, 16] });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 15,
        minZoom: 7,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      L.circle(a.center, {
        radius: radiusM,
        color: "#c96f07",
        weight: 3,
        fillColor: "#f7931e",
        fillOpacity: 0.16
      }).addTo(map);
      L.marker(a.center, {
        icon: L.divIcon({ className: "map-pin", html: "<span></span>", iconSize: [22, 22], iconAnchor: [11, 11] }),
        keyboard: false,
        title: a.label
      }).addTo(map).bindTooltip(a.label, { permanent: true, direction: "right", offset: [12, 0], className: "map-label" });
      window.addEventListener("resize", function () {
        map.invalidateSize();
        map.fitBounds(bounds, { padding: [16, 16] });
      }, { passive: true });
    } catch (err) {
      // never let a map problem break the rest of the page (e.g. the quote form)
      console.error("Area map failed:", err);
      mapEl.innerHTML = '<p class="map-fallback">Based in ' + SITE.area.label + ', covering about ' + SITE.area.radiusMiles + ' miles around.</p>';
    }
  } else if (mapEl) {
    mapEl.innerHTML = '<p class="map-fallback">Based in ' + SITE.area.label + ', covering about ' + SITE.area.radiusMiles + ' miles around.</p>';
  }

  /* ---------- quote form ---------- */
  const form = document.getElementById("quote-form");
  if (!form) return;
  const status = form.querySelector(".form-status");
  const f = function (name) { return form.elements[name]; };

  const showError = function (input, msg) {
    const err = document.getElementById(input.getAttribute("aria-describedby"));
    if (msg) {
      input.setAttribute("aria-invalid", "true");
      if (err) { err.textContent = msg; err.hidden = false; }
    } else {
      input.removeAttribute("aria-invalid");
      if (err) { err.textContent = ""; err.hidden = true; }
    }
  };

  const checks = {
    name: function (v) { return v.trim().length < 2 ? "Please enter your name so Greg knows who to ask for." : ""; },
    phone: function (v) {
      const digits = v.replace(/[^\d]/g, "");
      if (!digits) return "Please add a phone number so Greg can call you back.";
      if (digits.length < 10 || digits.length > 13) return "That number looks too short or long. Try something like 07700 900123.";
      return "";
    },
    town: function (v) { return v.trim().length < 2 ? "Which town or village is the job in? This helps Greg plan the visit." : ""; },
    job: function (v) { return v ? "" : "Choose the type of job (or \"Something else\")."; },
    email: function (v, via) {
      if (via === "email" && !v.trim()) return "Add your email address so Greg can reply, or send on WhatsApp instead.";
      if (v.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return "That email address doesn't look right. Check for a missing @ or dot.";
      return "";
    }
  };

  const validate = function (via) {
    let first = null;
    Object.keys(checks).forEach(function (name) {
      const input = f(name);
      const msg = checks[name](input.value, via);
      showError(input, msg);
      if (msg && !first) first = input;
    });
    if (first) first.focus();
    return !first;
  };

  // re-check a field as soon as the user fixes it
  Object.keys(checks).forEach(function (name) {
    const input = f(name);
    const ev = input.tagName === "SELECT" ? "change" : "input";
    input.addEventListener(ev, function () {
      if (input.getAttribute("aria-invalid") === "true") showError(input, checks[name](input.value, null));
    });
  });

  const setStatus = function (msg, kind) {
    status.textContent = msg;
    status.className = "form-status" + (kind ? " is-" + kind : "");
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const via = (e.submitter && e.submitter.value) || "whatsapp";
    setStatus("", null);
    if (f("_gotcha").value) return; // bot
    if (!validate(via)) { setStatus("Please fix the highlighted fields.", "err"); return; }

    const data = {
      name: f("name").value.trim(),
      phone: f("phone").value.trim(),
      town: f("town").value.trim(),
      email: f("email").value.trim(),
      job: f("job").value,
      message: f("message").value.trim()
    };

    if (via === "whatsapp") {
      const lines = [
        "Hi Greg, I'd like a quote please.",
        "",
        "Job: " + data.job,
        "Name: " + data.name,
        "Town: " + data.town,
        "Phone: " + data.phone
      ];
      if (data.email) lines.push("Email: " + data.email);
      if (data.message) lines.push("", data.message);
      const url = "https://wa.me/" + SITE.whatsapp + "?text=" + encodeURIComponent(lines.join("\n"));
      const win = window.open(url, "_blank", "noopener");
      if (!win) window.location.href = url;
      setStatus("WhatsApp should now be open with your message ready. Just press send.", "ok");
      return;
    }

    // email via Formspree
    if (!SITE.formspreeId) {
      setStatus("Email sending isn't switched on yet. Please use WhatsApp or call 07700 900000.", "err");
      return;
    }
    const btns = form.querySelectorAll("button[type=submit]");
    btns.forEach(function (b) { b.disabled = true; });
    setStatus("Sending…", null);
    fetch("https://formspree.io/f/" + SITE.formspreeId, {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({ _subject: "Quote request: " + data.job + " in " + data.town }, data))
    }).then(function (r) {
      if (!r.ok) throw new Error("bad");
      form.reset();
      setStatus("Thanks, " + data.name.split(" ")[0] + ". Your message is with Greg and he'll be in touch.", "ok");
    }).catch(function () {
      setStatus("Sorry, that didn't send. Please try again, or call 07700 900000.", "err");
    }).finally(function () {
      btns.forEach(function (b) { b.disabled = false; });
    });
  });
})();
