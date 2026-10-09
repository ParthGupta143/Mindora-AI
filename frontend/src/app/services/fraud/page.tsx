"use client";

import { useState, FormEvent } from "react";

import { ProtectedRoute } from "@/components/ProtectedRoute";

import { useAuth } from "@/lib/auth-context";

import { api, ApiError } from "@/lib/api";

import {

  FraudCheckRequest,

  FraudCheckResponse,

} from "@/lib/types";

const MERCHANT_CATEGORIES = [

  "electronics",

  "groceries",

  "travel",

  "entertainment",

  "other",

];

function RiskBadge({ level }: { level: string }) {

  const normalizedLevel = level.toUpperCase();

  const styles: Record<string, string> = {

    HIGH:

      "bg-[#FFF1EF] text-[#A13F35] border-[#F0D6D2]",

    MEDIUM:

      "bg-[#FFF8E8] text-[#98752E] border-[#F1E4C5]",

    LOW:

      "bg-[#EDF5E8] text-[#386C3A] border-[#DCEBD4]",

  };

  const dots: Record<string, string> = {

    HIGH: "bg-[#D95F52]",

    MEDIUM: "bg-[#D9A441]",

    LOW: "bg-[#75B85A]",

  };

  return (

    <span

      className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium border ${styles[normalizedLevel] ??

        "bg-[#F4F6F2] text-[#737B73] border-[#E2E9DE]"

        }`}

    >

      <span

        className={`h-1.5 w-1.5 rounded-full ${dots[normalizedLevel] ?? "bg-[#929A91]"

          }`}

      />

      {normalizedLevel}

    </span>

  );

}

function FieldLabel({

  children,

  hint,

}: {

  children: React.ReactNode;

  hint?: string;

}) {

  return (

    <div className="flex items-center justify-between mb-2">

      <label className="text-xs font-medium text-[#30382F]">

        {children}

      </label>

      {hint && (

        <span className="text-[10px] text-[#899186]">

          {hint}

        </span>

      )}

    </div>

  );

}

const inputClassName =

  "w-full h-11 rounded-xl border border-[#DDE5D9] bg-[#FCFDFC] px-3.5 text-sm text-[#20251F] outline-none transition placeholder:text-[#A0A99D] focus:border-[#75BF50] focus:ring-4 focus:ring-[#9BE564]/20";

export default function FraudTestPage() {

  const { token } = useAuth();

  const [form, setForm] = useState<FraudCheckRequest>({

    amount: 100,

    transaction_hour: 12,

    merchant_category: "electronics",

    customer_age: 30,

    previous_transactions: 5,

  });

  const [result, setResult] =

    useState<FraudCheckResponse | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  function updateField<K extends keyof FraudCheckRequest>(

    key: K,

    value: FraudCheckRequest[K]

  ) {

    setForm((f) => ({

      ...f,

      [key]: value,

    }));

  }

  async function handleSubmit(e: FormEvent) {

    e.preventDefault();

    setLoading(true);

    setError(null);

    setResult(null);

    try {

      const res = await api.post<FraudCheckResponse>(

        "/fraud/test",

        form,

        token

      );

      setResult(res);

    } catch (err) {

      setError(

        err instanceof ApiError

          ? err.message

          : "Failed to analyze transaction"

      );

    } finally {

      setLoading(false);

    }

  }

  return (

    <ProtectedRoute>

      <div className="max-w-[1400px] mx-auto">

        {/* ================================================= */}

        {/* Header */}

        {/* ================================================= */}

        <section className="mb-8">

          <p className="text-xs uppercase tracking-[0.18em] text-[#4D8050] font-medium mb-3">

            AIaaS / Services / Fraud Detection

          </p>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">

            <div>

              <h1 className="text-3xl font-semibold tracking-tight text-[#20251F]">

                Fraud Detection

              </h1>

              <p className="mt-2 text-sm text-[#778074]">

                Test the fraud detection model using a transaction.

              </p>

            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#E2E9DE] bg-white px-3.5 py-2 text-xs text-[#566451] shadow-sm">

              <span className="h-2 w-2 rounded-full bg-[#75B85A]" />

              Model operational

            </div>

          </div>

        </section>

        {/* ================================================= */}

        {/* Main grid */}

        {/* ================================================= */}

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-5">

          {/* ================================================= */}

          {/* Transaction form */}

          {/* ================================================= */}

          <section className="rounded-2xl border border-[#E3E9DF] bg-white shadow-[0_8px_30px_rgba(28,55,31,0.035)]">

            <div className="px-5 py-4 border-b border-[#EEF1EB]">

              <div className="flex items-center gap-3">

                <div className="h-10 w-10 rounded-xl bg-[#F4F8F0] border border-[#E2EBDD] flex items-center justify-center text-[#4D8050]">

                  ✦

                </div>

                <div>

                  <h2 className="text-sm font-semibold text-[#20251F]">

                    Transaction details

                  </h2>

                  <p className="text-xs text-[#899186] mt-0.5">

                    Provide the transaction attributes for analysis.

                  </p>

                </div>

              </div>

            </div>

            <form

              onSubmit={handleSubmit}

              className="p-5 sm:p-6 space-y-5"

            >

              {/* Amount */}

              <div>

                <FieldLabel hint="USD">

                  Amount

                </FieldLabel>

                <div className="relative">

                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#899186]">

                    $

                  </span>

                  <input

                    type="number"

                    min={0}

                    step="0.01"

                    value={form.amount}

                    onChange={(e) =>

                      updateField(

                        "amount",

                        parseFloat(e.target.value) || 0

                      )

                    }

                    className={`${inputClassName} pl-7`}

                  />

                </div>

              </div>

              {/* Transaction hour */}

              <div>

                <FieldLabel hint="0–23">

                  Transaction hour

                </FieldLabel>

                <input

                  type="number"

                  min={0}

                  max={23}

                  value={form.transaction_hour}

                  onChange={(e) =>

                    updateField(

                      "transaction_hour",

                      parseInt(e.target.value) || 0

                    )

                  }

                  className={inputClassName}

                />

              </div>

              {/* Merchant category */}

              <div>

                <FieldLabel>

                  Merchant category

                </FieldLabel>

                <select

                  value={form.merchant_category}

                  onChange={(e) =>

                    updateField(

                      "merchant_category",

                      e.target.value

                    )

                  }

                  className={inputClassName}

                >

                  {MERCHANT_CATEGORIES.map((cat) => (

                    <option

                      key={cat}

                      value={cat}

                      className="bg-white text-[#20251F]"

                    >

                      {cat}

                    </option>

                  ))}

                </select>

              </div>

              {/* Customer age */}

              <div>

                <FieldLabel hint="Years">

                  Customer age

                </FieldLabel>

                <input

                  type="number"

                  min={0}

                  max={120}

                  value={form.customer_age}

                  onChange={(e) =>

                    updateField(

                      "customer_age",

                      parseInt(e.target.value) || 0

                    )

                  }

                  className={inputClassName}

                />

              </div>

              {/* Previous transactions */}

              <div>

                <FieldLabel>

                  Previous transactions

                </FieldLabel>

                <input

                  type="number"

                  min={0}

                  value={form.previous_transactions}

                  onChange={(e) =>

                    updateField(

                      "previous_transactions",

                      parseInt(e.target.value) || 0

                    )

                  }

                  className={inputClassName}

                />

              </div>

              {/* Error */}

              {error && (

                <div className="rounded-xl border border-[#F0D6D2] bg-[#FFF5F3] px-3 py-2.5">

                  <p className="text-xs text-[#A13F35]">

                    {error}

                  </p>

                </div>

              )}

              {/* Submit */}

              <button

                type="submit"

                disabled={loading}

                className="

                  w-full

                  h-10

                  rounded-md

                  bg-[#9BE564]

                  text-[#17351C]

                  text-sm

                  font-semibold

                  transition-all

                  hover:bg-[#9BE564]-hover

                  disabled:opacity-50

                  disabled:cursor-not-allowed

                "

              >

                {loading

                  ? "Analyzing transaction..."

                  : "Run prediction"}

              </button>

            </form>

          </section>

          {/* ================================================= */}

          {/* Result panel */}

          {/* ================================================= */}

          <section className="rounded-2xl border border-[#E3E9DF] bg-white min-h-[500px] shadow-[0_8px_30px_rgba(28,55,31,0.035)]">

            <div className="px-5 py-4 border-b border-[#EEF1EB]">

              <div>

                <h2 className="text-sm font-semibold text-[#20251F]">

                  Prediction result

                </h2>

                <p className="text-xs text-[#899186] mt-0.5">

                  Model output from the latest transaction analysis.

                </p>

              </div>

            </div>

            <div className="p-5">

              {/* Empty state */}

              {!error && !result && !loading && (

                <div className="min-h-[400px] flex items-center justify-center">

                  <div className="text-center max-w-xs">

                    <div className="mx-auto h-12 w-12 rounded-xl border border-[#E2EBDD] bg-[#F4F8F0] flex items-center justify-center text-[#4D8050] text-lg">

                      ◇

                    </div>

                    <p className="text-sm text-[#20251F] mt-4">

                      No prediction yet

                    </p>

                    <p className="text-xs text-[#778074] leading-5 mt-1">

                      Submit a transaction on the left to see

                      the model prediction and risk analysis.

                    </p>

                  </div>

                </div>

              )}

              {/* Loading */}

              {loading && (

                <div className="min-h-[400px] flex items-center justify-center">

                  <div className="text-center">

                    <div className="mx-auto h-8 w-8 rounded-full border-2 border-[#E2E9DE] border-t-[#75B85A] animate-spin" />

                    <p className="text-sm text-[#20251F] mt-4">

                      Analyzing transaction

                    </p>

                    <p className="text-xs text-[#778074] mt-1">

                      Running the fraud detection model...

                    </p>

                  </div>

                </div>

              )}

              {/* Result */}

              {result && (

                <div className="space-y-6">

                  {/* Main prediction */}

                  <div className="rounded-2xl border border-[#E3E9DF] bg-[#F9FBF7] p-5">

                    <p className="text-[10px] uppercase tracking-wider text-[#899186]">

                      Prediction

                    </p>

                    <div className="flex items-center justify-between gap-4 mt-2">

                      <p className="text-2xl font-semibold uppercase text-[#20251F]">

                        {result.prediction}

                      </p>

                      <RiskBadge level={result.risk_level} />

                    </div>

                  </div>

                  {/* Metrics */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <div className="rounded-xl border border-[#E3E9DF] bg-white p-4">

                      <p className="text-[10px] uppercase tracking-wider text-[#899186]">

                        Fraud probability

                      </p>

                      <p className="text-xl font-semibold text-[#20251F] mt-2">

                        {(result.fraud_probability * 100).toFixed(0)}%

                      </p>

                    </div>

                    <div className="rounded-xl border border-[#E3E9DF] bg-white p-4">

                      <p className="text-[10px] uppercase tracking-wider text-[#899186]">

                        Model version

                      </p>

                      <p className="text-sm font-medium text-[#20251F] mt-3">

                        {result.model_version}

                      </p>

                    </div>

                  </div>

                  {/* Risk factors */}

                  <div>

                    <div className="flex items-center justify-between mb-3">

                      <h3 className="text-xs font-medium text-[#30382F]">

                        Risk factors

                      </h3>

                      <span className="text-[10px] text-[#899186]">

                        {result.top_risk_factors.length} detected

                      </span>

                    </div>

                    <div className="space-y-2">

                      {result.top_risk_factors.map((factor) => (

                        <div

                          key={factor}

                          className="flex items-center gap-3 rounded-xl border border-[#E3E9DF] bg-white px-3 py-2.5"

                        >

                          <span className="h-1.5 w-1.5 rounded-full bg-[#75B85A] shrink-0" />

                          <span className="text-sm text-[#30382F] capitalize">

                            {factor.replace(/_/g, " ")}

                          </span>

                        </div>

                      ))}

                    </div>

                  </div>

                  {/* Request ID */}

                  <div className="pt-4 border-t border-[#EEF1EB]">

                    <div className="flex items-center justify-between gap-4">

                      <span className="text-[10px] uppercase tracking-wider text-[#899186]">

                        Request ID

                      </span>

                      <span className="text-[10px] font-mono text-[#899186] truncate">

                        {result.request_id}

                      </span>

                    </div>

                  </div>

                </div>

              )}

            </div>

          </section>

        </div>

        {/* ================================================= */}

        {/* Service info */}

        {/* ================================================= */}

        <div className="mt-5 rounded-2xl border border-[#E3E9DF] bg-white px-5 py-4 shadow-sm">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div className="flex items-center gap-2">

              <span className="h-2 w-2 rounded-full bg-[#75B85A]" />

              <span className="text-xs text-[#566451]">

                Fraud Detection API operational

              </span>

            </div>

            <span className="text-xs text-[#899186]">

              Real-time transaction scoring

            </span>

          </div>

        </div>

      </div>

    </ProtectedRoute>

  );

}