"use client";

import { useState, useEffect, useTransition } from "react";
import { useStudyStore } from '@/store/useStudyStore';
import { startStudyAction, stopStudyAction } from '@/app/actions/studyActions';

// 임시 유저 아이디 (나중에 F-01 로그인 구현 시 지워질 예정입니다)
const MOCK_USER_ID = 2; 

export default function RecordsPage() {
  // === [병건 님 코드] 기간 필터 상태 ===
  const [activeTab, setActiveTab] = useState("today");

  // === [동현 님 코드] 진짜 타이머 상태 및 통신 로직 ===
  const { isStudying, startedAt, startStudy, stopStudy } = useStudyStore();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
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
        // 공부 종료 API 통신
        const result = await stopStudyAction(MOCK_USER_ID);
        if (result.success) {
          stopStudy();
          alert('공부 기록이 성공적으로 저장되었습니다.');
        } else {
          alert(result.error);
        }
      } else {
        // 공부 시작 API 통신
        const result = await startStudyAction(MOCK_USER_ID);
        if (result.success) {
          const currentTime = new Date().toISOString();
          startStudy(currentTime);
        } else {
          alert(result.error);
        }
      }
    });
  };

  // === [병건 님 코드] 가짜(Dummy) 개인 기록 데이터 ===
  const dummyRecords = {
    today: [
      { id: 1, date: "2026-04-05", startTime: "10:00", endTime: "12:00", duration: "2시간 00분" },
      { id: 2, date: "2026-04-05", startTime: "14:00", endTime: "15:30", duration: "1시간 30분" },
    ],
    week: [
      { id: 1, date: "2026-04-05", duration: "3시간 30분" },
      { id: 2, date: "2026-04-04", duration: "4시간 15분" },
      { id: 3, date: "2026-04-03", duration: "2시간 50분" },
    ],
    month: [
      { id: 1, week: "4월 1주차", duration: "15시간 20분" },
      { id: 2, week: "3월 4주차", duration: "18시간 40분" },
    ]
  };

  const currentRecords = dummyRecords[activeTab as keyof typeof dummyRecords] || [];

  return (
    <div className="max-w-4xl mx-auto p-8 flex flex-col md:flex-row gap-8">
      
      {/* 1. 타이머 영역 (좌측) - 동현 님의 알맹이 + 병건 님의 UI */}
      <div className="flex-1 bg-white shadow-md rounded-lg p-8 border flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold mb-4">현재 학습 상태</h2>
        
        {isStudying && (
          <span className="mb-6 text-sm bg-green-500 text-white px-3 py-1 rounded-full font-medium transition-all duration-300">
            공부 중 ✏️
          </span>
        )}
        
        {/* 동현 님의 formatTime이 적용된 진짜 타이머 */}
        <div className="text-6xl font-bold mb-10 text-gray-800 tabular-nums">
          {formatTime(elapsedSeconds)}
        </div>
        
        {/* 동현 님의 handleToggleStudy가 연결된 통합 버튼 */}
        <button
          onClick={handleToggleStudy}
          disabled={isPending}
          className={`px-8 py-3 rounded-lg font-bold text-lg transition-colors w-48 ${
            isStudying 
              ? "bg-red-500 text-white hover:bg-red-600 shadow-sm" 
              : "bg-blue-500 text-white hover:bg-blue-600 shadow-sm"
          } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isPending ? '처리 중...' : isStudying ? '공부 종료' : '공부 시작'}
        </button>
      </div>

      {/* 2. 개인 기록 조회 영역 (우측) - 병건 님의 UI와 Dummy 데이터 유지 */}
      <div className="flex-1 bg-white shadow-md rounded-lg p-6 border">
        <h2 className="text-xl font-bold mb-4">내 공부 기록</h2>
        
        {/* 기간 필터 버튼 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("today")}
            className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
              activeTab === "today" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            오늘
          </button>
          <button
            onClick={() => setActiveTab("week")}
            className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
              activeTab === "week" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            이번 주
          </button>
          <button
            onClick={() => setActiveTab("month")}
            className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
              activeTab === "month" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            이번 달
          </button>
        </div>

        {/* 기록 리스트 출력 */}
        <div className="flex flex-col gap-3">
          {currentRecords.map((record: any, index: number) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-100">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-700">{record.date || record.week}</span>
                {record.startTime && (
                  <span className="text-xs text-gray-500 mt-1">
                    {record.startTime} ~ {record.endTime}
                  </span>
                )}
              </div>
              <span className="font-bold text-blue-600">{record.duration}</span>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}