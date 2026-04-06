"use client";

import ProtectedPage from "../components/protectedPage";

export default function RecordsPage() {
  return (
    <ProtectedPage
      title="기록 페이지"
      description="이 페이지는 기록 기능(F-03~F-06) 구현을 위한 영역입니다."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-900">기록 메인 영역</h2>
          <p className="mt-3 text-sm text-zinc-600">
            타이머, 공부 시작/종료, 상태 동기화 UI를 이 영역에 구현하면 됩니다.
          </p>
        </section>

        <aside className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-900">사이드 기록 영역</h2>
          <p className="mt-3 text-sm text-zinc-600">
            기간 필터(today/week/month)와 개인 기록 목록 UI를 이 영역에 구현하면 됩니다.
          </p>
        </aside>
      </div>
    </ProtectedPage>
  );
}
