"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type Theme = {
  id: string;
  name: string;
  version: string;
  vendor?: string;
  package: string;
  description?: string;
  available: boolean;
};

export type Store = {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  status: "draft" | "pending_approval" | "approved" | "provisioning" | "live" | "rejected" | string;
  themePackage: string | null;
  shopDomain: string | null;
  notes: string;
  createdAt: string;
};

const FALLBACK_THEMES: Theme[] = [
  {
    id: "shrine",
    name: "Shrine",
    version: "1.3.1",
    vendor: "Shrine",
    package: "themes/packages/shrine-1.3.1.zip",
    description: "Shrine 1.3.1 Shopify theme template",
    available: false,
  },
  {
    id: "olivia",
    name: "Olivia",
    version: "14.2.5",
    vendor: "LuminTheme",
    package: "themes/packages/olivia-14.2.5.zip",
    description: "Olivia 14.2.5 (LuminTheme) Shopify theme template",
    available: false,
  },
];

function statusClass(status: string) {
  switch (status) {
    case "live":
      return "bg-emerald-900 text-emerald-300";
    case "approved":
      return "bg-indigo-900 text-indigo-300";
    case "provisioning":
      return "bg-blue-900 text-blue-300";
    case "pending_approval":
      return "bg-amber-900 text-amber-200";
    case "rejected":
      return "bg-red-900 text-red-300";
    default:
      return "bg-zinc-800 text-zinc-400";
  }
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusClass(status)}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default function StoreFlow() {
  const [themes, setThemes] = useState<Theme[]>(FALLBACK_THEMES);
  const [stores, setStores] = useState<Store[]>([]);
  const [storeName, setStoreName] = useState("");
  const [templateId, setTemplateId] = useState<"shrine" | "olivia">("shrine");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/stores`);
      if (!res.ok) throw new Error("Failed to load stores");
      const data = await res.json();
      setStores(data.stores || []);
    } catch {
      /* API may be offline */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/themes`);
        const data = await res.json();
        if (!cancelled && Array.isArray(data.themes) && data.themes.length > 0) {
          setThemes(data.themes);
        }
      } catch {
        /* keep fallback catalog */
      }

      try {
        const res = await fetch(`${API_BASE}/api/stores`);
        const data = await res.json();
        if (!cancelled) setStores(data.stores || []);
      } catch {
        /* API may be offline */
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const queue = useMemo(
    () => stores.filter((s) => s.status === "draft" || s.status === "pending_approval"),
    [stores],
  );
  const approved = useMemo(() => stores.filter((s) => s.status === "approved"), [stores]);
  const live = useMemo(() => stores.filter((s) => s.status === "live"), [stores]);
  const rejected = useMemo(() => stores.filter((s) => s.status === "rejected"), [stores]);

  const runAction = async (label: string, fn: () => Promise<Response>) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fn();
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || `${label} failed`);
      }
      setNotice(label);
      await fetchStores();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : `${label} failed`);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const startStore = async () => {
    if (!storeName.trim()) {
      setError("Store name is required");
      return;
    }
    const ok = await runAction("Store drafted — waiting for approval", () =>
      fetch(`${API_BASE}/api/stores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: storeName.trim(), templateId }),
      }),
    );
    if (ok) setStoreName("");
  };

  const approveStore = (id: string) =>
    runAction("Store approved", () =>
      fetch(`${API_BASE}/api/stores/${id}/approve`, { method: "POST" }),
    );

  const rejectStore = (id: string) =>
    runAction("Store rejected", () =>
      fetch(`${API_BASE}/api/stores/${id}/reject`, { method: "POST" }),
    );

  const provisionStore = (id: string) =>
    runAction("Store provisioned (live)", () =>
      fetch(`${API_BASE}/api/stores/${id}/provision`, { method: "POST" }),
    );

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-indigo-400">
          Autonomous Shopify stores
        </p>
        <h2 className="mt-1 text-lg font-semibold text-zinc-100">Start → Approve → Add</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Draft a store on Shrine or Olivia, approve it, then provision. Theme upload to Shopify
          Admin is stubbed for this MVP.
        </p>
      </div>

      <ol className="grid gap-3 sm:grid-cols-3">
        {[
          { n: "1", title: "Start", body: "Name the store and pick a theme template." },
          { n: "2", title: "Approve", body: "Human review before anything is provisioned." },
          { n: "3", title: "Add", body: "Record the theme package and mark the store live." },
        ].map((step) => (
          <li
            key={step.n}
            className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3"
          >
            <p className="text-xs font-semibold text-indigo-400">
              {step.n}. {step.title}
            </p>
            <p className="mt-1 text-sm text-zinc-400">{step.body}</p>
          </li>
        ))}
      </ol>

      {error && (
        <p className="rounded-lg border border-red-900 bg-red-950/60 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      {notice && (
        <p className="rounded-lg border border-emerald-900 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-300">
          {notice}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h3 className="text-sm font-semibold text-zinc-200">1. Start</h3>
          <label className="mt-3 block text-xs text-zinc-500" htmlFor="store-name">
            Store name
          </label>
          <input
            id="store-name"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="e.g. Karoo Home"
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
          />

          <p className="mt-4 text-xs text-zinc-500">Theme template</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {themes.map((theme) => {
              const selected = templateId === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setTemplateId(theme.id as "shrine" | "olivia")}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    selected
                      ? "border-indigo-500 bg-indigo-950/50"
                      : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-zinc-100">{theme.name}</span>
                    <span className="text-xs text-zinc-500">{theme.version}</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {theme.vendor ? `${theme.vendor} · ` : ""}
                    {theme.id}
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-zinc-600">{theme.package}</p>
                  <p className="mt-1 text-[11px] text-zinc-500">
                    {theme.available ? "Package on disk" : "Package pending"}
                  </p>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={startStore}
            disabled={busy}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 transition-colors disabled:opacity-50"
          >
            Start store
          </button>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h3 className="text-sm font-semibold text-zinc-200">2. Approve</h3>
          <p className="mt-1 text-xs text-zinc-500">Drafts and pending reviews.</p>
          {queue.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">No stores waiting. Start one on the left.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {queue.map((store) => (
                <li
                  key={store.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-zinc-100">{store.name}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {store.templateName} · {store.templateId}
                      </p>
                    </div>
                    <StatusBadge status={store.status} />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => approveStore(store.id)}
                      disabled={busy}
                      className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium hover:bg-emerald-600 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectStore(store.id)}
                      disabled={busy}
                      className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h3 className="text-sm font-semibold text-zinc-200">3. Add / Provision</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Marks the store live and records the selected theme package path. Shopify Admin API is
          not called yet.
        </p>
        {approved.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">No approved stores ready to provision.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {approved.map((store) => (
              <li
                key={store.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3"
              >
                <div>
                  <p className="font-medium text-zinc-100">{store.name}</p>
                  <p className="text-xs text-zinc-500">
                    {store.templateName} · will record{" "}
                    <span className="font-mono">
                      themes/packages/{store.templateId === "olivia" ? "olivia-14.2.5" : "shrine-1.3.1"}
                      .zip
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => provisionStore(store.id)}
                  disabled={busy}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium hover:bg-indigo-500 disabled:opacity-50"
                >
                  Provision
                </button>
              </li>
            ))}
          </ul>
        )}

        {live.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Live</h4>
            <ul className="mt-2 space-y-2">
              {live.map((store) => (
                <li
                  key={store.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-950 bg-emerald-950/20 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-100">{store.name}</p>
                    <p className="font-mono text-[11px] text-zinc-500">{store.themePackage}</p>
                  </div>
                  <StatusBadge status={store.status} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {rejected.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Rejected</h4>
            <ul className="mt-2 space-y-2">
              {rejected.map((store) => (
                <li key={store.id} className="flex items-center justify-between text-sm text-zinc-400">
                  <span>{store.name}</span>
                  <StatusBadge status={store.status} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
