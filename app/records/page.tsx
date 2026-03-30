// app/records/page.tsx
import Timer from '@/components/timer/Timer';

export default function RecordsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-50">
      {/* 추후 여기에 네비게이션 바(Navbar)와 사이드바(SidebarRecordList)도 추가될 예정입니다. */}
      <div className="w-full max-w-4xl flex gap-8">
        <div className="flex-1 flex justify-center">
          <Timer />
        </div>
      </div>
    </main>
  );
}