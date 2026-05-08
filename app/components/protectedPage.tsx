"use client";

import { ReactNode, useEffect, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import AppNavbar from "./appNavbar";
import {
  getAuthSessionServerSnapshot,
  getAuthSessionSnapshot,
  readAuthSessionSnapshot,
  subscribeAuthSession,
} from "../../lib/auth";

type ProtectedPageProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export default function ProtectedPage({ title, description, children }: ProtectedPageProps) {
  const router = useRouter();
  const sessionSnapshot = useSyncExternalStore(
    subscribeAuthSession,
    getAuthSessionSnapshot,
    getAuthSessionServerSnapshot,
  );
  const authState = useMemo(() => readAuthSessionSnapshot(sessionSnapshot), [sessionSnapshot]);

  useEffect(() => {
    if (authState.status === "anonymous") {
      router.replace("/");
    }
  }, [authState.status, router]);

  if (authState.status !== "authenticated") {
    return (
      <main className="min-h-screen bg-zinc-50 p-6">
        <div className="mx-auto mt-20 w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-zinc-200">
          <p className="text-sm text-zinc-600">페이지를 불러오는 중입니다...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <AppNavbar />
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Focus Log
          </p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900">{title}</h1>
          <p className="mt-2 text-sm text-zinc-600">{description}</p>
          <p className="mt-4 text-xs text-zinc-500">현재 사용자: {authState.nickname}</p>
        </div>

        <div className="mt-6">{children}</div>
      </section>
    </main>
  );
}
