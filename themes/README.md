# Zentrix Shopify theme templates

These Crossoncourse theme packages power the autonomous Zentrix Shopify store flow:

**Start → Approve → Add**

1. **Start** — Pick a template from `catalog.json` and create a store draft (`POST /api/stores`).
2. **Approve** — A human or agent reviews and approves the store config (`POST /api/stores/:id/approve`).
3. **Add** — Provision the store using the selected theme zip under `packages/` (`POST /api/stores/:id/provision`).

`GET /api/themes` serves this catalog. Each entry includes `available: true` when the zip is present on disk.

## Catalog

| ID | Name | Version | Author | Role | Package |
|----|------|---------|--------|------|---------|
| `shrine` | Shrine | 1.3.1 | Shrine | starter | `packages/shrine-1.3.1.zip` |
| `olivia` | Olivia | 14.2.5 | LuminTheme | conversion | `packages/olivia-14.2.5.zip` |

See `catalog.json` for machine-readable metadata used by the Control Centre.

## Shopify Admin API

Not wired yet. Provisioning is an in-memory stub that moves `approved` → `provisioning` → `live` and records `themePackage`.

```
TODO: Shopify Admin API — create shop, upload/publish theme from the package path, persist myshopify domain.
No Admin API keys or secrets in this repo.
```
