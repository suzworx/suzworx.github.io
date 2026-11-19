// Notes tab: reads notes.md (each note starts with a "## YYYY-MM-DD" line),
// lists every note on a timeline and shows the one in the URL hash (newest by default).
const escapeHtml = (text) => text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const inline = (text) =>
  escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g, '<a href="$1" target="_blank" rel="noreferrer">$1</a>');

function parseNotes(markdown) {
  return markdown
    .split(/^## +/m)
    .slice(1)
    .map((chunk) => {
      const [heading, ...rest] = chunk.split("\n");
      const paragraphs = rest.join("\n").trim().split(/\n\s*\n/).filter(Boolean);
      return { date: heading.trim(), paragraphs: paragraphs.map((p) => p.replace(/\s*\n\s*/g, " ")) };
    })
    .filter((note) => note.paragraphs.length);
}

/** Ids keyed by date: "2026-11-18", and "2026-11-18-2" for a second note that day (counted oldest first, so links never shift). */
function noteIds(notes) {
  const seen = {};
  return notes
    .slice()
    .reverse()
    .map((note) => {
      const slug = note.date.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "note";
      seen[slug] = (seen[slug] || 0) + 1;
      return seen[slug] === 1 ? slug : `${slug}-${seen[slug]}`;
    })
    .reverse();
}

function dateLabel(date) {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/** First words of a note, for the timeline. */
function preview(note) {
  const text = note.paragraphs[0].replace(/https?:\/\/\S+/g, "").replace(/`/g, "").replace(/[\s:,-]+$/, "").trim();
  return text.length > 60 ? `${text.slice(0, 57).trimEnd()}…` : text;
}

const timeline = document.querySelector("#timeline");
const reader = document.querySelector("#note");
let notes = [];
let ids = [];
let loading = null;

/** Shows the note named in the hash, or the newest one. */
function showNote() {
  if (!notes.length) return;
  const index = Math.max(0, ids.indexOf(decodeURIComponent(location.hash.slice(1))));
  const note = notes[index];
  reader.innerHTML = `<p class="note-date">${escapeHtml(dateLabel(note.date))}</p>${note.paragraphs.map((p) => `<p>${inline(p)}</p>`).join("")}`;
  timeline.querySelectorAll("a").forEach((link, i) => {
    if (i === index) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

/** Loads notes.md once and fills the timeline; resolves when ready. */
function loadNotes() {
  if (loading) return loading;
  const load = (url) => fetch(url, { cache: "no-cache" }).then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))));
  // Opened from disk or mid-deploy: fall back to the published copy.
  loading = load("notes.md")
    .catch(() => load("https://suzworx.github.io/notes.md"))
    .then((markdown) => {
      notes = parseNotes(markdown);
      const count = document.querySelector("#notes-count");
      if (count) count.textContent = `${notes.length} ${notes.length === 1 ? "note" : "notes"}`;
      if (!notes.length) {
        reader.innerHTML = "<p>No notes yet. Thinking.</p>";
        return;
      }
      ids = noteIds(notes);
      timeline.innerHTML = notes
        .map((note, i) => `<li><a href="#${ids[i]}"><time datetime="${escapeHtml(note.date)}">${escapeHtml(dateLabel(note.date))}</time><span>${escapeHtml(preview(note))}</span></a></li>`)
        .join("");
    })
    .catch(() => {
      loading = null;
      reader.innerHTML = '<p>Couldn’t load notes. <a href="notes.md">Read notes.md</a>.</p>';
    });
  return loading;
}
