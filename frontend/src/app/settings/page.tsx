"use client";

import { useState, FormEvent } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#e5ebdf] bg-white shadow-sm">
      <div className="border-b border-[#edf0e9] px-5 py-4 sm:px-6">
        <h2 className="text-sm font-semibold text-[#29382d]">{title}</h2>
        {description && (
          <p className="mt-1 text-xs leading-5 text-[#7b8677]">{description}</p>
        )}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const { user, token } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      await api.post(
        "/auth/change-password",
        {
          current_password: currentPassword,
          new_password: newPassword,
        },
        token
      );
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to change password"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-[1100px]">
        {/* Page header */}
        <header className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#63815d]">
            AIaaS / Preferences
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#243328]">
            Settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#778174]">
            Manage your account details and keep your Mindora account secure.
          </p>
        </header>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {/* Account details */}
          <SettingsSection
            title="Account information"
            description="Your profile details associated with this workspace."
          >
            <div className="mb-6 flex items-center gap-4 rounded-xl border border-[#e8eee2] bg-[#f8faf6] p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e6f0df] text-lg font-semibold text-[#356344]">
                {(user?.email?.[0] ?? "U").toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#29382d]">
                  {user?.email ?? "Account"}
                </p>
                <p className="mt-1 text-xs text-[#7b8677]">
                  Mindora workspace member
                </p>
              </div>
              <span className="ml-auto shrink-0 rounded-full border border-[#dce9d5] bg-[#edf5e8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#356344]">
                Active
              </span>
            </div>

            <dl className="divide-y divide-[#edf0e9]">
              <div className="flex flex-col gap-1 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                <dt className="text-xs text-[#899481]">Email address</dt>
                <dd className="break-all text-sm font-medium text-[#344337]">
                  {user?.email ?? "—"}
                </dd>
              </div>
              <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                <dt className="text-xs text-[#899481]">Role</dt>
                <dd>
                  <span className="inline-flex rounded-full border border-[#e5ebdf] bg-[#f8faf6] px-3 py-1 text-xs font-medium capitalize text-[#566451]">
                    {user?.role ?? "—"}
                  </span>
                </dd>
              </div>
              <div className="flex flex-col gap-1 py-4 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                <dt className="text-xs text-[#899481]">Organization ID</dt>
                <dd className="break-all font-mono text-xs text-[#566451]">
                  {user?.org_id ?? "—"}
                </dd>
              </div>
            </dl>
          </SettingsSection>

          {/* Password settings */}
          <SettingsSection
            title="Security & password"
            description="Change your password regularly to help protect your account."
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  role="status"
                  className="rounded-xl border border-[#d8e8cf] bg-[#f0f7eb] px-4 py-3 text-sm text-[#356344]"
                >
                  Password updated successfully.
                </div>
              )}

              <div>
                <label
                  htmlFor="current-password"
                  className="mb-2 block text-xs font-medium text-[#4f5d4c]"
                >
                  Current password
                </label>
                <input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#dfe7d9] bg-white px-4 py-3 text-sm text-[#29382d] outline-none transition placeholder:text-[#a0a99b] focus:border-[#8eae80] focus:ring-4 focus:ring-[#edf5e8]"
                  placeholder="Enter your current password"
                />
              </div>

              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-xs font-medium text-[#4f5d4c]"
                >
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-[#dfe7d9] bg-white px-4 py-3 text-sm text-[#29382d] outline-none transition placeholder:text-[#a0a99b] focus:border-[#8eae80] focus:ring-4 focus:ring-[#edf5e8]"
                  placeholder="At least 8 characters"
                />
                <p className="mt-2 text-[11px] leading-5 text-[#899481]">
                  Use at least 8 characters for your new password.
                </p>
              </div>

              <div className="border-t border-[#edf0e9] pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#26392b] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#354b39] focus:outline-none focus:ring-4 focus:ring-[#e4efdd] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {saving ? "Updating password..." : "Update password"}
                </button>
              </div>
            </form>
          </SettingsSection>
        </div>

        {/* Security note */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#e5ebdf] bg-[#f8faf6] p-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#dce9d5] bg-[#edf5e8] text-sm font-semibold text-[#356344]">
            i
          </div>
          <div>
            <p className="text-sm font-semibold text-[#344337]">
              Keep your account secure
            </p>
            <p className="mt-1 text-xs leading-5 text-[#778174]">
              Never share your password. If you did not request a password
              change, contact your workspace administrator.
            </p>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
