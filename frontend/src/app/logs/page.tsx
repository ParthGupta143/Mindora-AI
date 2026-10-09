"use client";
import { useEffect, useState, useCallback } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { RequestLogsResponse } from "@/lib/types";
const PAGE_SIZE = 10;
function StatusPill({ code }: { code: number }) {
  const ok = code < 400;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium border ${
        ok
          ? "bg-[#edf5e8] text-[#245b35] border-[#d9e8d1]"
          : "bg-[#fff0ee] text-[#b9382f] border-[#f4d3cf]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          ok ? "bg-[#3f8a52]" : "bg-[#d84a43]"
        }`}
      />
      {code}
    </span>
  );
}
export default function LogsPage() {
  const { token } = useAuth();
  const [data, setData] =
    useState<RequestLogsResponse | null>(null);
  const [error, setError] =
    useState<string | null>(null);
  const [page, setPage] = useState(1);
  const loadLogs = useCallback(
    (targetPage: number) => {
      setError(null);
      api
        .get<RequestLogsResponse>(
          `/logs?page=${targetPage}&page_size=${PAGE_SIZE}`,
          token
        )
        .then(setData)
        .catch((err) =>
          setError(
            err instanceof ApiError
              ? err.message
              : "Failed to load logs"
          )
        );
    },
    [token]
  );
  useEffect(() => {
    loadLogs(page);
  }, [page, loadLogs]);
  const totalPages = data
    ? Math.max(1, Math.ceil(data.total / PAGE_SIZE))
    : 1;
  return (
    <ProtectedRoute>
      <div className="max-w-[1400px] mx-auto">
        {/* ================================================= */}
        {/* Header */}
        {/* ================================================= */}
        <section className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-[#47734b] font-medium mb-3">
            AIaaS / Request Logs
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#25352a]">
                Request Logs
              </h1>
              <p className="mt-2 text-sm text-[#566451]">
                Review recent API activity across your services.
              </p>
            </div>
            {data && (
              <div className="text-xs text-[#879181]">
                {data.total.toLocaleString()}{" "}
                {data.total === 1 ? "request" : "requests"}
              </div>
            )}
          </div>
        </section>
        {/* ================================================= */}
        {/* Error */}
        {/* ================================================= */}
        {error && (
          <div className="mb-6 rounded-lg border border-[#f4d3cf] bg-[#fff0ee] px-4 py-3">
            <p className="text-xs text-[#b9382f]">
              {error}
            </p>
          </div>
        )}
        {/* ================================================= */}
        {/* Loading */}
        {/* ================================================= */}
        {!error && data === null && (
          <div className="rounded-lg border border-[#e2e9de] bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e2e9de]">
              <div className="h-4 w-32 rounded bg-[#f6f8f3] animate-pulse" />
            </div>
            <div className="divide-y divide-border">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="px-5 py-4 flex items-center gap-6 animate-pulse"
                >
                  <div className="h-4 w-24 rounded bg-[#f6f8f3]" />
                  <div className="h-5 w-14 rounded-full bg-[#f6f8f3]" />
                  <div className="h-4 w-20 rounded bg-[#f6f8f3]" />
                  <div className="h-4 w-20 rounded bg-[#f6f8f3]" />
                  <div className="h-4 w-32 rounded bg-[#f6f8f3] ml-auto" />
                </div>
              ))}
            </div>
          </div>
        )}
        {/* ================================================= */}
        {/* Empty */}
        {/* ================================================= */}
        {data && data.items.length === 0 && (
          <div className="rounded-lg border border-[#e2e9de] bg-white min-h-64 flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="mx-auto h-11 w-11 rounded-md border border-[#e2e9de] bg-[#f6f8f3] flex items-center justify-center text-[#47734b]">
                ≡
              </div>
              <p className="text-sm text-[#25352a] mt-4">
                No requests logged yet
              </p>
              <p className="text-xs text-[#879181] mt-1">
                API activity will appear here once your
                services receive requests.
              </p>
            </div>
          </div>
        )}
        {/* ================================================= */}
        {/* Logs table */}
        {/* ================================================= */}
        {data && data.items.length > 0 && (
          <section className="rounded-lg border border-[#e2e9de] bg-white overflow-hidden">
            {/* Table heading */}
            <div className="px-5 py-4 border-b border-[#e2e9de]">
              <div>
                <h2 className="text-sm font-medium text-[#25352a]">
                  Recent requests
                </h2>
                <p className="text-xs text-[#879181] mt-0.5">
                  Latest API activity recorded by the platform.
                </p>
              </div>
            </div>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e2e9de] text-left">
                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-medium text-[#879181]">
                      Service
                    </th>
                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-medium text-[#879181]">
                      Status
                    </th>
                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-medium text-[#879181]">
                      Latency
                    </th>
                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-medium text-[#879181]">
                      Model
                    </th>
                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-medium text-[#879181] text-right">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-[#e2e9de] last:border-b-0 hover:bg-[#f6f8f3]/60 transition-colors"
                    >
                      {/* Service */}
                      <td className="px-5 py-4">
                        <span className="font-medium text-[#25352a]">
                          {log.service}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusPill
                          code={log.status_code}
                        />
                      </td>
                      {/* Latency */}
                      <td className="px-5 py-4">
                        <span className="font-medium text-[#25352a]">
                          {log.latency_ms.toFixed(1)} ms
                        </span>
                      </td>
                      {/* Model */}
                      <td className="px-5 py-4">
                        <code className="text-xs font-mono text-[#566451]">
                          {log.model_version ?? "—"}
                        </code>
                      </td>
                      {/* Time */}
                      <td className="px-5 py-4 text-right">
                        <span className="text-xs text-[#879181] whitespace-nowrap">
                          {new Date(
                            log.created_at
                          ).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* ================================================= */}
            {/* Pagination */}
            {/* ================================================= */}
            <div className="px-5 py-4 border-t border-[#e2e9de] flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-[#879181]">
                Showing{" "}
                <span className="text-[#25352a]">
                  {(page - 1) * PAGE_SIZE + 1}
                </span>
                {" "}–{" "}
                <span className="text-[#25352a]">
                  {Math.min(
                    page * PAGE_SIZE,
                    data.total
                  )}
                </span>
                {" "}of{" "}
                <span className="text-[#25352a]">
                  {data.total}
                </span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setPage((p) => Math.max(1, p - 1))
                  }
                  disabled={page <= 1}
                  className="
                    h-8
                    px-3
                    rounded-md
                    border
                    border-[#e2e9de]
                    text-xs
                    text-[#566451]
                    hover:text-[#25352a]
                    hover:bg-[#f6f8f3]
                    transition-colors
                    disabled:opacity-30
                    disabled:cursor-not-allowed
                  "
                >
                  Previous
                </button>
                <span className="h-8 min-w-20 px-3 rounded-md bg-[#f6f8f3] border border-[#e2e9de] flex items-center justify-center text-xs text-[#566451]">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) =>
                      Math.min(totalPages, p + 1)
                    )
                  }
                  disabled={page >= totalPages}
                  className="
                    h-8
                    px-3
                    rounded-md
                    border
                    border-[#e2e9de]
                    text-xs
                    text-[#566451]
                    hover:text-[#25352a]
                    hover:bg-[#f6f8f3]
                    transition-colors
                    disabled:opacity-30
                    disabled:cursor-not-allowed
                  "
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </ProtectedRoute>
  );
}
