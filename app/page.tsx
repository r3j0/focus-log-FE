"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { type AuthMode, requestAuth } from "../lib/api";
import { setAuthSession } from "../lib/auth";

export default function Home() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const title = useMemo(() => (mode === "login" ? "로그인" : "회원가입"), [mode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedNickname = nickname.trim();
    const trimmedPassword = password.trim();

    if (!trimmedNickname) {
      setError("닉네임을 입력해 주세요.");
      return;
    }

    if (!trimmedPassword) {
      setError("비밀번호를 입력해 주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const session = await requestAuth(mode, trimmedNickname, trimmedPassword);
      setAuthSession(session);
      router.push("/main");
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "알 수 없는 오류가 발생했습니다.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  function openModal(nextMode: AuthMode) {
    setMode(nextMode);
    setNickname("");
    setPassword("");
    setError("");
    setIsOpen(true);
  }

  function switchMode() {
    setMode((currentMode) => (currentMode === "login" ? "signup" : "login"));
    setError("");
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <section className="mx-auto flex w-full max-w-6xl justify-end gap-2 px-4 py-5 sm:px-6">
        <button
          type="button"
          onClick={() => openModal("login")}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
        >
          로그인
        </button>
        <button
          type="button"
          onClick={() => openModal("signup")}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
        >
          회원가입
        </button>
      </section>

      <section className="mx-auto grid min-h-[calc(100vh-84px)] w-full max-w-6xl content-center px-4 pb-16 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
            Focus Log
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-zinc-900 sm:text-5xl">
            오늘의 공부 시간을 기록하고 랭킹으로 확인하세요
          </h1>
          <p className="mt-5 text-base leading-8 text-zinc-600">
            공부 시작과 종료를 서버에 저장하고, 내 일별 기록과 전체 랭킹을 한 곳에서
            확인하는 학습 기록 서비스입니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => openModal("login")}
              className="rounded-lg bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              시작하기
            </button>
            <button
              type="button"
              onClick={() => openModal("signup")}
              className="rounded-lg border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
            >
              새 계정 만들기
            </button>
          </div>
        </div>
      </section>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-title"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 id="auth-title" className="text-xl font-semibold text-zinc-900">
                {title}
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-2 py-1 text-sm text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700"
              >
                닫기
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-sm font-medium text-zinc-700">
                닉네임
                <input
                  type="text"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder="닉네임을 입력해 주세요"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none ring-zinc-400 focus:ring-2"
                  maxLength={20}
                  autoComplete="username"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-zinc-700">
                비밀번호
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="비밀번호를 입력해 주세요"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none ring-zinc-400 focus:ring-2"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                />
              </label>

              {error ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? `${title} 중...` : title}
              </button>
            </form>

            <div className="mt-4 text-sm text-zinc-600">
              {mode === "login" ? "계정이 없나요? " : "이미 계정이 있나요? "}
              <button
                type="button"
                onClick={switchMode}
                className="font-semibold text-zinc-900 underline underline-offset-2"
              >
                {mode === "login" ? "회원가입" : "로그인"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
