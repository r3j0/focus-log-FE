"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clearAuthSession, getNickname, isAuthenticated } from "../../lib/auth";

export default function MainPage() {
  const router = useRouter();

  useEffect(() => {
    // 보호 페이지: 인증 정보가 없으면 메인으로 되돌림.
    if (!isAuthenticated()) {
      router.replace("/");
    }
  }, [router]);

  function handleLogout() {
    // 저장된 닉네임/토큰을 함께 제거.
    clearAuthSession();
    router.push("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">메인 페이지</h1>
        <p className="mt-2 text-sm text-zinc-600">
          로그인한 사용자만 접근할 수 있습니다.
        </p>

        <p className="mt-4 rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
          현재 사용자: <span className="font-semibold">{getNickname() ?? "알 수 없음"}</span>
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleLogout}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            로그아웃
          </button>
          <Link
            href="/"
            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            메인으로 이동
          </Link>
        </div>
      </div>
    </main>
  );
}

