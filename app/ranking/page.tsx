"use client";

import { useState } from "react";

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState("today");

  // 1. 기간별로 다른 가짜 데이터 묶음을 준비합니다.
  const dummyData = {
    today: [
      { id: 1, nickname: "박정근", totalTime: "3시간 30분", isStudying: true },
      { id: 3, nickname: "전병건", totalTime: "2시간 40분", isStudying: true },
      { id: 2, nickname: "이동현", totalTime: "1시간 15분", isStudying: false },
      { id: 4, nickname: "이승종", totalTime: "0시간 50분", isStudying: false },
    ],
    week: [
      { id: 1, nickname: "박정근", totalTime: "12시간 30분", isStudying: true },
      { id: 2, nickname: "이동현", totalTime: "10시간 15분", isStudying: false },
      { id: 3, nickname: "전병건", totalTime: "8시간 40분", isStudying: true },
      { id: 4, nickname: "이승종", totalTime: "5시간 20분", isStudying: false },
    ],
    month: [
      { id: 2, nickname: "이동현", totalTime: "45시간 10분", isStudying: false },
      { id: 1, nickname: "박정근", totalTime: "42시간 00분", isStudying: true },
      { id: 3, nickname: "전병건", totalTime: "38시간 20분", isStudying: true },
      { id: 4, nickname: "이승종", totalTime: "20시간 00분", isStudying: false },
    ]
  };

  // 2. 현재 클릭된 탭(activeTab)에 맞는 데이터만 쏙 빼옵니다.
  const currentRankings = dummyData[activeTab as keyof typeof dummyData];

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">🏆 focus log 전체 랭킹</h1>

      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab("today")}
          className={`px-4 py-2 rounded-full font-medium transition-colors ${
            activeTab === "today" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          오늘
        </button>
        <button
          onClick={() => setActiveTab("week")}
          className={`px-4 py-2 rounded-full font-medium transition-colors ${
            activeTab === "week" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          이번 주
        </button>
        <button
          onClick={() => setActiveTab("month")}
          className={`px-4 py-2 rounded-full font-medium transition-colors ${
            activeTab === "month" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          이번 달
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border">
        {/* 3. 빼온 데이터(currentRankings)로 화면을 그립니다. */}
        {currentRankings.map((user, index) => (
          <div
            key={user.id}
            className={`flex items-center justify-between p-4 border-b last:border-0 ${
              user.isStudying ? "bg-green-50" : "bg-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="font-bold text-xl text-gray-400 w-6">{index + 1}</span>
              <span className="font-semibold text-lg">{user.nickname}</span>
              {user.isStudying && (
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-medium tracking-wide">
                  공부 중 ✏️
                </span>
              )}
            </div>
            <div className="text-gray-700 font-medium">{user.totalTime}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
