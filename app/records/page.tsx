"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ProtectedPage from "../components/protectedPage";
import { fetchUserDailyRecord, startStudy, stopStudy, type UserRecordSummary } from "../../lib/api";
import { getAccessToken } from "../../lib/auth";
import { formatClock, formatDateInputValue, formatDuration, formatTimer } from "../../lib/format";
import { useStudyStore } from "../../store/useStudyStore";

function getRecordDate(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value.slice(0, 10);
  }

  return formatDateInputValue(parsed);
}

function getDurationSeconds(startedAt: string, endedAt: string) {
  const startedTime = new Date(startedAt).getTime();
  const endedTime = new Date(endedAt).getTime();

  if (Number.isNaN(startedTime) || Number.isNaN(endedTime)) {
    return 0;
  }

  return Math.max(0, Math.floor((endedTime - startedTime) / 1000));
}

function closeActiveRecords(
  summary: UserRecordSummary | undefined,
  stoppedAt: string,
  stoppedStartedAt: string | null,
) {
  if (!summary) {
    return summary;
  }

  let changed = false;
  let durationDelta = 0;
  const records = summary.records.map((record) => {
    if (!record.isActive || !record.startedAt) {
      return record;
    }

    changed = true;
    const nextDurationSeconds = Math.max(
      record.durationSeconds,
      getDurationSeconds(record.startedAt, stoppedAt),
    );
    durationDelta += nextDurationSeconds - record.durationSeconds;

    return {
      ...record,
      endedAt: stoppedAt,
      durationSeconds: nextDurationSeconds,
      isActive: false,
    };
  });

  if (changed) {
    return {
      ...summary,
      totalDurationSeconds: summary.totalDurationSeconds + durationDelta,
      records,
    };
  }

  if (!stoppedStartedAt || getRecordDate(stoppedStartedAt) !== summary.date) {
    return summary;
  }

  const durationSeconds = getDurationSeconds(stoppedStartedAt, stoppedAt);

  return {
    ...summary,
    totalDurationSeconds: summary.totalDurationSeconds + durationSeconds,
    records: [
      {
        id: `completed-${stoppedStartedAt}`,
        date: summary.date,
        startedAt: stoppedStartedAt,
        endedAt: stoppedAt,
        durationSeconds,
        isActive: false,
      },
      ...summary.records,
    ],
  };
}

function openActiveRecord(summary: UserRecordSummary | undefined, startedAt: string) {
  const startedDate = getRecordDate(startedAt);

  if (!startedDate) {
    return summary;
  }

  const activeRecord = {
    id: `active-${startedAt}`,
    date: startedDate,
    startedAt,
    endedAt: null,
    durationSeconds: 0,
    isActive: true,
  };

  if (!summary) {
    return {
      date: startedDate,
      totalDurationSeconds: 0,
      records: [activeRecord],
    };
  }

  return {
    ...summary,
    records: [
      activeRecord,
      ...summary.records.filter(
        (record) => !(record.isActive || record.startedAt === startedAt),
      ),
    ],
  };
}

export default function RecordsPage() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(() => formatDateInputValue(new Date()));
  const [now, setNow] = useState(() => Date.now());
  const [message, setMessage] = useState("");
  const [ignoredActiveStartedAt, setIgnoredActiveStartedAt] = useState<string | null>(null);
  const { isStudying, startedAt, startStudy: startLocalStudy, stopStudy: stopLocalStudy } = useStudyStore();

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

  const selectedDateRecordsKey = ["user-record", selectedDate];
  const recordQuery = useQuery({
    queryKey: selectedDateRecordsKey,
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
      return new Date().toISOString();
    },
    onSuccess: (newStartedAt) => {
      const startedDate = getRecordDate(newStartedAt) ?? formatDateInputValue(new Date());

      setIgnoredActiveStartedAt(null);
      startLocalStudy(newStartedAt);
      setNow(Date.now());
      setSelectedDate(startedDate);
      queryClient.setQueryData<UserRecordSummary>(["user-record", startedDate], (summary) =>
        openActiveRecord(summary, newStartedAt),
      );
      setMessage("공부를 시작했습니다.");
      void queryClient.invalidateQueries({ queryKey: ["user-record"] });
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
      return new Date().toISOString();
    },
    onSuccess: (stoppedAt) => {
      const stoppedStartedAt = startedAt;

      setIgnoredActiveStartedAt(stoppedStartedAt);
      queryClient.setQueriesData<UserRecordSummary>({ queryKey: ["user-record"] }, (summary) =>
        closeActiveRecords(summary, stoppedAt, stoppedStartedAt),
      );
      stopLocalStudy();
      setNow(Date.now());
      setMessage("공부 기록이 저장되었습니다.");
      void queryClient.invalidateQueries({ queryKey: ["user-record"] });
      void queryClient.invalidateQueries({ queryKey: ["rank"] });
    },
    onError: (error) => {
      setMessage(error instanceof Error ? error.message : "공부 종료에 실패했습니다.");
    },
  });

  useEffect(() => {
    if (!recordQuery.isSuccess) {
      return;
    }

    const activeRecord = recordQuery.data.records.find(
      (record) => record.isActive && record.startedAt,
    );

    if (activeRecord?.startedAt && activeRecord.startedAt !== ignoredActiveStartedAt) {
      if (activeRecord.startedAt !== startedAt) {
        startLocalStudy(activeRecord.startedAt);
      }
      return;
    }

    if (isStudying) {
      stopLocalStudy();
    }
  }, [
    ignoredActiveStartedAt,
    isStudying,
    recordQuery.data,
    recordQuery.isSuccess,
    startLocalStudy,
    startedAt,
    stopLocalStudy,
  ]);

  const isPending = startMutation.isPending || stopMutation.isPending;
  const isStudyStatusChecking = recordQuery.isLoading || !recordQuery.isFetched;
  const isCurrentStudying = !isStudyStatusChecking && isStudying;
  const displayElapsedSeconds = isCurrentStudying ? elapsedSeconds : 0;
  const serverRecords = recordQuery.data?.records ?? [];
  const liveRecordDate = getRecordDate(startedAt);
  const liveServerRecord = serverRecords.find(
    (record) => record.isActive && record.startedAt === startedAt,
  );
  const liveRecord =
    isCurrentStudying && startedAt && liveRecordDate === selectedDate
      ? {
          id: liveServerRecord?.id ?? `active-${startedAt}`,
          date: selectedDate,
          startedAt,
          endedAt: null,
          durationSeconds: displayElapsedSeconds,
          isActive: true,
        }
      : null;
  const records = liveRecord
    ? [
        liveRecord,
        ...serverRecords.filter(
          (record) => !(record.isActive && record.startedAt === liveRecord.startedAt),
        ),
      ]
    : serverRecords;
  const totalDurationSeconds = liveRecord
    ? Math.max(0, (recordQuery.data?.totalDurationSeconds ?? 0) - (liveServerRecord?.durationSeconds ?? 0)) +
      liveRecord.durationSeconds
    : recordQuery.data?.totalDurationSeconds ?? 0;
  const startButtonLabel = isStudyStatusChecking
    ? "상태 확인 중..."
    : startMutation.isPending
      ? "시작 중..."
      : "공부 시작";

  return (
    <ProtectedPage
      title="타이머와 내 기록"
      description="공부 시작과 종료를 서버에 저장하고 일별 기록을 확인합니다."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-lg font-semibold text-zinc-900">현재 학습 상태</h2>
            <p className={`mt-2 text-sm font-semibold ${isCurrentStudying ? "text-emerald-700" : "text-zinc-500"}`}>
              {isCurrentStudying ? "공부 중" : isStudyStatusChecking ? "상태 확인 중" : "대기 중"}
            </p>

            <div className="mt-6 font-mono text-5xl font-bold tabular-nums tracking-tight text-zinc-900 sm:text-6xl">
              {formatTimer(displayElapsedSeconds)}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => startMutation.mutate()}
                disabled={isCurrentStudying || isPending || isStudyStatusChecking}
                className="rounded-lg bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                {startButtonLabel}
              </button>
              <button
                type="button"
                onClick={() => stopMutation.mutate()}
                disabled={!isCurrentStudying || isPending}
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
                총 공부 시간: {formatDuration(totalDurationSeconds)}
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
                <div
                  key={record.id}
                  className={`flex items-center justify-between gap-4 p-4 ${
                    record.isActive
                      ? "bg-emerald-50 ring-1 ring-inset ring-emerald-200"
                      : "bg-white"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      {formatClock(record.startedAt)} - {formatClock(record.endedAt)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">{record.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${record.isActive ? "text-emerald-700" : "text-sky-700"}`}>
                      {record.isActive ? formatTimer(record.durationSeconds) : formatDuration(record.durationSeconds)}
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
