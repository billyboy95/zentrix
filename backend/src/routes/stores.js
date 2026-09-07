const { Router } = require("express");
const { v4: uuidv4 } = require("uuid");
const { getTheme } = require("../lib/themes");

const router = Router();

const stores = new Map();

const STATUSES = [
  "draft",
  "pending_approval",
  "approved",
  "provisioning",
  "live",
  "rejected",
];

const APPROVABLE = new Set(["draft", "pending_approval"]);
const REJECTABLE = new Set(["draft", "pending_approval"]);

function now() {
  return new Date().toISOString();
}

function notFound(res) {
  return res.status(404).json({ error: "Store not found" });
}

function conflict(res, status) {
  return res.status(400).json({ error: `cannot transition store in status ${status}` });
}

router.get("/", (req, res) => {
  let list = Array.from(stores.values());
  if (req.query.status) {
    const wanted = String(req.query.status)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    list = list.filter((store) => wanted.includes(store.status));
  }
  res.json({ stores: list });
});

router.get("/:id", (req, res) => {
  const store = stores.get(req.params.id);
  if (!store) return notFound(res);
  res.json(store);
});

// Start: create a store draft with templateId shrine | olivia
router.post("/", (req, res) => {
  const { name, templateId, notes } = req.body || {};
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: "name is required" });
  }
  if (!templateId) {
    return res.status(400).json({ error: "templateId is required" });
  }

  const theme = getTheme(templateId);
  if (!theme) {
    return res.status(400).json({ error: "templateId must be shrine or olivia" });
  }

  const store = {
    id: uuidv4(),
    name: String(name).trim(),
    templateId: theme.id,
    templateName: theme.name,
    status: "draft",
    themePackage: null,
    shopDomain: null,
    notes: notes || "",
    createdAt: now(),
    updatedAt: now(),
  };

  stores.set(store.id, store);
  res.status(201).json(store);
});

router.put("/:id", (req, res) => {
  const store = stores.get(req.params.id);
  if (!store) return notFound(res);

  const { name, notes, shopDomain, status } = req.body || {};
  if (name !== undefined) {
    if (!String(name).trim()) {
      return res.status(400).json({ error: "name cannot be empty" });
    }
    store.name = String(name).trim();
  }
  if (notes !== undefined) store.notes = notes;
  if (shopDomain !== undefined) store.shopDomain = shopDomain;
  if (status !== undefined) {
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${STATUSES.join(", ")}` });
    }
    store.status = status;
  }
  store.updatedAt = now();
  stores.set(store.id, store);
  res.json(store);
});

router.delete("/:id", (req, res) => {
  if (!stores.has(req.params.id)) return notFound(res);
  stores.delete(req.params.id);
  res.status(204).end();
});

router.post("/:id/submit", (req, res) => {
  const store = stores.get(req.params.id);
  if (!store) return notFound(res);
  if (store.status !== "draft") return conflict(res, store.status);
  store.status = "pending_approval";
  store.updatedAt = now();
  stores.set(store.id, store);
  res.json(store);
});

router.post("/:id/approve", (req, res) => {
  const store = stores.get(req.params.id);
  if (!store) return notFound(res);
  if (!APPROVABLE.has(store.status)) return conflict(res, store.status);
  store.status = "approved";
  store.updatedAt = now();
  stores.set(store.id, store);
  res.json(store);
});

router.post("/:id/reject", (req, res) => {
  const store = stores.get(req.params.id);
  if (!store) return notFound(res);
  if (!REJECTABLE.has(store.status)) return conflict(res, store.status);
  store.status = "rejected";
  store.updatedAt = now();
  stores.set(store.id, store);
  res.json(store);
});

// Add / Provision: approved → provisioning → live, record theme package path
router.post("/:id/provision", (req, res) => {
  const store = stores.get(req.params.id);
  if (!store) return notFound(res);
  if (store.status !== "approved") return conflict(res, store.status);

  const theme = getTheme(store.templateId);
  if (!theme) {
    return res.status(400).json({ error: "unknown templateId on store" });
  }

  store.status = "provisioning";
  store.themePackage = theme.package;
  store.updatedAt = now();
  stores.set(store.id, store);

  // TODO: Shopify Admin API — create the shop, upload/publish the theme zip
  // from store.themePackage, and persist the myshopify.com domain.
  // No Admin API keys in this MVP; mark live after recording the package path.

  store.status = "live";
  store.updatedAt = now();
  stores.set(store.id, store);
  res.json(store);
});

module.exports = router;
