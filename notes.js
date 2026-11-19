// Renders notes.md: each note starts with a "## YYYY-MM-DD" line; text before the first one is ignored.
const list = document.querySelector("#notes");

const escape = (text) => text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const inline = (text) =>
  escape(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g, '<a href="$1" target="_blank" rel="noreferrer">$1</a>');

function parse(markdown) {
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

function label(date) {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

fetch("notes.md", { cache: "no-cache" })
  .then((response) => (response.ok ? response.text() : Promise.reject(new Error(response.status))))
  .then((markdown) => {
    const notes = parse(markdown);
    if (!notes.length) {
      list.innerHTML = "<p>No notes yet. Thinking.</p>";
      return;
    }
    list.innerHTML = notes
      .map((note, i) => {
        const id = `note-${notes.length - i}`;
        return `<article class="note" id="${id}">${note.paragraphs.map((p) => `<p>${inline(p)}</p>`).join("")}<a class="note-date" href="#${id}">${escape(label(note.date))}</a></article>`;
      })
      .join("");
    if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
  })
  .catch(() => {
    list.innerHTML = '<p>Couldn’t load notes. Read them in <a href="notes.md">notes.md</a>.</p>';
  });
