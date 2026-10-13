"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { UsageStats, RequestLogsResponse, RequestLogEntry } from "@/lib/types";

function StatCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e5ebdf] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#899481]">
            {label}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#243328]">
            {value}
          </p>

          <p className="mt-2 text-xs text-[#778174]">{description}</p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e1ebda] bg-[#edf5e8] text-sm font-medium text-[#356344]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function UsageAnalytics({ logs, isLoading }: { logs: RequestLogEntry[]; isLoading: boolean }) {
  const daily = buildDailyAnalytics(logs);
  const maxRequests = Math.max(1, ...daily.map((day) => day.requests));
  const maxLatency = Math.max(1, ...daily.map((day) => day.avgLatency));
  const services = logs.reduce<Record<string, number>>((acc, log) => {
    const name = log.service || "Unknown";
    acc[name] = (acc[name] ?? 0) + 1;
    return acc;
  }, {});
  const serviceEntries = Object.entries(services).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const sampleSize = logs.length;

  return (
    <section className="mt-6 space-y-4" aria-label="Usage analytics charts">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-[#e5ebdf] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[#2d3b30]">Request volume</h2>
              <p className="mt-1 text-xs text-[#899481]">Requests per day · last 7 days</p>
            </div>
            <span className="rounded-lg bg-[#edf5e8] px-2.5 py-1.5 text-xs font-semibold text-[#356344]">{sampleSize} logs</span>
          </div>
          {isLoading ? <ChartSkeleton /> : sampleSize === 0 ? <ChartEmpty /> : (
            <div className="mt-5 flex h-44 items-end gap-2 sm:gap-3">
              {daily.map((day) => (
                <div key={day.dateKey} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[10px] font-medium tabular-nums text-[#72816a]">{day.requests}</span>
                  <div className="flex h-[112px] w-full items-end rounded-t-md bg-[#f4f7f1]">
                    <div className="w-full rounded-t-md bg-[#9be564] transition-all" style={{ height: `${Math.max(day.requests > 0 ? 8 : 2, (day.requests / maxRequests) * 100)}%` }} />
                  </div>
                  <span className="text-[10px] text-[#899481]">{day.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#e5ebdf] bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-sm font-semibold text-[#2d3b30]">Success vs. errors</h2>
            <p className="mt-1 text-xs text-[#899481]">Response status from logged requests</p>
          </div>
          {isLoading ? <ChartSkeleton /> : sampleSize === 0 ? <ChartEmpty /> : (
            <div className="mt-6">
              <div className="flex h-4 overflow-hidden rounded-full bg-[#f4f7f1]">
                <div className="bg-[#78b957] transition-all" style={{ width: `${(logs.filter((log) => log.status_code >= 200 && log.status_code < 400).length / sampleSize) * 100}%` }} />
                <div className="bg-[#dc8580] transition-all" style={{ width: `${(logs.filter((log) => log.status_code < 200 || log.status_code >= 400).length / sampleSize) * 100}%` }} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#f4f8f0] p-4">
                  <span className="flex items-center gap-2 text-xs text-[#72816a]"><i className="h-2 w-2 rounded-full bg-[#78b957]" />Successful</span>
                  <p className="mt-2 text-2xl font-semibold text-[#315c2b]">{logs.filter((log) => log.status_code >= 200 && log.status_code < 400).length.toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-[#fff5f3] p-4">
                  <span className="flex items-center gap-2 text-xs text-[#9b716b]"><i className="h-2 w-2 rounded-full bg-[#dc8580]" />Errors</span>
                  <p className="mt-2 text-2xl font-semibold text-[#a54f48]">{logs.filter((log) => log.status_code < 200 || log.status_code >= 400).length.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#e5ebdf] bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-sm font-semibold text-[#2d3b30]">Average latency trend</h2>
            <p className="mt-1 text-xs text-[#899481]">Mean response time per day</p>
          </div>
          {isLoading ? <ChartSkeleton /> : sampleSize === 0 ? <ChartEmpty /> : (
            <div className="mt-5 h-44">
              <svg viewBox="0 0 320 130" role="img" aria-label="Average request latency grouped by day" className="h-full w-full">
                {[18, 48, 78, 108].map((y) => <line key={y} x1="10" y1={y} x2="310" y2={y} stroke="#e8eee3" strokeWidth="1" />)}
                <polyline points={daily.map((day, index) => `${10 + (index * 300) / 6},${108 - (day.avgLatency / maxLatency) * 86}`).join(" ")} fill="none" stroke="#477a43" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {daily.map((day, index) => <circle key={day.dateKey} cx={10 + (index * 300) / 6} cy={108 - (day.avgLatency / maxLatency) * 86} r="3" fill="#9be564" stroke="#477a43" strokeWidth="1.5" />)}
              </svg>
              <div className="mt-1 grid grid-cols-7 gap-1">{daily.map((day) => <p key={day.dateKey} className="text-center text-[10px] text-[#899481]">{day.label}</p>)}</div>
            </div>
          )}
          {!isLoading && sampleSize > 0 && <p className="mt-3 text-xs text-[#899481]">Overall sample average: {(logs.reduce((sum, log) => sum + log.latency_ms, 0) / sampleSize).toFixed(1)} ms</p>}
        </div>

        <div className="rounded-2xl border border-[#e5ebdf] bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-sm font-semibold text-[#2d3b30]">Usage by service</h2>
            <p className="mt-1 text-xs text-[#899481]">Share of latest logged requests</p>
          </div>
          {isLoading ? <ChartSkeleton /> : serviceEntries.length === 0 ? <ChartEmpty /> : (
            <div className="mt-5 space-y-4">
              {serviceEntries.map(([service, count]) => (
                <div key={service}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                    <span className="truncate font-medium text-[#43513e]">{service}</span>
                    <span className="tabular-nums text-[#899481]">{count} · {Math.round((count / sampleSize) * 100)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#edf1e9]">
                    <div className="h-full rounded-full bg-[#9be564]" style={{ width: `${(count / sampleSize) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {sampleSize > 0 && <p className="px-1 text-[10px] leading-4 text-[#9aa294]">Charts are calculated from the latest 100 request logs returned by the API. They are a recent sample, not complete historical totals. The KPI cards above use the backend's aggregate usage endpoint.</p>}
    </section>
  );
}

type DailyAnalyticsPoint = { label: string; dateKey: string; requests: number; errors: number; avgLatency: number };
function buildDailyAnalytics(logs: RequestLogEntry[]): DailyAnalyticsPoint[] {
  const now = new Date();
  const days: DailyAnalyticsPoint[] = [];
  for (let offset = 6; offset >= 0; offset--) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const dateKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    days.push({ label: day.toLocaleDateString(undefined, { weekday: "short" }), dateKey, requests: 0, errors: 0, avgLatency: 0 });
  }
  const latencyTotals: Record<string, { total: number; count: number }> = {};
  for (const log of logs) {
    const timestamp = (log as RequestLogEntry & { created_at?: string }).created_at;
    if (!timestamp) continue;
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) continue;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const day = days.find((item) => item.dateKey === key);
    if (!day) continue;
    day.requests += 1;
    if (log.status_code < 200 || log.status_code >= 400) day.errors += 1;
    const latency = latencyTotals[key] ?? { total: 0, count: 0 };
    latency.total += log.latency_ms;
    latency.count += 1;
    latencyTotals[key] = latency;
  }
  for (const day of days) {
    const latency = latencyTotals[day.dateKey];
    day.avgLatency = latency && latency.count ? latency.total / latency.count : 0;
  }
  return days;
}

function ChartSkeleton() {
  return <div className="mt-5 h-40 animate-pulse rounded-xl bg-[#f5f7f2]" />;
}
function ChartEmpty() {
  return <div className="mt-5 flex min-h-40 items-center justify-center rounded-xl border border-dashed border-[#dfe8d8] bg-[#fafcf8] px-4 text-center text-xs leading-5 text-[#858e80]">No request logs available yet. Run requests through Mindora to populate these charts.</div>;
}

export default function UsagePage() {
  const { token } = useAuth();

  const [stats, setStats] = useState<UsageStats | null>(null);
  const [logs, setLogs] = useState<RequestLogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get<UsageStats>("/usage", token)
      .then((data) => { if (active) setStats(data); })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof ApiError ? err.message : "Failed to load usage");
      });
    api
      .get<RequestLogsResponse>("/logs?page=1&page_size=100", token)
      .then((data) => { if (active) setLogs(data.items ?? []); })
      .catch(() => { if (active) setLogs([]); })
      .finally(() => { if (active) setLogsLoading(false); });
    return () => { active = false; };
  }, [token]);

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <section className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#63815d]">
            AIaaS / Usage
          </p>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#243328]">
                Usage &amp; Analytics
              </h1>
              <p className="mt-2 text-sm text-[#778174]">
                Monitor API consumption and estimated costs.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#e5ebdf] bg-white px-4 py-2 text-xs font-medium text-[#64715f] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#78a66a]" />
              Current usage
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading */}
        {!error && stats === null && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-[#e5ebdf] bg-white p-5 shadow-sm"
              >
                <div className="h-3 w-24 rounded bg-[#edf1e9]" />
                <div className="mt-4 h-9 w-28 rounded bg-[#edf1e9]" />
                <div className="mt-3 h-3 w-32 rounded bg-[#edf1e9]" />
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="API Requests"
                value={stats.total_requests.toLocaleString()}
                description="Total requests"
                icon="⌁"
              />

              <StatCard
                label="Success Rate"
                value={`${((1 - stats.error_rate) * 100).toFixed(1)}%`}
                description={`${stats.error_count.toLocaleString()} errors`}
                icon="✓"
              />

              <StatCard
                label="Avg. Latency"
                value={`${stats.avg_latency_ms.toFixed(0)} ms`}
                description="Average response time"
                icon="◈"
              />

              <StatCard
                label="Estimated Cost"
                value={`$${stats.estimated_cost.toFixed(4)}`}
                description="Current usage estimate"
                icon="$"
              />
            </div>

            {/* Detailed analytics charts derived from actual request logs */}
            <UsageAnalytics logs={logs} isLoading={logsLoading} />

            {/* Usage overview */}
            <section className="mt-6 overflow-hidden rounded-2xl border border-[#e5ebdf] bg-white shadow-sm">
              <div className="border-b border-[#edf0e9] px-5 py-4 sm:px-6">
                <h2 className="text-sm font-semibold text-[#2d3b30]">
                  Usage overview
                </h2>
                <p className="mt-1 text-xs text-[#899481]">
                  Current API consumption across your organization.
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Requests */}
                  <div className="rounded-xl border border-[#e5ebdf] bg-[#fafbf8] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#899481]">
                      Requests processed
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-[#243328]">
                      {stats.total_requests.toLocaleString()}
                    </p>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e8ede3]">
                      <div className="h-full w-full rounded-full bg-[#7ca76e]" />
                    </div>
                  </div>

                  {/* Errors */}
                  <div className="rounded-xl border border-[#e5ebdf] bg-[#fafbf8] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#899481]">
                      Errors
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-[#243328]">
                      {stats.error_count.toLocaleString()}
                    </p>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e8ede3]">
                      <div
                        className="h-full rounded-full bg-[#dc8580]"
                        style={{
                          width: `${Math.min(stats.error_rate * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-[11px] text-[#899481]">
                      {(stats.error_rate * 100).toFixed(1)}% of requests
                    </p>
                  </div>

                  {/* Cost */}
                  <div className="rounded-xl border border-[#e5ebdf] bg-[#fafbf8] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#899481]">
                      Estimated spend
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-[#243328]">
                      ${stats.estimated_cost.toFixed(4)}
                    </p>
                    <p className="mt-4 text-[11px] text-[#899481]">
                      Based on current usage
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Information */}
            <section className="mt-6 rounded-2xl border border-[#e5ebdf] bg-white shadow-sm">
              <div className="flex items-start gap-3 p-5 sm:p-6">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e1ebda] bg-[#edf5e8] text-sm font-semibold text-[#356344]">
                  i
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#2d3b30]">
                    About usage metrics
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#778174]">
                    Request counts, error rates, latency, and estimated costs
                    are calculated from activity recorded by the platform.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
