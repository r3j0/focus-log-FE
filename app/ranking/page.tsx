"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ProtectedPage from "../components/protectedPage";
import { fetchRank, type RankRange } from "../../lib/api";
import { getAccessToken } from "../../lib/auth";
import { formatDuration } from "../../lib/format";

const rangeTabs: Array<{ value: RankRange; label: string }> = [
  { value: "today", label: "오늘" },
  { value: "week", label: "이번 주" },
  { value: "month", label: "이번 달" },
];

export default function RankingPage() {
  const [activeRange, setActiveRange] = useState<RankRange>("today");
  const rankQuery = useQuery({
    queryKey: ["rank", activeRange],
    queryFn: () => {
      const token = getAccessToken();

      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }

      return fetchRank(token, activeRange);
    },
  });

  const rankings = rankQuery.data ?? [];

  return (
    <ProtectedPage title="전체 랭킹" description="기간별 누적 공부 시간을 확인합니다.">
      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">기간별 랭킹</h2>
          <div className="flex flex-wrap gap-2">
            {rangeTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveRange(tab.value)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  activeRange === tab.value
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {rankQuery.isLoading ? (
          <p className="mt-6 rounded-lg bg-zinc-100 px-4 py-3 text-sm text-zinc-600">
            랭킹을 불러오는 중입니다.
          </p>
        ) : null}

        {rankQuery.error ? (
          <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {rankQuery.error instanceof Error ? rankQuery.error.message : "랭킹을 불러오지 못했습니다."}
          </p>
        ) : null}

        {!rankQuery.isLoading && !rankQuery.error && rankings.length === 0 ? (
          <p className="mt-6 rounded-lg bg-zinc-100 px-4 py-3 text-sm text-zinc-600">
            아직 표시할 랭킹이 없습니다.
          </p>
        ) : null}

        {rankings.length > 0 ? (
          <div className="mt-6 divide-y divide-zinc-100 overflow-hidden rounded-lg border border-zinc-200">
            {rankings.map((user) => (
              <div
                key={`${user.rank}-${user.userId ?? user.nickname}`}
                className={`flex items-center justify-between gap-4 p-4 ${
                  user.isStudying ? "bg-emerald-50" : "bg-white"
                }`}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="w-8 text-lg font-bold tabular-nums text-zinc-400">{user.rank}</span>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-zinc-900">{user.nickname}</p>
                    {user.isStudying ? (
                      <p className="mt-1 text-xs font-semibold text-emerald-700">공부 중</p>
                    ) : null}
                  </div>
                </div>
                <p className="shrink-0 text-sm font-bold text-zinc-700">
                  {formatDuration(user.totalDurationSeconds)}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </ProtectedPage>
  );
}
