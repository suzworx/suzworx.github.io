const bios = {
  brief: [
    "I’m Sujeet, a staff software engineer focused on distributed systems, developer platforms, and AI-assisted engineering workflows.",
    "I build reliable systems that help teams move faster without sacrificing correctness."
  ],
  long: [
    "I’m Sujeet, a staff software engineer who builds and scales platforms from zero to one. My work spans distributed systems, event-driven architecture, integrations, observability, and release engineering.",
    "I currently focus on AI-assisted developer workflows and reliable systems that help teams move faster without sacrificing correctness."
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
