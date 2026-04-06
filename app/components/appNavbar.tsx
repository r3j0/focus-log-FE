"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthSession, getNickname } from "../../lib/auth";

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/main", label: "메인" },
  { href: "/records", label: "기록" },
  { href: "/ranking", label: "랭킹" },
  { href: "/settings", label: "설정" },
];

function getLinkClass(isActive: boolean) {
  return isActive
    ? "rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
    : "rounded-xl px-4 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900";
}

export default function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const nickname = getNickname();

  function handleLogout() {
    clearAuthSession();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-bold tracking-tight text-zinc-900">
            Focus Log
          </Link>
          <span className="hidden text-xs text-zinc-500 sm:inline">학습 기록 관리</span>
        </div>

        <nav className="order-3 flex w-full items-center gap-2 sm:order-2 sm:w-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={getLinkClass(pathname === item.href)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="order-2 ml-auto flex items-center gap-2 sm:order-3 sm:ml-0">
          <span className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs text-zinc-700">
            {nickname ?? "게스트"}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}
