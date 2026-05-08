"use client";

import Link from "next/link";
import ProtectedPage from "../components/protectedPage";

export default function MainPage() {
  return (
    <ProtectedPage title="메인 페이지" description="공부 기록과 랭킹을 확인하세요.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/records"
          className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:shadow"
        >
          <p className="text-base font-semibold text-zinc-900">타이머와 내 기록</p>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            공부 시작과 종료를 서버에 저장하고, 선택한 날짜의 공부 기록을 확인합니다.
          </p>
        </Link>

        <Link
          href="/ranking"
          className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:shadow"
        >
          <p className="text-base font-semibold text-zinc-900">전체 랭킹</p>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            오늘, 이번 주, 이번 달 기준으로 누적 공부 시간을 비교합니다.
          </p>
        </Link>
      </div>
    </ProtectedPage>
  );
}
