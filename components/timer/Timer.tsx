'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useStudyStore } from '@/store/useStudyStore';
import { startStudyAction, stopStudyAction } from '@/app/actions/studyActions';

const MOCK_USER_ID = 1;

export default function Timer() {
  const { isStudying, startedAt, startStudy, stopStudy } = useStudyStore();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  // Server Action의 비동기 처리 상태를 관리하기 위해 Next.js/React에서 권장하는 방식입니다.
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isStudying && startedAt) {
      interval = setInterval(() => {
        const start = new Date(startedAt).getTime();
        const now = new Date().getTime();
        setElapsedSeconds(Math.floor((now - start) / 1000));
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }

    return () => clearInterval(interval);
  }, [isStudying, startedAt]);

  const formatTime = (totalSeconds: number) => {
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const s = String(totalSeconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleToggleStudy = () => {
    startTransition(async () => {
      if (isStudying && startedAt) {
        // 1. 공부 종료 처리 (F-03, F-05)
        const result = await stopStudyAction(MOCK_USER_ID, startedAt);
        if (result.success) {
          stopStudy(); // 서버 저장 성공 시 로컬 타이머 정지 (F-04)
          alert('공부 기록이 성공적으로 저장되었습니다.');
        } else {
          alert(result.error);
        }
      } else {
        // 2. 공부 시작 처리 (F-03)
        const result = await startStudyAction(MOCK_USER_ID);
        if (result.success) {
          const currentTime = new Date().toISOString();
          startStudy(currentTime); // 서버 응답 성공 후 타이머 시작 (F-04)
        } else {
          alert(result.error);
        }
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-semibold text-slate-700 mb-6">현재 공부 시간</h2>
      
      <div className="text-6xl font-bold text-slate-900 mb-8 tabular-nums tracking-tight">
        {formatTime(elapsedSeconds)}
      </div>

      <button
        onClick={handleToggleStudy}
        disabled={isPending}
        className={`px-8 py-3 rounded-full text-lg font-medium transition-all duration-200 ${
          isStudying
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isPending ? '처리 중...' : isStudying ? '공부 종료' : '공부 시작'}
      </button>
    </div>
  );
}