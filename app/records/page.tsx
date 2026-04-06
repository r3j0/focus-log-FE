"use client";


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
      

      <div className="flex-1 bg-white shadow-md rounded-lg p-8 border flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold mb-4">현재 학습 상태</h2>
        
        {isStudying && (

            공부 중 ✏️
          </span>
        )}
        

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

