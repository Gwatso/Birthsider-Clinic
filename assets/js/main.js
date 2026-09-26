/* Birthsider Family Clinic – small, dependency-free script. */

/* ==========================================================================
   CLINIC SETTINGS – edit these once the details are confirmed.
   ========================================================================== */
const CLINIC = {
  // WhatsApp number in international format, digits only (e.g. "2637XXXXXXXX").
  whatsapp: "[WHATSAPP_LINK]",
  email: "bgwagwa@icloud.com",
  timeZone: "Africa/Harare",

  // Opening hours in 24-hour "HH:MM", clinic local time.
  // Leave as null until confirmed. Each entry is a list of sessions, e.g.
  //   weekday: [["08:00", "17:00"]]
  //   weekday: [["08:00", "13:00"], ["14:00", "19:00"]]   // two sessions
  // Filling these in updates the hours table, footer and "Open now" badge.
  hours: {
    weekday: null, // Monday – Friday
    weekend: null, // Saturday & Sunday
  },
};

const isPlaceholder = (value) => !value || /\[.*\]/.test(value);

/* ---------- Mobile navigation ---------- */
(function nav() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("site-nav");
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("is-open", open);
  };

  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
  });
  document.addEventListener("click", (e) => {
    if (menu.classList.contains("is-open") && !e.target.closest(".site-header")) setOpen(false);
  });
})();

/* ---------- Opening hours + open/closed status ---------- */
(function openingHours() {
  const DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const groupFor = (day) => (day === 0 || day === 6 ? "weekend" : "weekday");
  const toMinutes = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };

  const formatTime = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    const suffix = h >= 12 && h < 24 ? "pm" : "am";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
  };
  const formatSessions = (sessions) =>
    sessions.map(([open, close]) => `${formatTime(open)} – ${formatTime(close)}`).join(", ");

  // Current day/time at the clinic, regardless of the visitor's own time zone.
  const clinicNow = () => {
    try {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: CLINIC.timeZone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
      }).formatToParts(new Date());
      const get = (type) => parts.find((p) => p.type === type).value;
      return { day: DAY_INDEX[get("weekday")], minutes: Number(get("hour")) * 60 + Number(get("minute")) };
    } catch (err) {
      const d = new Date();
      return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
    }
  };

  const now = clinicNow();

  // Highlight today's row even before hours are confirmed.
  const todayRow = document.querySelector(`.hours-table tr[data-days="${groupFor(now.day)}"]`);
  if (todayRow) todayRow.classList.add("is-today");

  const { weekday, weekend } = CLINIC.hours;
  if (!weekday && !weekend) return; // hours not configured yet – keep [TIME] placeholders, hide status

  // Fill in the hours wherever they appear.
  document.querySelectorAll("[data-hours]").forEach((el) => {
    const sessions = CLINIC.hours[el.dataset.hours];
    el.textContent = sessions && sessions.length ? formatSessions(sessions) : "Closed";
  });

  const sessionsFor = (day) => CLINIC.hours[groupFor(day)] || [];

  let text;
  let state;
  const current = sessionsFor(now.day).find(([o, c]) => now.minutes >= toMinutes(o) && now.minutes < toMinutes(c));

  if (current) {
    state = "is-open";
    text = `Open now · closes at ${formatTime(current[1])}`;
  } else {
    state = "is-closed";
    text = "Closed now";
    // Find the next opening time within the coming week.
    for (let offset = 0; offset < 7; offset++) {
      const day = (now.day + offset) % 7;
      const next = sessionsFor(day).find(([o]) => offset > 0 || toMinutes(o) > now.minutes);
      if (next) {
        const when = offset === 0 ? "today" : offset === 1 ? "tomorrow" : DAY_NAMES[day];
        text = `Closed now · opens ${when} at ${formatTime(next[0])}`;
        break;
      }
    }
  }

  document.querySelectorAll("[data-open-status]").forEach((el) => {
    el.textContent = text;
    el.classList.add(state);
    el.hidden = false;
  });
})();

/* ---------- Home visit request form ---------- */
(function homeVisitForm() {
  const form = document.getElementById("visit-form");
  if (!form) return;

  const errorBox = document.getElementById("form-error");
  const status = document.getElementById("form-status");
  const dateInput = form.elements.date;

  // Don't allow picking a date in the past.
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  dateInput.min = today.toISOString().slice(0, 10);

  // Remember which button was pressed (for browsers without SubmitEvent.submitter).
  let lastChannel = "whatsapp";
  form.querySelectorAll('button[type="submit"]').forEach((btn) =>
    btn.addEventListener("click", () => { lastChannel = btn.value; })
  );

  const required = ["name", "phone", "address", "reason"];
  required.forEach((name) =>
    form.elements[name].addEventListener("input", (e) => e.target.removeAttribute("aria-invalid"))
  );

  const formatDate = (value) => {
    if (!value) return "Any day";
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const channel = (e.submitter && e.submitter.value) || lastChannel;

    // Validate
    let firstInvalid = null;
    required.forEach((name) => {
      const field = form.elements[name];
      const ok = field.value.trim() !== "";
      field.setAttribute("aria-invalid", String(!ok));
      if (!ok && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) {
      errorBox.hidden = false;
      firstInvalid.focus();
      return;
    }
    errorBox.hidden = true;

    const v = (name) => form.elements[name].value.trim();
    const lines = [
      "Hello Birthsider Family Clinic, I would like to request a home visit.",
      "",
      `Name: ${v("name")}`,
      `Phone: ${v("phone")}`,
      `Address / area: ${v("address")}`,
      `Reason for visit: ${v("reason")}`,
      `Preferred date: ${formatDate(v("date"))}`,
      `Preferred time: ${v("time")}`,
    ];
    const message = lines.join("\n");

    if (channel === "email") {
      const subject = `Home visit request – ${v("name")}`;
      window.location.href =
        `mailto:${CLINIC.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      status.textContent = "Opening your email app… Please press send to finish your request.";
    } else {
      // If the number isn't set yet, wa.me without a number lets the visitor pick a chat.
      const number = isPlaceholder(CLINIC.whatsapp) ? "" : CLINIC.whatsapp.replace(/\D/g, "");
      const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
      const win = window.open(url, "_blank");
      if (win) win.opener = null;
      else window.location.href = url; // pop-up blocked: open in this tab instead
      status.textContent = "Opening WhatsApp… Please press send to finish your request.";
    }
  });
})();

/* ---------- Footer year ---------- */
document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
