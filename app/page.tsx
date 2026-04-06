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
  if (mode === "signup" && status === 409) {
    return "이미 사용 중인 닉네임입니다.";
  }

  if (status === 400 || status === 422) {
    return "닉네임 또는 비밀번호를 확인해 주세요.";
  }

  if (status >= 500) {
    return "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  }

  return mode === "login"
    ? "로그인에 실패했습니다. 닉네임 또는 비밀번호를 확인해 주세요."
    : "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.";
}

async function readApiError(response: Response, fallback: string) {
  function toReadableMessage(value: unknown): string {
    if (typeof value === "string") {
      return value;
    }

    if (Array.isArray(value)) {
      const messages = value
        .map((item) => toReadableMessage(item))
        .filter((message) => message.length > 0);
      return messages.join(", ");
    }

    if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      if (record.detail !== undefined) {
        return toReadableMessage(record.detail);
      }
      if (record.message !== undefined) {
        return toReadableMessage(record.message);
      }

      try {
        return JSON.stringify(record);
      } catch {
        return "";
      }
    }

    return "";
  }

  try {
    const data = (await response.json()) as unknown;
    const parsed = toReadableMessage(data);
    return parsed || fallback;
  } catch {
    return fallback;
  }
}

async function requestAuth(mode: AuthMode, nickname: string, password: string) {
  if (mode === "login" && nickname === DEMO_NICKNAME && password === DEMO_PASSWORD) {
    return {};
  }

  const endpoints = mode === "login" ? ["/auth/login"] : ["/auth/signup", "/auth/register"];
  const body = JSON.stringify({ nickname, password });

  for (const endpoint of endpoints) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    if (response.status === 404 && endpoint !== endpoints[endpoints.length - 1]) {
      continue;
    }

    if (!response.ok) {
      const fallback = getErrorMessageByStatus(response.status, mode);
      throw new Error(await readApiError(response, fallback));
    }

    let data: AuthResponse = {};

    try {
      data = (await response.json()) as AuthResponse;
    } catch {
      data = {};
    }

    return data;
  }

  throw new Error("인증 API를 찾지 못했습니다. 백엔드 엔드포인트를 확인해 주세요.");
}

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
      const data = await requestAuth(mode, trimmedNickname, trimmedPassword);
      setAuthSession({
        nickname: trimmedNickname,
        accessToken: data.access_token ?? data.token ?? null,
      });
      setIsOpen(false);
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

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_15%_20%,#dff4ff_0%,#f9fafb_45%,#ffffff_100%)] p-6">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(16,185,129,0.08)_0%,rgba(14,165,233,0.08)_45%,rgba(244,244,245,0.0)_100%)]" />

      <section className="relative mx-auto flex w-full max-w-6xl justify-end gap-2">
        <button
          type="button"
          onClick={() => openModal("login")}
          className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
        >
          로그인
        </button>
        <button
          type="button"
          onClick={() => openModal("signup")}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
        >
          회원가입
        </button>
      </section>

      <section className="relative mx-auto mt-16 w-full max-w-6xl">
        <article className="rounded-3xl bg-white/90 p-8 shadow-sm ring-1 ring-zinc-100 backdrop-blur sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Focus Log</p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-zinc-900 sm:text-5xl">
            오늘의 공부를
            <br />
            기록으로 남기세요
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-600 sm:text-base">
            시작과 종료를 간단히 체크하고, 학습 시간을 누적해서 관리하세요.
            꾸준한 학습 루틴을 만들 수 있도록 기록의 흐름을 한눈에 보여줍니다.
          </p>
        </article>
      </section>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-900">{title}</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-2 py-1 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700"
                aria-label="모달 닫기"
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
                  className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none ring-zinc-400 focus:ring-2"
                  maxLength={20}
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
                  className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none ring-zinc-400 focus:ring-2"
                  required
                />
              </label>

              {error ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? `${title} 중...` : title}
              </button>
            </form>

            <div className="mt-4 text-sm text-zinc-600">
              {mode === "login" ? "계정이 없나요? " : "이미 계정이 있나요? "}
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
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
