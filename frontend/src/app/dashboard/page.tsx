"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { UsageStats, RequestLogsResponse, RequestLogEntry } from "@/lib/types";

type MetricTone = "green" | "blue" | "amber";

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [logs, setLogs] = useState<RequestLogsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    Promise.all([
      api.get<UsageStats>("/usage", token),
      api.get<RequestLogsResponse>("/logs?page=1&page_size=100", token),
    ])
      .then(([usageData, logsData]) => {
        if (!active) return;
        setStats(usageData);
        setLogs(logsData);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Failed to load dashboard data. Please try again."
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const successRate = stats
    ? Math.max(0, Math.min(100, (1 - stats.error_rate) * 100)).toFixed(1)
    : "—";
  const firstName = getFirstName(user?.email);

  return (
    <ProtectedRoute>
      <div className="mx-auto w-full max-w-[1480px] space-y-6 text-[#20251f]">
        {/* Page heading */}
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#63815b]">
              <span className="h-2 w-2 rounded-full bg-[#9be564]" />
              Mindora workspace <span className="text-[#a2aaa0]">/</span> Overview
            </div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#20251f] sm:text-4xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#788075]">
              Here&apos;s what&apos;s happening across your AI infrastructure.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e2e9de] bg-white px-3.5 py-2 text-xs font-medium text-[#566451] shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8acb5b] opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#78b94c]" />
              </span>
              Workspace overview
            </span>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#20251f] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#354332] focus:outline-none focus:ring-4 focus:ring-[#9be564]/30"
            >
              Explore services <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>

        {error && (
          <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-red-800">We couldn&apos;t refresh your dashboard</p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="self-start rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-800 hover:bg-red-100 sm:self-auto"
            >
              Try again
            </button>
          </div>
        )}

        {/* KPI cards */}
        <section aria-label="Usage metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <MetricCard
            label="API requests"
            value={stats ? stats.total_requests.toLocaleString() : "—"}
            description="Total requests recorded"
            icon="↗"
            tone="green"
            loading={isLoading && !stats}
          />
          <MetricCard
            label="Success rate"
            value={stats ? `${successRate}%` : "—"}
            description={stats ? `${stats.error_count.toLocaleString()} failed requests` : "Successful responses"}
            icon="✓"
            tone="blue"
            loading={isLoading && !stats}
          />
          <MetricCard
            label="Average latency"
            value={stats ? `${stats.avg_latency_ms.toFixed(0)} ms` : "—"}
            description="Average response time"
            icon="◷"
            tone="green"
            loading={isLoading && !stats}
          />
          <MetricCard
            label="Estimated cost"
            value={stats ? `$${stats.estimated_cost.toFixed(4)}` : "—"}
            description="Current usage estimate"
            icon="$"
            tone="amber"
            loading={isLoading && !stats}
          />
        </section>

        {/* Compact request trend: calculated from real request-log timestamps */}
        <RequestTrend logs={logs?.items ?? []} isLoading={isLoading} />

        {/* Main content grid */}
        <section className="grid grid-cols-1 items-start gap-5 2xl:grid-cols-[minmax(0,1.65fr)_minmax(310px,0.8fr)]">
          <RecentActivity logs={logs} isLoading={isLoading} />
          <div className="space-y-5">
            <QuickActions />
            <SystemStatus />
          </div>
        </section>

        {/* Workspace footer strip */}
        <section className="flex flex-col gap-3 rounded-2xl border border-[#e3e9df] bg-white px-5 py-4 shadow-[0_8px_28px_rgba(34,55,31,0.035)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f7eb] text-lg text-[#507d3f]">✳</span>
            <div>
              <p className="text-sm font-semibold text-[#273126]">Your AI control plane</p>
              <p className="mt-0.5 text-xs text-[#858e80]">Manage services, requests and access from one workspace.</p>
            </div>
          </div>
          <Link href="/settings" className="inline-flex items-center gap-2 text-sm font-semibold text-[#416d35] transition hover:text-[#254c1d]">
            Workspace settings <span aria-hidden="true">→</span>
          </Link>
        </section>
      </div>
    </ProtectedRoute>
  );
}

function RequestTrend({ logs, isLoading }: { logs: RequestLogEntry[]; isLoading: boolean }) {
  const points = getDailyRequestCounts(logs);
  const max = Math.max(1, ...points.map((point) => point.count));
  const coordinates = points.map((point, index) => ({
    ...point,
    x: points.length === 1 ? 160 : 12 + (index * 296) / (points.length - 1),
    y: 88 - (point.count / max) * 68,
  }));
  const line = coordinates.map((point) => `${point.x},${point.y}`).join(" ");
  const totalInSample = points.reduce((sum, point) => sum + point.count, 0);

  return (
    <section className="rounded-2xl border border-[#e3e9df] bg-white p-5 shadow-[0_8px_28px_rgba(34,55,31,0.035)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#78916c]">Analytics</p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.025em] text-[#273126]">API requests over time</h2>
          <p className="mt-1 text-xs text-[#858e80]">Daily request activity from the latest logged requests.</p>
        </div>
        <div className="rounded-xl bg-[#f1f7ec] px-3.5 py-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#71836a]">Requests in 7-day sample</p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums text-[#315c2b]">{isLoading && logs.length === 0 ? "…" : totalInSample.toLocaleString()}</p>
        </div>
      </div>
      {isLoading && logs.length === 0 ? (
        <div className="mt-6 h-36 animate-pulse rounded-xl bg-[#f5f7f2]" />
      ) : logs.length === 0 ? (
        <div className="mt-5 flex min-h-36 items-center justify-center rounded-xl border border-dashed border-[#dfe8d8] bg-[#fafcf8] px-4 text-center text-sm text-[#858e80]">
          No request history yet. Run a request through Mindora to start building this chart.
        </div>
      ) : (
        <>
          <div className="mt-5 h-40 w-full">
            <svg viewBox="0 0 320 104" role="img" aria-label="API requests grouped by day from the latest logged requests" className="h-full w-full overflow-visible">
              {[20, 42, 64, 88].map((y) => <line key={y} x1="8" y1={y} x2="312" y2={y} stroke="#e8eee3" strokeWidth="1" />)}
              <polygon points={`12,96 ${line} 308,96`} fill="#9be564" opacity="0.18" />
              <polyline points={line} fill="none" stroke="#4d8a3e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {coordinates.map((point) => <circle key={point.label} cx={point.x} cy={point.y} r="3" fill="#4d8a3e" stroke="#fff" strokeWidth="1.5" />)}
            </svg>
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {points.map((point) => (
              <div key={point.label} className="text-center">
                <p className="text-[10px] font-semibold tabular-nums text-[#52634c]">{point.count}</p>
                <p className="mt-1 text-[10px] text-[#929a8d]">{point.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[10px] leading-4 text-[#9aa294]">This chart uses the latest 100 request logs available from the API, so it may not represent every request in the selected period.</p>
        </>
      )}
    </section>
  );
}

type DailyRequestPoint = { label: string; dateKey: string; count: number };
function getDailyRequestCounts(logs: RequestLogEntry[]): DailyRequestPoint[] {
  const now = new Date();
  const days: DailyRequestPoint[] = [];
  for (let offset = 6; offset >= 0; offset--) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const dateKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    days.push({ label: day.toLocaleDateString(undefined, { weekday: "short" }), dateKey, count: 0 });
  }
  for (const log of logs) {
    const timestamp = (log as RequestLogEntry & { created_at?: string }).created_at;
    if (!timestamp) continue;
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) continue;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const day = days.find((item) => item.dateKey === key);
    if (day) day.count += 1;
  }
  return days;
}

function MetricCard({
  label,
  value,
  description,
  icon,
  tone,
  loading,
}: {
  label: string;
  value: string;
  description: string;
  icon: string;
  tone: MetricTone;
  loading: boolean;
}) {
  const tones: Record<MetricTone, { icon: string; dot: string }> = {
    green: { icon: "bg-[#edf7e7] text-[#527f40]", dot: "bg-[#8dc96b]" },
    blue: { icon: "bg-[#eaf3f7] text-[#47758a]", dot: "bg-[#79b5ca]" },
    amber: { icon: "bg-[#fbf2df] text-[#9b7737]", dot: "bg-[#d9b45f]" },
  };

  return (
    <article className="group rounded-2xl border border-[#e3e9df] bg-white p-5 shadow-[0_8px_28px_rgba(34,55,31,0.035)] transition duration-200 hover:-translate-y-0.5 hover:border-[#d2dfca] hover:shadow-[0_14px_34px_rgba(34,55,31,0.07)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={`h-2 w-2 rounded-full ${tones[tone].dot}`} />
          <p className="text-xs font-medium text-[#778174]">{label}</p>
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-base font-semibold ${tones[tone].icon}`} aria-hidden="true">
          {icon}
        </span>
      </div>
      <div className="mt-6">
        {loading ? (
          <div className="h-9 w-28 animate-pulse rounded-lg bg-[#f0f3ed]" />
        ) : (
          <p className="text-[clamp(1.65rem,2.2vw,2.1rem)] font-semibold tracking-[-0.05em] text-[#222920]">{value}</p>
        )}
        <p className="mt-2 text-xs text-[#899184]">{description}</p>
      </div>
      <div className="mt-5 h-px bg-[#f0f2ed]" />
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#9aa294]">Workspace metric</p>
    </article>
  );
}

function RecentActivity({
  logs,
  isLoading,
}: {
  logs: RequestLogsResponse | null;
  isLoading: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#e3e9df] bg-white shadow-[0_8px_28px_rgba(34,55,31,0.035)]">
      <div className="flex items-start justify-between gap-4 border-b border-[#edf0e9] px-5 py-5 sm:px-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#78916c]">Activity</p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.025em] text-[#273126]">Recent request activity</h2>
          <p className="mt-1 text-xs leading-5 text-[#858e80]">Latest requests across your AI services.</p>
        </div>
        <Link href="/logs" className="shrink-0 rounded-lg border border-[#e4e9df] px-3 py-2 text-xs font-semibold text-[#4b6842] transition hover:bg-[#f5f8f1]">
          View all <span aria-hidden="true">↗</span>
        </Link>
      </div>

      {isLoading && !logs && (
        <div className="space-y-4 p-6">
          {[0, 1, 2, 3].map((item) => <div key={item} className="h-[58px] animate-pulse rounded-xl bg-[#f5f7f2]" />)}
        </div>
      )}

      {!isLoading && logs && logs.items.length === 0 && (
        <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0f7eb] text-xl text-[#5f874e]">⌁</span>
          <h3 className="mt-4 text-sm font-semibold text-[#30392d]">No requests yet</h3>
          <p className="mt-1 max-w-xs text-xs leading-5 text-[#858e80]">When your applications start calling Mindora services, recent activity will appear here.</p>
          <Link href="/api-keys" className="mt-4 text-xs font-semibold text-[#4c783d] hover:underline">Set up an API key →</Link>
        </div>
      )}

      {logs && logs.items.length > 0 && (
        <>
          <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(100px,0.8fr)_90px] gap-4 bg-[#fafbf8] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#9aa294] sm:grid">
            <span>Service / model</span><span>Status</span><span className="text-right">Latency</span>
          </div>
          <div className="divide-y divide-[#f0f2ed]">
            {logs.items.slice(0, 6).map((log) => <RequestRow key={log.id} log={log} />)}
          </div>
          <div className="border-t border-[#edf0e9] bg-[#fcfdfb] px-6 py-3">
            <Link href="/logs" className="text-xs font-semibold text-[#527844] hover:underline">Open request log explorer →</Link>
          </div>
        </>
      )}

      {!isLoading && !logs && (
        <div className="px-6 py-10 text-center text-sm text-[#858e80]">Activity is currently unavailable.</div>
      )}
    </section>
  );
}

function RequestRow({ log }: { log: RequestLogEntry }) {
  const success = log.status_code >= 200 && log.status_code < 300;
  return (
    <div className="grid grid-cols-1 gap-3 px-5 py-4 transition hover:bg-[#fcfdfb] sm:grid-cols-[minmax(0,1.4fr)_minmax(100px,0.8fr)_90px] sm:items-center sm:gap-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${success ? "bg-[#edf7e7] text-[#4e7d3e]" : "bg-[#fff0ed] text-[#b55c4e]"}`} aria-hidden="true">
          {success ? "✓" : "!"}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#30392d]">{log.service}</p>
          <p className="mt-1 truncate text-xs text-[#90988b]">{log.model_version ?? "Unknown model"}</p>
        </div>
      </div>
      <div className="flex items-center justify-between sm:block">
        <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#a0a799] sm:hidden">Response status</span>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${success ? "bg-[#edf7e7] text-[#4e7d3e]" : "bg-[#fff0ed] text-[#b55c4e]"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${success ? "bg-[#78b957]" : "bg-[#d77a6b]"}`} />
          {log.status_code} {success ? "Success" : "Error"}
        </span>
      </div>
      <div className="flex items-center justify-between sm:block sm:text-right">
        <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#a0a799] sm:hidden">Latency</span>
        <p className="text-sm font-medium tabular-nums text-[#394235]">{log.latency_ms.toFixed(1)} <span className="text-xs font-normal text-[#929a8d]">ms</span></p>
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { href: "/api-keys", icon: "⌁", title: "Create API key", description: "Connect an application", tone: "green" },
    { href: "/services/fraud", icon: "✳", title: "Run fraud detection", description: "Test an AI service", tone: "green" },
    { href: "/usage", icon: "▥", title: "View usage", description: "Review consumption", tone: "blue" },
    { href: "/logs", icon: "≡", title: "Inspect request logs", description: "Review API activity", tone: "amber" },
  ];

  const iconTones: Record<string, string> = {
    green: "bg-[#edf7e7] text-[#527f40]",
    blue: "bg-[#eaf3f7] text-[#47758a]",
    amber: "bg-[#fbf2df] text-[#9b7737]",
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e3e9df] bg-white shadow-[0_8px_28px_rgba(34,55,31,0.035)]">
      <div className="border-b border-[#edf0e9] px-5 py-5 sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#78916c]">Shortcuts</p>
        <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.025em] text-[#273126]">Quick actions</h2>
        <p className="mt-1 text-xs text-[#858e80]">Jump straight into your workflow.</p>
      </div>
      <div className="p-2.5">
        {actions.map((action) => (
          <Link key={action.href} href={action.href} className="group flex items-center gap-3 rounded-xl p-3 transition hover:bg-[#f7f9f4]">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base ${iconTones[action.tone]}`} aria-hidden="true">{action.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-[#354031] transition group-hover:text-[#4d793c]">{action.title}</span>
              <span className="mt-0.5 block text-xs text-[#8a9285]">{action.description}</span>
            </span>
            <span className="text-sm text-[#a2aa9b] transition group-hover:translate-x-0.5 group-hover:text-[#527844]" aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SystemStatus() {
  return (
    <section className="rounded-2xl border border-[#dfe9d8] bg-[#f1f7ec] p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#578646] shadow-sm" aria-hidden="true">✓</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-[#30432b]">Platform status</h2>
            <span className="rounded-full bg-[#e1f1d7] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#4d7c3b]">Connected</span>
          </div>
          <p className="mt-1.5 text-xs leading-5 text-[#72816a]">Your dashboard data is provided by the Mindora API. Individual service availability is managed in Services.</p>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-[#dce7d5] pt-4 text-xs">
        <span className="text-[#82917a]">Environment</span>
        <span className="font-semibold text-[#41583a]">Development</span>
      </div>
      <Link href="/services" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#4b773b] hover:underline">View services <span aria-hidden="true">↗</span></Link>
    </section>
  );
}

function getFirstName(email?: string | null) {
  if (!email) return "there";
  const name = email.split("@")[0];
  if (!name) return "there";
  return name.split(/[.\_-]/)[0].replace(/^\w/, (char) => char.toUpperCase());
}
