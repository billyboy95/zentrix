"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/health`)
      .then((res) => {
        if (!cancelled) setApiStatus(res.ok ? "online" : "offline");
      })
      .catch(() => {
        if (!cancelled) setApiStatus("offline");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const storesActive = pathname === "/";
  const agentsActive = pathname.startsWith("/agents");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 lg:flex">
      <aside className="border-b border-zinc-800 px-5 py-4 lg:flex lg:w-56 lg:flex-col lg:border-b-0 lg:border-r">
        <div>
          <p className="text-lg font-bold tracking-tight">
            <span className="text-emerald-400">Zentrix</span>
          </p>
          <p className="text-xs text-zinc-500">Shopify store control</p>
        </div>
        <nav className="mt-4 flex gap-2 lg:mt-8 lg:flex-col">
          <Link
            href="/"
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              storesActive
                ? "bg-emerald-950 text-emerald-300"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
            }`}
          >
            Stores
          </Link>
          <Link
            href="/agents"
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              agentsActive
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
            }`}
          >
            Agents
          </Link>
        </nav>
        <p className="mt-4 hidden text-xs text-zinc-600 lg:mt-auto lg:block">
          Start → Approve → Add
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-3">
          <p className="text-sm text-zinc-400">
            {storesActive ? "Autonomous Shopify stores" : "Agent platform MVP"}
          </p>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              apiStatus === "online"
                ? "bg-emerald-900 text-emerald-300"
                : apiStatus === "offline"
                ? "bg-red-900 text-red-300"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            API {apiStatus}
          </span>
        </header>
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
