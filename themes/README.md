# Theme templates

Shopify theme packages used when provisioning autonomous stores via **Start → Approve → Add**.

## Catalog

See [`catalog.json`](./catalog.json). Control Centre template IDs:

| ID | Theme | Package |
|----|--------|---------|
| `shrine` | Shrine 1.3.1 | `themes/packages/shrine-1.3.1.zip` |
| `olivia` | Olivia 14.2.5 / LuminTheme | `themes/packages/olivia-14.2.5.zip` |

`GET /api/themes` serves this catalog. Each entry includes `available: true` only when the zip is present on disk.

## Packages

Zip packages are expected under `packages/`:

- `themes/packages/shrine-1.3.1.zip`
- `themes/packages/olivia-14.2.5.zip`

**Packages pending.** They were not on `main` when this flow landed (and `zentrix/theme-templates` was not on the remote). Drop the zips into `packages/` when they arrive — the API records the package path on provision even if the file is still missing.

## Shopify Admin API

Not wired yet. Provisioning is an in-memory stub that moves `approved` → `provisioning` → `live` and stores `themePackage`.

```
TODO: Shopify Admin API — create shop, upload/publish theme from the package path, persist myshopify domain.
No Admin API keys or secrets in this repo.
```
