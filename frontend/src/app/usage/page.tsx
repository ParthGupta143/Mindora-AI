"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { UsageStats } from "@/lib/types";

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

export default function UsagePage() {
  const { token } = useAuth();

  const [stats, setStats] = useState<UsageStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<UsageStats>("/usage", token)
      .then(setStats)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Failed to load usage"
        )
      );
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
