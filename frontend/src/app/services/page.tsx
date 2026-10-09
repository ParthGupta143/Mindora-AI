
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { api, ApiError } from "@/lib/api";
import { Service } from "@/lib/types";

function StatusBadge({ status }: { status: Service["status"] }) {
  const isProduction = status === "production";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
        isProduction
          ? "border-[#DCEBD4] bg-[#EDF5E8] text-[#386C3A]"
          : "border-[#F1E4C5] bg-[#FFF8E8] text-[#98752E]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isProduction ? "bg-[#75B85A]" : "bg-[#D9A441]"
        }`}
      />
      {isProduction ? "Production" : "Designed"}
    </span>
  );
}

function ServiceIcon({ isFraud }: { isFraud: boolean }) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E2EBDD] bg-[#F4F8F0] text-xl text-[#4D8050]">
      {isFraud ? "✦" : "◇"}
    </div>
  );
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Service[]>("/services")
      .then(setServices)
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "Failed to load services"
        )
      );
  }, []);

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <section className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E2E9DE] bg-white px-3.5 py-2 text-xs font-medium text-[#566451] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#78B94C]" />
              AIaaS / Services
            </span>

            {services && services.length > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E2E9DE] bg-white px-3.5 py-2 text-xs font-medium text-[#566451] shadow-sm">
                {services.length}{" "}
                {services.length === 1 ? "service" : "services"} available
              </span>
            )}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#20251F]">
                AI Services
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#778074]">
                Discover the AI capabilities available through your Mindora
                workspace.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E2E9DE] bg-white px-4 py-2.5 text-sm font-medium text-[#566451] shadow-sm transition hover:bg-[#F9FBF7] hover:shadow-md"
            >
              <span aria-hidden="true">←</span>
              Back to overview
            </Link>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-[#F0D6D2] bg-[#FFF5F3] px-4 py-3"
          >
            <p className="text-sm text-[#A13F35]">{error}</p>
          </div>
        )}

        {/* Loading */}
        {!error && services === null && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <ServiceSkeleton />
            <ServiceSkeleton />
          </div>
        )}

        {/* Empty state */}
        {services && services.length === 0 && (
          <div className="flex min-h-64 items-center justify-center rounded-2xl border border-[#E3E9DF] bg-white p-8 shadow-[0_8px_30px_rgba(28,55,31,0.04)]">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#E2EBDD] bg-[#F4F8F0] text-xl text-[#4D8050]">
                ◇
              </div>

              <h2 className="text-base font-semibold text-[#30382F]">
                No services available
              </h2>

              <p className="mt-2 text-sm text-[#778074]">
                AI services will appear here when they become available.
              </p>
            </div>
          </div>
        )}

        {/* Service cards */}
        {services && services.length > 0 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => {
              const isFraud = service.name
                .toLowerCase()
                .includes("fraud");

              const card = (
                <article
                  className={`group flex h-full flex-col rounded-2xl border border-[#E3E9DF] bg-white p-5 shadow-[0_8px_30px_rgba(28,55,31,0.035)] transition-all duration-200 ${
                    isFraud
                      ? "hover:-translate-y-0.5 hover:border-[#C9DFC0] hover:shadow-[0_14px_35px_rgba(28,55,31,0.08)]"
                      : "hover:border-[#D7E3D1] hover:shadow-[0_12px_30px_rgba(28,55,31,0.06)]"
                  }`}
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-3">
                    <ServiceIcon isFraud={isFraud} />
                    <StatusBadge status={service.status} />
                  </div>

                  {/* Service details */}
                  <div className="mt-5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold tracking-tight text-[#20251F]">
                        {service.name}
                      </h2>

                      {isFraud && (
                        <span className="rounded-full border border-[#E2EBDD] bg-[#F4F8F0] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#4D8050]">
                          API
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm leading-6 text-[#778074]">
                      {service.description}
                    </p>
                  </div>

                  {/* Price and action */}
                  <div className="mt-6 flex items-end justify-between gap-3 border-t border-[#EEF1EB] pt-4">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#929A91]">
                        Price
                      </p>

                      <p className="mt-1.5 text-base font-semibold text-[#30382F]">
                        ${service.price_per_request.toFixed(4)}
                        <span className="ml-1 text-xs font-normal text-[#899186]">
                          / request
                        </span>
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-2 rounded-full border border-[#E2E9DE] bg-white px-3 py-2 text-xs font-medium text-[#566451] transition group-hover:border-[#DCEBD4] group-hover:bg-[#F4F8F0] group-hover:text-[#386C3A]">
                      {isFraud ? "Open service" : "Available"}
                      {isFraud && <span aria-hidden="true">↗</span>}
                    </span>
                  </div>
                </article>
              );

              return isFraud ? (
                <Link
                  key={service.id}
                  href="/services/fraud"
                  className="block h-full rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#9BE564]/30"
                  aria-label={`Open ${service.name}`}
                >
                  {card}
                </Link>
              ) : (
                <div key={service.id} className="h-full">
                  {card}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom status */}
        {services && services.length > 0 && (
          <div className="mt-6 rounded-2xl border border-[#E2E9DE] bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EDF5E8] text-[#386C3A]">
                ✓
              </span>

              <div className="flex-1">
                <p className="text-sm font-medium text-[#30382F]">
                  Your service catalog
                </p>

                <p className="mt-1 text-xs text-[#778074]">
                  Service availability and pricing are provided by your
                  Mindora platform.
                </p>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full border border-[#E2E9DE] bg-white px-3 py-2 text-xs font-medium text-[#566451]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#78B94C]" />
                Catalog loaded
              </span>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

function ServiceSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#E3E9DF] bg-white p-5">
      <div className="flex justify-between">
        <div className="h-12 w-12 rounded-xl bg-[#F0F4ED]" />
        <div className="h-7 w-24 rounded-full bg-[#F0F4ED]" />
      </div>

      <div className="mt-5">
        <div className="h-5 w-40 rounded bg-[#F0F4ED]" />
        <div className="mt-3 h-3 w-full rounded bg-[#F0F4ED]" />
        <div className="mt-2 h-3 w-3/4 rounded bg-[#F0F4ED]" />
      </div>

      <div className="mt-6 border-t border-[#EEF1EB] pt-4">
        <div className="h-3 w-16 rounded bg-[#F0F4ED]" />
        <div className="mt-2 h-4 w-28 rounded bg-[#F0F4ED]" />
      </div>
    </div>
  );
}
