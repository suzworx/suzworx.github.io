const bios = {
  brief: [
    "I’m Sujeet, a staff software engineer who builds distributed systems, developer platforms, and voice agents.",
    "I care about simple design, reliable systems, and tools that help teams move faster."
  ],
  long: [
    "I’m Sujeet, a staff software engineer with experience building platforms from the ground up. My work includes distributed systems, event driven architecture, integrations, observability, and release engineering.",
    "Right now, I’m building voice agents and reliable tools that help teams move faster."
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
