const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "../../..");
const CATALOG_PATH = path.join(REPO_ROOT, "themes", "catalog.json");

const FALLBACK_THEMES = [
  {
    id: "shrine",
    name: "Shrine",
    version: "1.3.1",
    author: "Shrine",
    package: "themes/packages/shrine-1.3.1.zip",
    role: "starter",
    description: "Crossoncourse student template — Shrine theme",
  },
  {
    id: "olivia",
    name: "Olivia",
    version: "14.2.5",
    author: "LuminTheme",
    package: "themes/packages/olivia-14.2.5.zip",
    role: "conversion",
    description: "Crossoncourse student template — Olivia/Lumin theme",
  },
];

const FALLBACK_FLOW = {
  start: "Pick template + create store draft",
  approve: "Human/agent approves store config",
  add: "Provision store with selected theme package",
};

function normalizeTheme(theme) {
  return {
    id: theme.id,
    name: theme.name,
    version: theme.version,
    author: theme.author || theme.vendor || "",
    vendor: theme.vendor || theme.author || "",
    package: theme.package,
    role: theme.role || null,
    description: theme.description || "",
    available: Boolean(theme.package) && fs.existsSync(path.join(REPO_ROOT, theme.package)),
  };
}

function readCatalog() {
  const raw = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
  const list = raw.templates || raw.themes || [];
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("catalog has no templates");
  }
  return {
    themes: list.map(normalizeTheme),
    flow: raw.flow || FALLBACK_FLOW,
  };
}

function listCatalog() {
  try {
    if (fs.existsSync(CATALOG_PATH)) {
      return readCatalog();
    }
  } catch (err) {
    console.warn("Failed to read themes catalog, using fallback:", err.message);
  }
  return {
    themes: FALLBACK_THEMES.map(normalizeTheme),
    flow: FALLBACK_FLOW,
  };
}

function listThemes() {
  return listCatalog().themes;
}

function getTheme(id) {
  return listThemes().find((theme) => theme.id === id) || null;
}

function getFlow() {
  return listCatalog().flow;
}

module.exports = { listThemes, listCatalog, getTheme, getFlow, REPO_ROOT, CATALOG_PATH };
