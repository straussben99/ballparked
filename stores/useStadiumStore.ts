import { create } from 'zustand';

interface StadiumState {
  visitedIds: string[];
  setVisitedIds: (ids: string[]) => void;
  isVisited: (stadiumId: string) => boolean;
  visitedCount: () => number;
}

export const useStadiumStore = create<StadiumState>()((set, get) => ({
  visitedIds: [],

  setVisitedIds: (ids: string[]) => set({ visitedIds: ids }),

  isVisited: (stadiumId: string) => get().visitedIds.includes(stadiumId),

  visitedCount: () => get().visitedIds.length,
}));
