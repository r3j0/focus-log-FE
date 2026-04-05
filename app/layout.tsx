import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Providers from "./providers"; // 👈 1. 서버 통신용 파일 불러오기 추가!

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
    <html lang="ko">
      <body className={`${inter.className} bg-gray-50 flex min-h-screen`}>
        
        {/* 🌟 2. Navbar와 메인 화면 전체를 Providers로 감싸주기! 🌟 */}
        <Providers>
          
          {/* 좌측 Navbar 영역 (F-08) */}
          <nav className="w-64 bg-white border-r shadow-sm flex flex-col p-6 sticky top-0 h-screen">
            <Link href="/" className="font-extrabold text-3xl text-blue-600 mb-10 tracking-tight">
              focus log.
            </Link>
            
            <div className="flex flex-col gap-2 font-semibold text-gray-600">
              <Link 
                href="/records" 
                className="px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-3"
              >
                <span>⏱️</span> 타이머 & 기록
              </Link>
              <Link 
                href="/ranking" 
                className="px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-3"
              >
                <span>🏆</span> 전체 랭킹
              </Link>
            </div>

            <div className="mt-auto pt-6 border-t text-sm text-gray-400">
              <p>focus log 프로젝트</p>
            </div>
          </nav>

          {/* 메인 화면 영역 */}
          <main className="flex-1 p-8 overflow-y-auto">
            {children}
          </main>

        </Providers>
        
      </body>
    </html>
  );
}