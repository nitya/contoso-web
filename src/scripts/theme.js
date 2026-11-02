const root = document.documentElement;
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeLabel = themeToggle?.querySelector("[data-theme-label]");
const themeColor = document.querySelector('meta[name="theme-color"]');

function updateThemeControl() {
  const isDark = root.dataset.theme === "dark";
  themeToggle?.setAttribute("aria-pressed", String(isDark));
  themeToggle?.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
  if (themeLabel) themeLabel.textContent = `${isDark ? "Light" : "Dark"} mode`;
  themeColor?.setAttribute("content", isDark ? "#17231d" : "#fbfaf5");
}

updateThemeControl();

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = nextTheme;
  updateThemeControl();

  try {
    localStorage.setItem("contoso-theme", nextTheme);
  } catch (error) {
    console.warn("Could not persist the theme preference in this browser.", error);
  }
});
