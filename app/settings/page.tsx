"use client";

import { FormEvent, useState } from "react";
import ProtectedPage from "../components/protectedPage";

export default function SettingsPage() {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <ProtectedPage
      title="설정 페이지"
      description="프로필과 비밀번호 관련 설정을 관리하는 화면입니다."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-900">Profile Form</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <label className="block text-sm text-zinc-700">
              닉네임
              <input
                type="text"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2"
                placeholder="새 닉네임"
              />
            </label>
            <button
              type="submit"
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
            >
              저장
            </button>
          </form>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-900">Password Form</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <label className="block text-sm text-zinc-700">
              비밀번호
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2"
                placeholder="새 비밀번호"
              />
            </label>
            <button
              type="submit"
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
            >
              변경
            </button>
          </form>
        </section>
      </div>
    </ProtectedPage>
  );
}
