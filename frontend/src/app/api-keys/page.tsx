

"use client";

import { useEffect, useState, FormEvent } from "react";

import { ProtectedRoute } from "@/components/ProtectedRoute";

import { useAuth } from "@/lib/auth-context";

import { api, ApiError } from "@/lib/api";

import { ApiKey, ApiKeyCreated } from "@/lib/types";

function StatusBadge({ status }: { status: ApiKey["status"] }) {

  const active = status === "active";

  return (

    <span

      className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium border ${

        active

          ? "bg-[#EDF5E8] text-[#386C3A] border-[#DCEBD4]"

          : "bg-[#F3F5F1] text-[#737B73] border-[#E5EAE1]"

      }`}

    >

      <span

        className={`h-1.5 w-1.5 rounded-full ${

          active ? "bg-[#75B85A]" : "bg-[#A3ACA0]"

        }`}

      />

      {active ? "Active" : "Revoked"}

    </span>

  );

}

export default function ApiKeysPage() {

  const { token } = useAuth();

  const [keys, setKeys] = useState<ApiKey[] | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [newKeyName, setNewKeyName] = useState("");

  const [creating, setCreating] = useState(false);

  const [revealedKey, setRevealedKey] =

    useState<ApiKeyCreated | null>(null);

  async function loadKeys() {

    try {

      const data = await api.get<ApiKey[]>("/api-keys", token);

      setKeys(data);

    } catch (err) {

      setError(

        err instanceof ApiError

          ? err.message

          : "Failed to load API keys"

      );

    }

  }

  useEffect(() => {

    loadKeys();

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, []);

  async function handleCreate(e: FormEvent) {

    e.preventDefault();

    if (!newKeyName.trim()) return;

    setCreating(true);

    setError(null);

    try {

      const created = await api.post<ApiKeyCreated>(

        "/api-keys",

        { name: newKeyName },

        token

      );

      setRevealedKey(created);

      setNewKeyName("");

      await loadKeys();

    } catch (err) {

      setError(

        err instanceof ApiError

          ? err.message

          : "Failed to create API key"

      );

    } finally {

      setCreating(false);

    }

  }

  async function handleRevoke(id: string) {

    if (

      !confirm(

        "Revoke this API key? This cannot be undone."

      )

    ) {

      return;

    }

    try {

      await api.delete(`/api-keys/${id}`, token);

      await loadKeys();

    } catch (err) {

      setError(

        err instanceof ApiError

          ? err.message

          : "Failed to revoke API key"

      );

    }

  }

  return (

    <ProtectedRoute>

      <div className="max-w-[1400px] mx-auto">

        {/* ================================================= */}

        {/* Header */}

        {/* ================================================= */}

        <section className="mb-8">

          <p className="text-xs uppercase tracking-[0.18em] text-[#386C3A] font-medium mb-3">

            AIaaS / API Keys

          </p>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">

            <div>

              <h1 className="text-3xl font-semibold tracking-tight text-[#20251F]">

                API Keys

              </h1>

              <p className="mt-2 text-sm text-[#566451]">

                Manage credentials used by your applications.

              </p>

            </div>

            {keys && (

              <div className="text-xs text-[#899186]">

                {keys.length}{" "}

                {keys.length === 1 ? "key" : "keys"} configured

              </div>

            )}

          </div>

        </section>

        {/* ================================================= */}

        {/* Newly created key */}

        {/* ================================================= */}

        {revealedKey && (

          <div className="mb-6 rounded-lg border border-[#F1E4C5] bg-[#FFFCF5] overflow-hidden">

            <div className="px-5 py-4 border-b border-[#F1E4C5]">

              <div className="flex items-start gap-3">

                <div className="h-9 w-9 shrink-0 rounded-md bg-[#FFF8E8] border border-[#F1E4C5] flex items-center justify-center text-[#98752E]">

                  !

                </div>

                <div>

                  <p className="text-sm font-medium text-[#20251F]">

                    API key created

                  </p>

                  <p className="text-xs text-[#566451] mt-1">

                    Copy this key now — you won&apos;t be able

                    to see it again.

                  </p>

                </div>

              </div>

            </div>

            <div className="p-5">

              <code className="block rounded-md border border-[#E3E9DF] bg-[#F4F8F0] px-4 py-3 text-xs font-mono text-[#30382F] break-all">

                {revealedKey.api_key}

              </code>

              <div className="flex items-center gap-2 mt-4">

                <button

                  onClick={() =>

                    navigator.clipboard.writeText(

                      revealedKey.api_key

                    )

                  }

                  className="

                    h-9

                    px-4

                    rounded-md

                    bg-[#EDF5E8]

                    text-[#245B35]

                    text-xs

                    font-semibold

                    hover:bg-[#EDF5E8]-hover

                    transition-colors

                  "

                >

                  Copy key

                </button>

                <button

                  onClick={() => setRevealedKey(null)}

                  className="

                    h-9

                    px-4

                    rounded-md

                    border

                    border-[#E3E9DF]

                    text-xs

                    text-[#566451]

                    hover:text-[#20251F]

                    hover:bg-[#F7FAF5]

                    transition-colors

                  "

                >

                  Dismiss

                </button>

              </div>

            </div>

          </div>

        )}

        {/* ================================================= */}

        {/* Create key */}

        {/* ================================================= */}

        <section className="rounded-2xl border border-[#E3E9DF] bg-white mb-6 shadow-[0_8px_30px_rgba(28,55,31,0.04)]">

          <div className="px-5 py-4 border-b border-[#E3E9DF]">

            <div className="flex items-center gap-3">

              <div className="h-9 w-9 rounded-md bg-[#EDF5E8] border border-[#DCEBD4] flex items-center justify-center text-[#386C3A]">

                +

              </div>

              <div>

                <h2 className="text-sm font-medium text-[#20251F]">

                  Create API key

                </h2>

                <p className="text-xs text-[#899186] mt-0.5">

                  Generate a credential for authenticating your application.

                </p>

              </div>

            </div>

          </div>

          <form

            onSubmit={handleCreate}

            className="p-5 flex flex-col sm:flex-row gap-3"

          >

            <input

              type="text"

              value={newKeyName}

              onChange={(e) =>

                setNewKeyName(e.target.value)

              }

              placeholder="Key name (e.g. Production)"

              className="

                h-10

                border

                border-[#E3E9DF]

                rounded-md

                bg-[#F7FAF5]

                px-3

                text-sm

                text-[#20251F]

                placeholder:text-[#899186]

                outline-none

                flex-1

                max-w-md

                focus:border-[#75B85A]

                focus:ring-1

                focus:ring-[#9BE564]/30

              "

            />

            <button

              type="submit"

              disabled={creating}

              className="

                h-10

                px-5

                rounded-md

                bg-[#EDF5E8]

                text-[#245B35]

                text-sm

                font-semibold

                hover:bg-[#EDF5E8]-hover

                transition-colors

                disabled:opacity-50

                disabled:cursor-not-allowed

              "

            >

              {creating ? "Creating..." : "Create API key"}

            </button>

          </form>

        </section>

        {/* ================================================= */}

        {/* Error */}

        {/* ================================================= */}

        {error && (

          <div className="mb-6 rounded-lg border border-[#F0D6D2] bg-[#FFF5F3] px-4 py-3">

            <p className="text-xs text-[#A13F35]">

              {error}

            </p>

          </div>

        )}

        {/* ================================================= */}

        {/* Loading */}

        {/* ================================================= */}

        {keys === null && !error && (

          <div className="rounded-2xl border border-[#E3E9DF] bg-white p-5">

            <div className="animate-pulse space-y-4">

              <div className="h-4 w-32 rounded bg-[#F7FAF5]" />

              <div className="h-10 w-full rounded bg-[#F7FAF5]" />

              <div className="h-10 w-full rounded bg-[#F7FAF5]" />

              <div className="h-10 w-full rounded bg-[#F7FAF5]" />

            </div>

          </div>

        )}

        {/* ================================================= */}

        {/* Empty state */}

        {/* ================================================= */}

        {keys && keys.length === 0 && (

          <div className="rounded-2xl border border-[#E3E9DF] bg-white min-h-64 flex items-center justify-center">

            <div className="text-center max-w-sm">

              <div className="mx-auto h-11 w-11 rounded-xl border border-[#E3E9DF] bg-[#F7FAF5] flex items-center justify-center text-[#386C3A]">

                ⌁

              </div>

              <p className="text-sm text-[#20251F] mt-4">

                No API keys yet

              </p>

              <p className="text-xs text-[#899186] mt-1">

                Create your first API key to authenticate

                requests to the platform.

              </p>

            </div>

          </div>

        )}

        {/* ================================================= */}

        {/* Keys table */}

        {/* ================================================= */}

        {keys && keys.length > 0 && (

          <section className="rounded-2xl border border-[#E3E9DF] bg-white overflow-hidden shadow-[0_8px_30px_rgba(28,55,31,0.04)]">

            {/* Table header */}

            <div className="px-5 py-4 border-b border-[#E3E9DF]">

              <div>

                <h2 className="text-sm font-medium text-[#20251F]">

                  Your API keys

                </h2>

                <p className="text-xs text-[#899186] mt-0.5">

                  Credentials associated with your organization.

                </p>

              </div>

            </div>

            {/* Desktop table */}

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead>

                  <tr className="border-b border-[#E3E9DF] text-left">

                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-medium text-[#899186]">

                      Name

                    </th>

                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-medium text-[#899186]">

                      Key

                    </th>

                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-medium text-[#899186]">

                      Status

                    </th>

                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-medium text-[#899186]">

                      Created

                    </th>

                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-medium text-[#899186] text-right">

                      Action

                    </th>

                  </tr>

                </thead>

                <tbody>

                  {keys.map((key) => (

                    <tr

                      key={key.id}

                      className="border-b border-[#E3E9DF] last:border-b-0 hover:bg-[#F7FAF5] transition-colors"

                    >

                      {/* Name */}

                      <td className="px-5 py-4">

                        <span className="font-medium text-[#20251F]">

                          {key.name}

                        </span>

                      </td>

                      {/* Key prefix */}

                      <td className="px-5 py-4">

                        <code className="text-xs font-mono text-[#566451]">

                          {key.key_prefix}...

                        </code>

                      </td>

                      {/* Status */}

                      <td className="px-5 py-4">

                        <StatusBadge status={key.status} />

                      </td>

                      {/* Created */}

                      <td className="px-5 py-4 text-xs text-[#899186]">

                        {new Date(

                          key.created_at

                        ).toLocaleDateString()}

                      </td>

                      {/* Action */}

                      <td className="px-5 py-4 text-right">

                        {key.status === "active" && (

                          <button

                            onClick={() =>

                              handleRevoke(key.id)

                            }

                            className="

                              text-xs

                              text-[#A13F35]

                              hover:text-[#8D352D]

                              transition-colors

                            "

                          >

                            Revoke

                          </button>

                        )}

                        {key.status === "revoked" && (

                          <span className="text-xs text-[#899186]">

                            —

                          </span>

                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            {/* Security footer */}

            <div className="px-5 py-3 border-t border-[#E3E9DF] bg-[#F7FAF5]">

              <div className="flex items-center gap-2">

                <span className="h-1.5 w-1.5 rounded-full bg-[#75B85A]" />

                <p className="text-[11px] text-[#899186]">

                  Raw API keys are only displayed once when created.

                </p>

              </div>

            </div>

          </section>

        )}

      </div>

    </ProtectedRoute>

  );

}