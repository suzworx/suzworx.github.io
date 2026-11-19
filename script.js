const bios = {
  brief: [
    "I’m Sujeet. I build software, mostly voice assistants and developer tools.",
    "I like simple things that work, and deleting more code than I write."
  ],
  long: [
    "I’m Sujeet. I build software from the ground up: platforms, integrations, systems that keep running at 3 a.m., and lately voice assistants that talk back (politely, mostly).",
    "I like simple designs, tools that help people move faster, and the quiet joy of a green build."
  ]
};

const bioContent = document.querySelector("#bio-content");
const bioButtons = document.querySelectorAll("[data-bio]");
// "#feed" or a post date ("#2026-11-18", "#2026-11-18-2") opens the Feed tab.
const feedHash = (hash) => hash === "#feed" || /^#\d{4}-\d{2}-\d{2}(-\d+)?$/.test(hash);

function showBio(view) {
  bioButtons.forEach((item) => item.setAttribute("aria-pressed", String(item.dataset.bio === view)));
  if (view === "feed") {
    bioContent.replaceChildren();
    return renderFeed(bioContent);
  }
  bioContent.replaceChildren(...bios[view].map((text) => Object.assign(document.createElement("p"), { textContent: text })));
  return Promise.resolve();
}

function openFromHash() {
  if (!feedHash(location.hash)) return;
  showBio("feed").then(() => {
    const post = location.hash !== "#feed" && document.getElementById(location.hash.slice(1));
    (post || bioContent).scrollIntoView();
  });
}

bioButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const view = button.dataset.bio;
    history.replaceState(null, "", view === "feed" ? "#feed" : location.pathname);
    showBio(view);
  });
});
window.addEventListener("hashchange", () => {
  if (feedHash(location.hash) && !document.getElementById(location.hash.slice(1))?.closest("#bio-content")) openFromHash();
});
openFromHash();

const themeButton = document.querySelector(".theme-toggle");
themeButton.addEventListener("click", () => {
  const current = document.documentElement.dataset.theme;
  const next = current === "system" ? "dark" : current === "dark" ? "light" : "system";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("theme", next);
  themeButton.title = `Theme: ${next}`;
});
