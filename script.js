const bios = {
  brief: [
    "I’m Sujeet. I build software. Right now, I’m building voice assistants.",
    "I like simple things that work, and deleting more code than I write."
  ],
  long: [
    "I’m Sujeet. I build software from the ground up: platforms, integrations, and systems that keep running at 3 a.m. Right now, I’m building voice assistants that talk back (politely, mostly).",
    "I like simple designs, tools that help people move faster, and the quiet joy of a green build."
  ]
};

const bioContent = document.querySelector("#bio-content");
document.querySelectorAll("[data-bio]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-bio]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    bioContent.replaceChildren(...bios[button.dataset.bio].map((text) => Object.assign(document.createElement("p"), { textContent: text })));
  });
});

// Bio / Notes tabs. "#notes", or a note's date ("#2026-11-18"), opens Notes;
// "#feed" is the old name for it.
const notesHash = (hash) => /^#(notes|feed|\d{4}-\d{2}-\d{2}(-\d+)?)$/.test(hash);

function showView(view) {
  const notesOn = view === "notes";
  document.querySelectorAll("[data-view]").forEach((tab) => tab.setAttribute("aria-selected", String(tab.dataset.view === view)));
  document.querySelector("#view-bio").hidden = notesOn;
  document.querySelector("#view-notes").hidden = !notesOn;
  document.querySelector(".bio-options").hidden = notesOn;
  document.querySelector("#notes-count").hidden = !notesOn;
  if (notesOn) loadNotes().then(showNote);
}

document.querySelectorAll("[data-view]").forEach((tab) => {
  tab.addEventListener("click", () => {
    const view = tab.dataset.view;
    if (view === "notes" && !notesHash(location.hash)) history.pushState(null, "", "#notes");
    if (view === "bio" && location.hash) history.pushState(null, "", location.pathname + location.search);
    showView(view);
  });
});

const syncView = () => showView(notesHash(location.hash) ? "notes" : "bio");
window.addEventListener("hashchange", syncView);
window.addEventListener("popstate", syncView);
syncView();

const themeButton = document.querySelector(".theme-toggle");
themeButton?.addEventListener("click", () => {
  const current = document.documentElement.dataset.theme;
  const next = current === "system" ? "dark" : current === "dark" ? "light" : "system";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("theme", next);
  themeButton.title = `Theme: ${next}`;
});
