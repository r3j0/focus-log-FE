"use client";

import Link from "next/link";
import ProtectedPage from "../components/protectedPage";

export default function MainPage() {
  return (
    <ProtectedPage
      title="메인 페이지"
      description="원하는 페이지로 이동해서 기능을 사용하세요."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/records"
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:shadow"
        >
          <p className="text-base font-semibold text-zinc-900">기록 페이지</p>
          <p className="mt-2 text-sm text-zinc-600">
            공부 기록 관련 기능이 들어갈 페이지입니다.
          </p>
        </Link>

        <Link
          href="/ranking"
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:shadow"
        >
          <p className="text-base font-semibold text-zinc-900">랭킹 페이지</p>
          <p className="mt-2 text-sm text-zinc-600">
            유저 랭킹 관련 기능이 들어갈 페이지입니다.
          </p>
        </Link>

        <Link
          href="/settings"
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:shadow"
        >
          <p className="text-base font-semibold text-zinc-900">설정 페이지</p>
          <p className="mt-2 text-sm text-zinc-600">
            사용자 설정 관련 기능이 들어갈 페이지입니다.
          </p>
        </Link>
      </div>
    </ProtectedPage>
  );
}
