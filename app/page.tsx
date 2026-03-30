// app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-slate-900">focus log</h1>
        <p className="text-lg text-slate-600">나만의 공부 시간을 기록하고 랭킹을 확인하세요.</p>
        
        {/* 임시 버튼입니다. 추후 AuthModal(로그인 모달) 띄우는 버튼으로 교체됩니다. */}
        <div className="mt-8 flex gap-4 justify-center">
          <button className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition">
            로그인 / 회원가입
          </button>
          
          {/* 작업하신 타이머 페이지로 넘어가기 위한 임시 링크 */}
          <Link href="/records" className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition">
            기록 페이지(타이머) 가기
          </Link>
        </div>
      </div>
    </main>
  );
}