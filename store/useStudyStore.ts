import { create } from 'zustand';

interface StudyState {
  isStudying: boolean;
  startedAt: string | null;
  startStudy: (time: string) => void;
  stopStudy: () => void;
}

export const useStudyStore = create<StudyState>((set) => ({
  isStudying: false,
  startedAt: null,
  startStudy: (time) => set({ isStudying: true, startedAt: time }),
  stopStudy: () => set({ isStudying: false, startedAt: null }),
}));