import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRating, CategoryRating } from '../types/rating';
import { useStadiumStore } from './useStadiumStore';

interface RatingState {
  ratings: Record<string, UserRating>;
  addOrUpdateRating: (
    stadiumId: string,
    rating: Omit<UserRating, 'id' | 'overall' | 'createdAt' | 'updatedAt'>
  ) => void;
  getRating: (stadiumId: string) => UserRating | undefined;
  getAllRatings: () => UserRating[];
  averageRatingGiven: () => number;
}

function computeOverall(rating: {
  vibes: CategoryRating;
  foodAndBeer: CategoryRating;
  views: CategoryRating;
  stadiumIdentity: CategoryRating;
  accessibility: CategoryRating;
}): number {
  const scores = [
    rating.vibes.score,
    rating.foodAndBeer.score,
    rating.views.score,
    rating.stadiumIdentity.score,
    rating.accessibility.score,
  ];
  const sum = scores.reduce((acc, s) => acc + s, 0);
  return Math.round((sum / scores.length) * 10) / 10;
}

export const useRatingStore = create<RatingState>()(
  persist(
    (set, get) => ({
      ratings: {},

      addOrUpdateRating: (stadiumId, rating) => {
        const existing = get().ratings[stadiumId];
        const now = new Date().toISOString();
        const overall = computeOverall(rating);

        const userRating: UserRating = {
          ...rating,
          id: existing?.id ?? `rating-${stadiumId}-${Date.now()}`,
          stadiumId,
          overall,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        };

        set((state) => ({
          ratings: {
            ...state.ratings,
            [stadiumId]: userRating,
          },
        }));

        // Auto-mark stadium as visited
        useStadiumStore.getState().markVisited(stadiumId);
      },

      getRating: (stadiumId) => {
        return get().ratings[stadiumId];
      },

      getAllRatings: () => {
        return Object.values(get().ratings);
      },

      averageRatingGiven: () => {
        const allRatings = Object.values(get().ratings);
        if (allRatings.length === 0) return 0;
        const sum = allRatings.reduce((acc, r) => acc + r.overall, 0);
        return Math.round((sum / allRatings.length) * 10) / 10;
      },
    }),
    {
      name: 'rating-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
