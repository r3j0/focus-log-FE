"use client";

import { useState, useEffect } from "react";
// 🚨 주의: 아래 두 임포트 경로는 동현님 폴더 구조에 맞게 수정이 필요할 수 있습니다!
import { useStudyStore } from "../../store/useStudyStore"; 
import { startStudyAction, stopStudyAction } from "../actions/studyActions";

export default function RecordsPage() {
  // 1. 전역 상태 (타이머)
  const { isStudying, elapsedTime, start, stop, tick } = useStudyStore();
  
  // 2. 지역 상태 (UI 제어)
  const [activeTab, setActiveTab] = useState("today");
  const [isPending, setIsPending] = useState(false);

  // 3. 타이머 1초마다 증가 로직
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStudying) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStudying, tick]);

  // 4. 시간 예쁘게 보여주기 (HH:MM:SS)
  const formatTime = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // 🔑 5. 토큰 가져오기 (승종님이 저장한 방식에 따라 수정 필요!)
  const getAccessToken = () => {
    // 임시로 localStorage나 쿠키에서 토큰을 가져온다고 가정합니다.
    // (만약 lib/auth.ts에 getAuthSession 같은 함수가 있다면 그걸 쓰셔도 됩니다!)
    return localStorage.getItem("accessToken") || ""; 
  };

  // [F-03] 공부 시작 버튼 클릭 시
  const handleStart = async () => {
    if (isPending) return;
    setIsPending(true);
    
    try {
      const token = getAccessToken();
      if (!token) {
        alert("로그인이 필요합니다! (토큰 없음)");
        return;
      }
      
      // ✅ 서버에 '나 시작해!' 알리기 (토큰 전달)
      await startStudyAction(token); 
      start(); // 화면 타이머 시작
      
    } catch (error) {
      alert(error instanceof Error ? error.message : "시작 중 오류 발생");
    } finally {
      setIsPending(false);
    }
  };

  // [F-05] 공부 종료 버튼 클릭 시
  const handleStop = async () => {
    if (isPending) return;
    setIsPending(true);
    
    try {
      const token = getAccessToken();
      // ✅ 서버에 '나 끝났어! 저장해줘!' 알리기 (토큰 전달)
      await stopStudyAction(token); 
      stop(); // 화면 타이머 정지 및 초기화
      alert("공부 기록이 성공적으로 저장되었습니다! 🔥");
      
    } catch (error) {
      alert(error instanceof Error ? error.message : "종료 중 오류 발생");
    } finally {
      setIsPending(false);
    }
  };

  // 병건 님이 만드신 가짜 데이터 (오른쪽 리스트용)
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
      
      {/* 🟢 왼쪽: 동현님의 무대 (타이머 영역) */}
      <div className="flex-1 bg-white shadow-md rounded-lg p-8 border flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold mb-4">현재 학습 상태</h2>
        
        {isStudying ? (
          <span className="text-green-600 font-semibold mb-2 text-lg">공부 중 ✏️</span>
        ) : (
          <span className="text-gray-500 font-semibold mb-2 text-lg">휴식 중 ☕️</span>
        )}
        
        {/* 타이머 숫자 */}
        <div className="text-6xl font-mono font-bold tracking-wider mb-8 text-gray-800">
          {formatTime(elapsedTime)}
        </div>
        
        {/* 시작/종료 버튼 */}
        <div className="flex gap-4">
          <button
            onClick={handleStart}
            disabled={isStudying || isPending}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
          >
            {isPending && !isStudying ? "시작 중..." : "공부 시작"}
          </button>
          <button
            onClick={handleStop}
            disabled={!isStudying || isPending}
            className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 disabled:bg-gray-300 transition-colors"
          >
            {isPending && isStudying ? "종료 중..." : "공부 종료"}
          </button>
        </div>
      </div>

      {/* 🔵 오른쪽: 병건님의 UI (기록 리스트 영역) */}
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