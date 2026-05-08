"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { requestAuth } from "../../lib/api";
import { setAuthSession } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
      const session = await requestAuth("login", trimmedNickname, trimmedPassword);
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
        <h1 className="text-2xl font-bold text-zinc-900">로그인</h1>
        <p className="mt-2 text-sm text-zinc-600">닉네임과 비밀번호로 로그인할 수 있습니다.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="text-sm font-medium text-zinc-700">
            닉네임
            <input
              type="text"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none ring-zinc-400 focus:ring-2"
              placeholder="닉네임을 입력해 주세요"
              maxLength={20}
              autoComplete="username"
              required
            />
          </label>

          <label className="text-sm font-medium text-zinc-700">
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none ring-zinc-400 focus:ring-2"
              placeholder="비밀번호를 입력해 주세요"
              autoComplete="current-password"
              required
            />
          </label>

          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <Link href="/" className="mt-4 inline-flex text-sm text-zinc-600 underline underline-offset-2">
          메인으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
