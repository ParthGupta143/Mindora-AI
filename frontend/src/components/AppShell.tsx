"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

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

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "◈" },
  { href: "/services", label: "Services", icon: "✦" },
  { href: "/api-keys", label: "API Keys", icon: "⌁" },
  { href: "/usage", label: "Usage", icon: "▥" },
  { href: "/logs", label: "Logs", icon: "≡" },
  { href: "/billing", label: "Billing", icon: "◫" },
];

const SYSTEM_ITEMS = [{ href: "/settings", label: "Settings", icon: "⚙" }];

const activeNavClass =
  "border-[#DCEBD4] bg-[#EDF5E8] text-[#245B35] font-semibold shadow-sm";

const inactiveNavClass =
  "border-transparent text-[#737B73] hover:border-[#E6EDE2] hover:bg-[#F4F7F1] hover:text-[#20251F]";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  function isActive(href: string) {
    return (
      pathname === href ||
      (href !== "/dashboard" && pathname.startsWith(`${href}/`))
    );
  }

  function renderNavItems(items: typeof NAV_ITEMS | typeof SYSTEM_ITEMS) {
    return items.map((item) => {
      const active = isActive(item.href);

      return (
        <Link
          key={item.href}
          href={item.href}
          aria-current={active ? "page" : undefined}
          className={`group mb-1 flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-all duration-200 ${
            active ? activeNavClass : inactiveNavClass
          }`}
        >
          <span
            className={`flex w-5 shrink-0 items-center justify-center text-base ${
              active
                ? "text-[#4D8A43]"
                : "text-[#929A91] group-hover:text-[#4D7650]"
            }`}
          >
            {item.icon}
          </span>

          <span>{item.label}</span>

          {active && (
            <span
              className="ml-auto h-1.5 w-1.5 rounded-full bg-[#75B85A]"
              aria-hidden="true"
            />
          )}
        </Link>
      );
    });
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8F4] text-[#20251F]">
      {/* Fixed sidebar: it never moves when page content scrolls. */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto border-r border-[#E5EAE1] bg-white">
        <div className="flex min-h-[100px] shrink-0 items-center border-b border-[#EEF1EB] px-5">
          <Brand />
        </div>

        <div className="shrink-0 px-5 pb-2 pt-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#929A91]">
            Workspace
          </p>
        </div>

        <nav className="shrink-0 px-3" aria-label="Workspace navigation">
          {renderNavItems(NAV_ITEMS)}
        </nav>

        <div className="shrink-0 px-5 pb-2 pt-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#929A91]">
            System
          </p>
        </div>

        <nav className="shrink-0 px-3" aria-label="System navigation">
          {renderNavItems(SYSTEM_ITEMS)}
        </nav>

        <div className="min-h-6 flex-1" />

        <div className="mx-4 mb-4 shrink-0 rounded-xl border border-[#E1EBDD] bg-[#F7FAF5] p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#75B85A]" />
            <span className="text-xs font-medium text-[#536650]">
              All systems operational
            </span>
          </div>
        </div>

        <div className="shrink-0 border-t border-[#E9EDE6] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#DCEBD4] bg-[#EDF5E8] text-sm font-semibold text-[#386C3A]">
              {user?.email?.charAt(0).toUpperCase() ?? "U"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-[#30382F]">
                {user?.email ?? "User"}
              </p>
              <button
                onClick={logout}
                className="mt-1 text-xs text-[#858D82] transition-colors hover:text-[#386C3A]"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main column is offset by sidebar width and constrained to viewport height. */}
      <div className="ml-64 flex h-screen min-w-0 flex-col overflow-hidden bg-[#F6F8F4]">
        {/* Fixed-height header stays still while the page body scrolls. */}
        <header className="relative z-30 flex h-14 shrink-0 items-center justify-between border-b border-[#E5EAE1] bg-white px-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#929A91]">Mindora AI</span>
            <span className="text-[#C0C7BC]">/</span>
            <span className="font-semibold text-[#30382F]">
              {getPageName(pathname)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 text-xs text-[#718071] sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#75B85A]" />
              Operational
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E1EBDD] bg-[#F7FAF5] text-xs font-semibold text-[#536650]">
              {user?.email?.charAt(0).toUpperCase() ?? "?"}
            </div>
          </div>
        </header>

        {/* Only this main content region scrolls. */}
        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain p-5 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function getPageName(pathname: string) {
  if (pathname.startsWith("/dashboard")) return "Overview";
  if (pathname.startsWith("/services")) return "Services";
  if (pathname.startsWith("/api-keys")) return "API Keys";
  if (pathname.startsWith("/usage")) return "Usage";
  if (pathname.startsWith("/logs")) return "Request Logs";
  if (pathname.startsWith("/billing")) return "Billing";
  if (pathname.startsWith("/settings")) return "Settings";
  return "Overview";
}
