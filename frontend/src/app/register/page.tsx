
"use client";

import { api } from "@/lib/api";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function Brand() {
  return (
    <Link
      href="/"
      aria-label="Mindora home"
      className="sd-brand inline-flex items-center gap-2.5 no-underline"
    >
      <span className="sd-brand-mark" aria-hidden="true">
        <i />
        <i />
        <b />
      </span>

      <span className="text-[25px] font-bold tracking-[-1.2px] text-[#20202E]">
        mindora<span className="text-[#92929F]">.ai</span>
      </span>
    </Link>
  );
}

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [organizationName, setOrganizationName] = useState("");

  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/auth/register", {
        email,
        password,
        organization_name: organizationName,
      });

      router.push("/login");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-[#DDE5D9] bg-[#FCFDFC] px-3.5 py-3 text-sm text-[#20251F] outline-none transition placeholder:text-[#A0A99D] focus:border-[#75BF50] focus:ring-4 focus:ring-[#9BE564]/20";

  const labelClass =
    "mb-2 block text-sm font-medium text-[#30382F]";

  return (
    <main className="min-h-screen bg-[#F6F8F4] text-[#20251F] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        {/* Mindora landing page branding */}
        <header className="mb-8 flex justify-center">
          <Brand />
        </header>

        {/* Registration card */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-[#E3E9DF] bg-white shadow-[0_16px_50px_rgba(28,55,31,0.07)]"
        >
          <div className="border-b border-[#E8EDE5] px-6 py-5 sm:px-8">
            <h1 className="text-xl font-semibold text-[#20251F]">
              Create your account
            </h1>

            <p className="mt-1 text-sm text-[#778074]">
              Get started with your Mindora AI workspace.
            </p>
          </div>

          <div className="px-6 py-7 sm:px-8">
            {error && (
              <div
                role="alert"
                className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <div className="mb-5">
              <label htmlFor="email" className={labelClass}>
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            <div className="mb-5">
              <label htmlFor="organizationName" className={labelClass}>
                Organization name
              </label>

              <input
                id="organizationName"
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                required
                autoComplete="organization"
                placeholder="Your organization"
                className={inputClass}
              />
            </div>

            <div className="mb-5">
              <label htmlFor="password" className={labelClass}>
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Create a password"
                className={inputClass}
              />

              <p className="mt-2 text-xs text-[#899186]">
                Use at least 8 characters.
              </p>
            </div>

            <div className="mb-7">
              <label htmlFor="confirmPassword" className={labelClass}>
                Confirm password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Enter your password again"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-[#9BE564] px-4 py-3 text-sm font-semibold text-[#17351C] transition hover:bg-[#8BD653] focus:outline-none focus:ring-4 focus:ring-[#9BE564]/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </div>

          <div className="border-t border-[#E8EDE5] bg-[#FAFCF8] px-6 py-5 text-center sm:px-8">
            <p className="text-sm text-[#778074]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#286A36] hover:text-[#174B28] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-[#899186]">
          Mindora AI · Secure Control Plane
        </p>
      </div>
    </main>
  );
}
