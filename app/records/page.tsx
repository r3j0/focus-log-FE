"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ProtectedPage from "../components/protectedPage";
import { fetchUserDailyRecord, startStudy, stopStudy } from "../../lib/api";
import { getAccessToken } from "../../lib/auth";
import { formatClock, formatDateInputValue, formatDuration, formatTimer } from "../../lib/format";
import { useStudyStore } from "../../store/useStudyStore";

export default function RecordsPage() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(() => formatDateInputValue(new Date()));
  const [now, setNow] = useState(() => Date.now());
  const [message, setMessage] = useState("");
  const { isStudying, startedAt, hydrateStudySession, startStudy: startLocalStudy, stopStudy: stopLocalStudy } =
    useStudyStore();

  useEffect(() => {
    hydrateStudySession();
  }, [hydrateStudySession]);

  useEffect(() => {
    if (!isStudying || !startedAt) {
      return;
    }

    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [isStudying, startedAt]);

  const elapsedSeconds = useMemo(() => {
    if (!isStudying || !startedAt) {
      return 0;
    }

    const startedTime = new Date(startedAt).getTime();

    if (Number.isNaN(startedTime)) {
      return 0;
    }

    return Math.max(0, Math.floor((now - startedTime) / 1000));
  }, [isStudying, now, startedAt]);

  const recordQuery = useQuery({
    queryKey: ["user-record", selectedDate],
    queryFn: () => {
      const token = getAccessToken();

      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }

      return fetchUserDailyRecord(token, selectedDate);
    },
  });

  const startMutation = useMutation({
    mutationFn: async () => {
      const token = getAccessToken();

      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }

      await startStudy(token);
    },
    onSuccess: () => {
      startLocalStudy();
      setMessage("공부를 시작했습니다.");
      void queryClient.invalidateQueries({ queryKey: ["rank"] });
    },
    onError: (error) => {
      setMessage(error instanceof Error ? error.message : "공부 시작에 실패했습니다.");
    },
  });

  const stopMutation = useMutation({
    mutationFn: async () => {
      const token = getAccessToken();

      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }

      await stopStudy(token);
    },
    onSuccess: () => {
      stopLocalStudy();
      setMessage("공부 기록이 저장되었습니다.");
      void queryClient.invalidateQueries({ queryKey: ["user-record"] });
      void queryClient.invalidateQueries({ queryKey: ["rank"] });
    },
    onError: (error) => {
      setMessage(error instanceof Error ? error.message : "공부 종료에 실패했습니다.");
    },
  });

  const isPending = startMutation.isPending || stopMutation.isPending;
  const records = recordQuery.data?.records ?? [];

  return (
    <ProtectedPage
      title="타이머와 내 기록"
      description="공부 시작과 종료를 서버에 저장하고 일별 기록을 확인합니다."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-lg font-semibold text-zinc-900">현재 학습 상태</h2>
            <p className={`mt-2 text-sm font-semibold ${isStudying ? "text-emerald-700" : "text-zinc-500"}`}>
              {isStudying ? "공부 중" : "대기 중"}
            </p>

            <div className="mt-6 font-mono text-5xl font-bold tabular-nums tracking-tight text-zinc-900 sm:text-6xl">
              {formatTimer(elapsedSeconds)}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => startMutation.mutate()}
                disabled={isStudying || isPending}
                className="rounded-lg bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                {startMutation.isPending ? "시작 중..." : "공부 시작"}
              </button>
              <button
                type="button"
                onClick={() => stopMutation.mutate()}
                disabled={!isStudying || isPending}
                className="rounded-lg bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                {stopMutation.isPending ? "종료 중..." : "공부 종료"}
              </button>
            </div>

            {message ? (
              <p className="mt-5 rounded-lg bg-zinc-100 px-4 py-2 text-sm text-zinc-700">{message}</p>
            ) : null}
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">일별 공부 기록</h2>
              <p className="mt-1 text-sm text-zinc-600">
                총 공부 시간: {formatDuration(recordQuery.data?.totalDurationSeconds ?? 0)}
              </p>
            </div>

            <label className="text-sm font-medium text-zinc-700">
              날짜
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="mt-1 block rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
              />
            </label>
          </div>

          {recordQuery.isLoading ? (
            <p className="mt-6 rounded-lg bg-zinc-100 px-4 py-3 text-sm text-zinc-600">
              기록을 불러오는 중입니다.
            </p>
          ) : null}

          {recordQuery.error ? (
            <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {recordQuery.error instanceof Error
                ? recordQuery.error.message
                : "기록을 불러오지 못했습니다."}
            </p>
          ) : null}

          {!recordQuery.isLoading && !recordQuery.error && records.length === 0 ? (
            <p className="mt-6 rounded-lg bg-zinc-100 px-4 py-3 text-sm text-zinc-600">
              선택한 날짜의 기록이 없습니다.
            </p>
          ) : null}

          {records.length > 0 ? (
            <div className="mt-6 divide-y divide-zinc-100 overflow-hidden rounded-lg border border-zinc-200">
              {records.map((record) => (
                <div key={record.id} className="flex items-center justify-between gap-4 bg-white p-4">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      {formatClock(record.startedAt)} - {formatClock(record.endedAt)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">{record.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-sky-700">
                      {formatDuration(record.durationSeconds)}
                    </p>
                    {record.isActive ? (
                      <p className="mt-1 text-xs font-semibold text-emerald-700">진행 중</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </ProtectedPage>
  );
}
