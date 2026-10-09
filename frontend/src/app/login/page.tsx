"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth, ApiError } from "@/lib/auth-context";

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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { login, isLoading } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      await login(email, password);

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");

      const destination =
        redirect &&
        redirect.startsWith("/") &&
        !redirect.startsWith("//")
          ? redirect
          : "/dashboard";

      router.replace(destination);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#F6F8F4] text-[#20251F] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        {/* Mindora landing page branding */}
        <header className="mb-8 flex justify-center">
          <Brand />
        </header>

        {/* Login card */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-[#E3E9DF] bg-white shadow-[0_16px_50px_rgba(28,55,31,0.07)]"
        >
          <div className="border-b border-[#E8EDE5] px-6 py-5 sm:px-8">
            <h2 className="text-xl font-semibold text-[#20251F]">
              Welcome back
            </h2>

            <p className="mt-1 text-sm text-[#778074]">
              Sign in to your Mindora AI workspace.
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
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#30382F]"
              >
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
                className="w-full rounded-lg border border-[#DDE5D9] bg-[#FCFDFC] px-3.5 py-3 text-sm text-[#20251F] outline-none transition placeholder:text-[#A0A99D] focus:border-[#75BF50] focus:ring-4 focus:ring-[#9BE564]/20"
              />
            </div>

            <div className="mb-7">
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#30382F]"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                className="w-full rounded-lg border border-[#DDE5D9] bg-[#FCFDFC] px-3.5 py-3 text-sm text-[#20251F] outline-none transition placeholder:text-[#A0A99D] focus:border-[#75BF50] focus:ring-4 focus:ring-[#9BE564]/20"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-[#9BE564] px-4 py-3 text-sm font-semibold text-[#17351C] transition hover:bg-[#8BD653] focus:outline-none focus:ring-4 focus:ring-[#9BE564]/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="border-t border-[#E8EDE5] px-6 py-5 text-center sm:px-8">
            <p className="text-sm text-[#778074]">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#286A36] hover:text-[#174B28] hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>

          <div className="border-t border-[#E8EDE5] bg-[#FAFCF8] px-6 py-4">
            <div className="flex items-center justify-center gap-2 text-xs text-[#718071]">
              <span className="h-2 w-2 rounded-full bg-[#76C84E]" />
              <span>Secure access to your AI workspace</span>
            </div>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-[#899186]">
          Mindora AI · Secure Control Plane
        </p>
      </div>
    </main>
  );
}
