import { create } from "zustand";

const STARTED_AT_KEY = "study_started_at";

type StudyState = {
  isStudying: boolean;
  startedAt: string | null;
  hydrateStudySession: () => void;
  startStudy: (time?: string) => void;
  stopStudy: () => void;
};

function readStoredStartedAt() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(STARTED_AT_KEY);
}

function writeStoredStartedAt(time: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (time) {
    window.localStorage.setItem(STARTED_AT_KEY, time);
  } else {
    window.localStorage.removeItem(STARTED_AT_KEY);
  }
}

export const useStudyStore = create<StudyState>((set) => ({
  isStudying: false,
  startedAt: null,
  hydrateStudySession: () => {
    const startedAt = readStoredStartedAt();
    set({ isStudying: Boolean(startedAt), startedAt });
  },
  startStudy: (time = new Date().toISOString()) => {
    writeStoredStartedAt(time);
    set({ isStudying: true, startedAt: time });
  },
  stopStudy: () => {
    writeStoredStartedAt(null);
    set({ isStudying: false, startedAt: null });
  },
}));
