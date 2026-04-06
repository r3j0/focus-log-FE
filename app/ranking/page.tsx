"use client";

import ProtectedPage from "../components/protectedPage";

export default function RankingPage() {
  return (
    <ProtectedPage
      title="랭킹 페이지"
      description="이 페이지는 랭킹 기능(F-07, F-08) 구현을 위한 영역입니다."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-900">Ranking List</h2>
          <p className="mt-3 text-sm text-zinc-600">
            기간별 랭킹(today/week/month) 리스트 UI를 이 영역에 구현하면 됩니다.
          </p>
        </section>

        <aside className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-900">Highlight Badge</h2>
          <p className="mt-3 text-sm text-zinc-600">
            공부 중인 유저 하이라이트 UI를 이 영역에 구현하면 됩니다.
          </p>
        </aside>
      </div>
    </ProtectedPage>
  );
}
