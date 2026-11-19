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
document.querySelectorAll("[data-bio]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-bio]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    bioContent.replaceChildren(...bios[button.dataset.bio].map((text) => Object.assign(document.createElement("p"), { textContent: text })));
  });
});

const themeButton = document.querySelector(".theme-toggle");
themeButton.addEventListener("click", () => {
  const current = document.documentElement.dataset.theme;
  const next = current === "system" ? "dark" : current === "dark" ? "light" : "system";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("theme", next);
  themeButton.title = `Theme: ${next}`;
});
