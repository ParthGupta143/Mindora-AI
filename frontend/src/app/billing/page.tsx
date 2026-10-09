"use client";

import { useEffect, useState } from "react";

import { ProtectedRoute } from "@/components/ProtectedRoute";

import { useAuth } from "@/lib/auth-context";

import { api, ApiError } from "@/lib/api";

import { BillingSummary } from "@/lib/types";

export default function BillingPage() {

  const { token } = useAuth();

  const [summary, setSummary] =

    useState<BillingSummary | null>(null);

  const [error, setError] =

    useState<string | null>(null);

  useEffect(() => {

    api

      .get<BillingSummary>("/billing/summary", token)

      .then(setSummary)

      .catch((err) =>

        setError(

          err instanceof ApiError

            ? err.message

            : "Failed to load billing"

        )

      );

  }, [token]);

  return (

    <ProtectedRoute>

      <div className="mx-auto max-w-[1400px]">

        {/* ================================================= */}

        {/* Header */}

        {/* ================================================= */}

        <section className="mb-8">

          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-[#4D8050]">

            AIaaS / Billing

          </p>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">

            <div>

              <h1 className="text-3xl font-semibold tracking-tight text-[#20251F]">

                Billing

              </h1>

              <p className="mt-2 text-sm text-[#778074]">

                Review usage-based costs across your AI services.

              </p>

            </div>

            {summary && (

              <div className="text-xs text-[#899186]">

                Period: {summary.period}

              </div>

            )}

          </div>

        </section>

        {/* ================================================= */}

        {/* Simulation notice */}

        {/* ================================================= */}

        <div className="mb-6 rounded-2xl border border-[#DCEBD4] bg-[#F7FAF5]">

          <div className="px-5 py-4 flex items-start gap-3">

            <div className="h-9 w-9 shrink-0 rounded-lg border border-[#E2EBDD] bg-[#EDF5E8] text-[#386C3A] flex items-center justify-center text-sm">

              $

            </div>

            <div>

              <p className="text-sm font-semibold text-[#30382F]">

                Simulated billing

              </p>

              <p className="mt-1 text-xs leading-5 text-[#778074]">

                This page shows estimated usage-based charges.

                It is not connected to real payment processing.

              </p>

            </div>

          </div>

        </div>

        {/* ================================================= */}

        {/* Error */}

        {/* ================================================= */}

        {error && (

          <div className="mb-6 rounded-xl border border-[#F0D6D2] bg-[#FFF5F3] px-4 py-3">

            <p className="text-xs text-[#A13F35]">

              {error}

            </p>

          </div>

        )}

        {/* ================================================= */}

        {/* Loading */}

        {/* ================================================= */}

        {!error && summary === null && (

          <div className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {[1, 2, 3].map((item) => (

                <div

                  key={item}

                  className="animate-pulse rounded-2xl border border-[#E3E9DF] bg-white p-5"

                >

                  <div className="h-3 w-24 rounded bg-[#F0F4ED]" />

                  <div className="h-8 w-32 rounded bg-[#F0F4ED] mt-4" />

                  <div className="h-3 w-28 rounded bg-[#F0F4ED] mt-3" />

                </div>

              ))}

            </div>

            <div className="rounded-lg border border-[#E3E9DF] bg-white h-64 animate-pulse" />

          </div>

        )}

        {/* ================================================= */}

        {/* Billing */}

        {/* ================================================= */}

        {summary && (

          <>

            {/* ================================================= */}

            {/* Summary cards */}

            {/* ================================================= */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Total cost */}

              <div className="rounded-2xl border border-[#E3E9DF] bg-white p-5 shadow-[0_8px_30px_rgba(28,55,31,0.035)]">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-[10px] font-medium uppercase tracking-wider text-[#929A91]">

                      Estimated cost

                    </p>

                    <p className="mt-3 text-3xl font-semibold tracking-tight text-[#20251F]">

                      $

                      {summary.total_estimated_cost.toFixed(4)}

                    </p>

                    <p className="mt-2 text-xs text-[#778074]">

                      Total for {summary.period}

                    </p>

                  </div>

                  <div className="h-9 w-9 rounded-lg bg-[#FFF8E8] border border-[#F1E4C5] flex items-center justify-center text-[#98752E]">

                    $

                  </div>

                </div>

              </div>

              {/* Services */}

              <div className="rounded-2xl border border-[#E3E9DF] bg-white p-5 shadow-[0_8px_30px_rgba(28,55,31,0.035)]">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-[10px] font-medium uppercase tracking-wider text-[#929A91]">

                      Services used

                    </p>

                    <p className="mt-3 text-3xl font-semibold tracking-tight text-[#20251F]">

                      {summary.lines.length}

                    </p>

                    <p className="mt-2 text-xs text-[#778074]">

                      Services included in this period

                    </p>

                  </div>

                  <div className="h-9 w-9 rounded-lg border border-[#E2EBDD] bg-[#EDF5E8] text-[#386C3A] flex items-center justify-center">

                    ◇

                  </div>

                </div>

              </div>

              {/* Requests */}

              <div className="rounded-2xl border border-[#E3E9DF] bg-white p-5 shadow-[0_8px_30px_rgba(28,55,31,0.035)]">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-[10px] font-medium uppercase tracking-wider text-[#929A91]">

                      Requests billed

                    </p>

                    <p className="mt-3 text-3xl font-semibold tracking-tight text-[#20251F]">

                      {summary.lines

                        .reduce(

                          (total, line) =>

                            total + line.requests_used,

                          0

                        )

                        .toLocaleString()}

                    </p>

                    <p className="mt-2 text-xs text-[#778074]">

                      Total requests across services

                    </p>

                  </div>

                  <div className="h-9 w-9 rounded-lg bg-[#EDF5E8] border border-[#DCEBD4] flex items-center justify-center text-[#4D8050]">

                    ≋

                  </div>

                </div>

              </div>

            </div>

            {/* ================================================= */}

            {/* Service breakdown */}

            {/* ================================================= */}

            <section className="mt-6 overflow-hidden rounded-2xl border border-[#E3E9DF] bg-white shadow-[0_8px_30px_rgba(28,55,31,0.035)]">

              <div className="px-5 py-4 border-b border-[#EEF1EB]">

                <div>

                  <h2 className="text-sm font-semibold text-[#30382F]">

                    Service breakdown

                  </h2>

                  <p className="text-xs text-[#899186] mt-0.5">

                    Estimated charges by AI service.

                  </p>

                </div>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead>

                    <tr className="border-b border-[#EEF1EB] text-left">

                      <th className="px-5 py-3 text-[10px] font-medium uppercase tracking-wider text-[#929A91]">

                        Service

                      </th>

                      <th className="px-5 py-3 text-[10px] font-medium uppercase tracking-wider text-[#929A91]">

                        Requests

                      </th>

                      <th className="px-5 py-3 text-[10px] font-medium uppercase tracking-wider text-[#929A91]">

                        Price / Request

                      </th>

                      <th className="px-5 py-3 text-[10px] font-medium uppercase tracking-wider text-[#929A91] text-right">

                        Estimated Cost

                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {summary.lines.map((line) => (

                      <tr

                        key={line.service_slug}

                        className="border-b border-[#EEF1EB] last:border-b-0 hover:bg-[#F0F4ED]/60 transition-colors"

                      >

                        {/* Service */}

                        <td className="px-5 py-4">

                          <div>

                            <p className="font-medium text-[#30382F]">

                              {line.service_name}

                            </p>

                            <p className="text-[11px] text-[#899186] mt-0.5 font-mono">

                              {line.service_slug}

                            </p>

                          </div>

                        </td>

                        {/* Requests */}

                        <td className="px-5 py-4">

                          <span className="text-[#30382F]">

                            {line.requests_used.toLocaleString()}

                          </span>

                        </td>

                        {/* Price */}

                        <td className="px-5 py-4">

                          <span className="font-mono text-xs text-[#778074]">

                            $

                            {line.price_per_request.toFixed(4)}

                          </span>

                        </td>

                        {/* Cost */}

                        <td className="px-5 py-4 text-right">

                          <span className="font-medium text-[#30382F]">

                            $

                            {line.estimated_cost.toFixed(4)}

                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              {/* ================================================= */}

              {/* Total */}

              {/* ================================================= */}

              <div className="px-5 py-5 border-t border-[#E3E9DF] bg-[#F0F4ED]/40">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm font-semibold text-[#30382F]">

                      Total estimated cost

                    </p>

                    <p className="text-xs text-[#899186] mt-1">

                      Based on recorded usage for {summary.period}.

                    </p>

                  </div>

                  <p className="text-2xl font-semibold text-[#30382F]">

                    $

                    {summary.total_estimated_cost.toFixed(4)}

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
