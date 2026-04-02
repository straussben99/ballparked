import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StadiumState {
  visitedIds: string[];
  toggleVisited: (stadiumId: string) => void;
  markVisited: (stadiumId: string) => void;
  isVisited: (stadiumId: string) => boolean;
  visitedCount: () => number;
}

export const useStadiumStore = create<StadiumState>()(
  persist(
    (set, get) => ({
      visitedIds: [],

      toggleVisited: (stadiumId: string) => {
        const { visitedIds } = get();
        if (visitedIds.includes(stadiumId)) {
          set({ visitedIds: visitedIds.filter((id) => id !== stadiumId) });
        } else {
          set({ visitedIds: [...visitedIds, stadiumId] });
        }
      },

      markVisited: (stadiumId: string) => {
        const { visitedIds } = get();
        if (!visitedIds.includes(stadiumId)) {
          set({ visitedIds: [...visitedIds, stadiumId] });
        }
      },

      isVisited: (stadiumId: string) => {
        return get().visitedIds.includes(stadiumId);
      },

      visitedCount: () => {
        return get().visitedIds.length;
      },
    }),
    {
      name: 'stadium-visited-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
