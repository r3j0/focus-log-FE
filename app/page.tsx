"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { setAuthSession } from "../lib/auth";

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

  if (status === 400) {
    return "닉네임을 다시 확인해 주세요.";
  }

  if (status >= 500) {
    return "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  }

  return mode === "login"
    ? "로그인에 실패했습니다. 닉네임을 확인해 주세요."
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

async function requestAuth(mode: AuthMode, nickname: string) {
  // 회원가입 엔드포인트 명칭이 다른 백엔드도 대응할 수 있게 폴백 순서로 호출.
  const endpoints =
    mode === "login" ? ["/auth/login"] : ["/auth/signup", "/auth/register"];

  const body = JSON.stringify({ nickname });

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const title = useMemo(() => (mode === "login" ? "로그인" : "회원가입"), [mode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // 공백만 입력한 경우 서버 요청 전에 즉시 차단.
    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) {
      setError("닉네임을 입력해 주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await requestAuth(mode, trimmedNickname);
      // 닉네임 기반 로그인 세션 저장 후 보호 페이지로 이동.
      setAuthSession({
        nickname: trimmedNickname,
        accessToken: data.access_token ?? data.token ?? null,
      });
      setIsOpen(false);
      router.push("/main");
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "알 수 없는 오류가 발생했습니다.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  function openModal(nextMode: AuthMode) {
    // 모달 재오픈 시 이전 입력/에러 상태 초기화.
    setMode(nextMode);
    setNickname("");
    setError("");
    setIsOpen(true);
  }

  return (
    <main className="min-h-screen bg-zinc-100 p-6">
      <section className="mx-auto flex w-full max-w-5xl justify-end gap-2">
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

      <section className="mx-auto mt-20 w-full max-w-3xl rounded-2xl bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-bold text-zinc-900">Focus Log</h1>
        <p className="mt-3 text-zinc-600">
          공부 시작과 종료를 기록하고, 누적 학습 시간과 랭킹을 확인해 보세요.
        </p>
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

