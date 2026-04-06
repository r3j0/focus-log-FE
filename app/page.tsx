"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_NICKNAME, DEMO_PASSWORD, setAuthSession } from "../lib/auth";

type AuthMode = "login" | "signup";

type AuthResponse = {
  access_token?: string;
  token?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

function getErrorMessageByStatus(status: number, mode: AuthMode) {
  if (mode === "signup" && status === 409) return "이미 사용 중인 닉네임입니다.";
  if (status === 400 || status === 422) return "닉네임 또는 비밀번호를 확인해 주세요.";
  if (status >= 500) return "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  return mode === "login" ? "로그인에 실패했습니다." : "회원가입에 실패했습니다.";
}

async function requestAuth(mode: AuthMode, nickname: string, password: string) {
  if (mode === "login" && nickname === DEMO_NICKNAME && password === DEMO_PASSWORD) return {};
  const endpoints = mode === "login" ? ["/auth/login"] : ["/auth/signup"];
  const body = JSON.stringify({ nickname, password });

  const response = await fetch(`${API_BASE_URL}${endpoints[0]}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (!response.ok) {
    const fallback = getErrorMessageByStatus(response.status, mode);
    throw new Error(fallback);
  }
  return (await response.json()) as AuthResponse;
}

export default function Home() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const title = mode === "login" ? "로그인" : "회원가입";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const data = await requestAuth(mode, nickname.trim(), password.trim());
      setAuthSession({
        nickname: nickname.trim(),
        accessToken: data.access_token ?? data.token ?? null,
      });
      setIsOpen(false);
      // ✅ 로그인 성공 시 동현님의 타이머 화면(/records)으로 이동!
      router.push("/records"); 
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-black text-zinc-900 mb-6">오늘의 공부를 기록으로 남기세요</h1>
        <div className="flex justify-center gap-4">
          <button onClick={() => { setMode("login"); setIsOpen(true); }} className="px-6 py-3 bg-white border rounded-xl font-bold">로그인</button>
          <button onClick={() => { setMode("signup"); setIsOpen(true); }} className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold">회원가입</button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="닉네임" className="w-full p-3 border rounded-xl" required />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" className="w-full p-3 border rounded-xl" required />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button type="submit" disabled={isLoading} className="w-full p-3 bg-zinc-900 text-white rounded-xl font-bold">
                {isLoading ? "처리 중..." : title}
              </button>
              <button type="button" onClick={() => setIsOpen(false)} className="w-full text-zinc-500 text-sm mt-2">닫기</button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}