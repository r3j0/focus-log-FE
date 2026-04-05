"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setAuthSession } from "../../lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type AuthResponse = {
  access_token?: string;
  token?: string;
};

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

export default function LoginPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // 공백 닉네임은 프론트에서 먼저 검증.
    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) {
      setError("닉네임을 입력해 주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nickname: trimmedNickname }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, "로그인에 실패했습니다."));
      }

      let data: AuthResponse = {};
      try {
        data = (await response.json()) as AuthResponse;
      } catch {
        // 토큰 없이 200만 내려주는 서버도 있어 빈 객체 허용.
        data = {};
      }

      // 로그인 성공 시 로컬 세션 저장.
      setAuthSession({
        nickname: trimmedNickname,
        accessToken: data.access_token ?? data.token ?? null,
      });
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
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">로그인</h1>
        <p className="mt-2 text-sm text-zinc-600">닉네임으로 간편 로그인할 수 있습니다.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="text-sm font-medium text-zinc-700">
            닉네임
            <input
              type="text"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none ring-zinc-400 focus:ring-2"
              placeholder="닉네임을 입력해 주세요"
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
            className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <Link
          href="/"
          className="mt-4 inline-flex text-sm text-zinc-600 underline underline-offset-2"
        >
          메인으로 돌아가기
        </Link>
      </div>
    </main>
  );
}

