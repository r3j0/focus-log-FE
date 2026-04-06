import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Focus Log",
  description: "공부 시간 관리 서비스",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      {/* 1. body의 배경색을 빼고, 전체 화면 높이를 꽉 채우도록 설정 */}
      <body className={`${inter.className} flex min-h-screen antialiased`}>
        <Providers>
          {/* 좌측 사이드바: 기존 디자인 유지 */}
          <nav className="w-68 bg-white border-r border-zinc-200 flex flex-col p-8 sticky top-0 h-screen shadow-[1px_0_10px_rgba(0,0,0,0.02)] shrink-0">
            
            <Link href="/" className="group flex items-center gap-1 mb-12">
              <span className="font-black text-2xl tracking-tighter text-zinc-900 group-hover:text-sky-600 transition-colors">
                focus log<span className="text-sky-500">.</span>
              </span>
            </Link>
            
            <div className="flex flex-col gap-1.5 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3 ml-2">Main Menu</p>
              
              <Link 
                href="/records" 
                className="group px-4 py-3 rounded-xl font-semibold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all flex items-center gap-3"
              >
                <span className="text-xl">⏱️</span>
                <span>타이머 & 기록</span>
              </Link>

              <Link 
                href="/ranking" 
                className="group px-4 py-3 rounded-xl font-semibold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all flex items-center gap-3"
              >
                <span className="text-xl">🏆</span>
                <span>전체 랭킹</span>
              </Link>
            </div>

            <div className="mt-auto pt-6 border-t border-zinc-100">
              <div className="rounded-2xl bg-sky-50 p-4">
                <p className="text-xs font-bold text-sky-700 leading-tight">Focus Log Project</p>
                <p className="text-[10px] text-sky-600/70 mt-1">v1.0.0 Stable</p>
              </div>
            </div>
          </nav>

          {/* 2. 메인 화면 영역: 배경색을 여기에 직접 주어 빈 공간이 생기지 않게 함 */}
          <main className="flex-1 bg-[#f9fafb] min-h-screen overflow-y-auto">
            {/* 3. 콘텐츠 폭 확장: max-w-5xl(1024px)에서 max-w-[1440px]로 대폭 수정 */}
            <div className="max-w-[1440px] mx-auto p-10">
              {children}
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}