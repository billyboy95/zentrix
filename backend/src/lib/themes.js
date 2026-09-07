const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "../../..");
const CATALOG_PATH = path.join(REPO_ROOT, "themes", "catalog.json");

const FALLBACK_THEMES = [
  {
    id: "shrine",
    name: "Shrine",
    version: "1.3.1",
    vendor: "Shrine",
    package: "themes/packages/shrine-1.3.1.zip",
    description: "Shrine 1.3.1 Shopify theme template",
  },
  {
    id: "olivia",
    name: "Olivia",
    version: "14.2.5",
    vendor: "LuminTheme",
    package: "themes/packages/olivia-14.2.5.zip",
    description: "Olivia 14.2.5 (LuminTheme) Shopify theme template",
  },
];

function withAvailability(theme) {
  return {
    ...theme,
    available: fs.existsSync(path.join(REPO_ROOT, theme.package)),
  };
}

function listThemes() {
  let themes = FALLBACK_THEMES;
  try {
    if (fs.existsSync(CATALOG_PATH)) {
      const raw = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
      if (Array.isArray(raw.themes) && raw.themes.length > 0) {
        themes = raw.themes;
      }
    }
  } catch (err) {
    console.warn("Failed to read themes catalog, using fallback:", err.message);
  }
  return themes.map(withAvailability);
}

function getTheme(id) {
  return listThemes().find((theme) => theme.id === id) || null;
}

module.exports = { listThemes, getTheme, REPO_ROOT, CATALOG_PATH };
