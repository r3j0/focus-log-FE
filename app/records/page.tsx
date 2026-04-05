"use client";

import { useState } from "react";

export default function RecordsPage() {
  // 기간 필터 상태 (today, week, month)
  const [activeTab, setActiveTab] = useState("today");
  // 공부 중인지 확인하는 상태 (F-03 관련 뼈대)
  const [isStudying, setIsStudying] = useState(false);

  // 가짜(Dummy) 개인 공부 기록 데이터
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
      
      {/* 1. 타이머 영역 (좌측) */}
      <div className="flex-1 bg-white shadow-md rounded-lg p-8 border flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold mb-4">현재 학습 상태</h2>
        
        {isStudying && (
          <span className="mb-6 text-sm bg-green-500 text-white px-3 py-1 rounded-full font-medium">
            공부 중 ✏️
          </span>
        )}
        
        {/* 실제 개발 시에는 setInterval 등을 이용해 시간이 흘러가게 구현할 예정 */}
        <div className="text-6xl font-bold mb-10 text-gray-800 tabular-nums">
          00:00:00
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => setIsStudying(true)}
            disabled={isStudying}
            className={`px-6 py-3 rounded-lg font-bold text-lg transition-colors ${
              isStudying 
                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            공부 시작
          </button>
          <button
            onClick={() => setIsStudying(false)}
            disabled={!isStudying}
            className={`px-6 py-3 rounded-lg font-bold text-lg transition-colors ${
              !isStudying 
                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
          >
            공부 종료
          </button>
        </div>
      </div>

      {/* 2. 개인 기록 조회 영역 (우측) */}
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
