import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useStadiumStore } from './useStadiumStore';

export interface SupabaseRating {
  id: string;
  user_id: string;
  stadium_id: string;
  vibes_score: number;
  vibes_tags: string[];
  food_score: number;
  food_tags: string[];
  views_score: number;
  views_tags: string[];
  identity_score: number;
  identity_tags: string[];
  accessibility_score: number;
  accessibility_tags: string[];
  overall: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface RatingInput {
  vibes: { score: number; selectedTags: string[] };
  foodAndBeer: { score: number; selectedTags: string[] };
  views: { score: number; selectedTags: string[] };
  stadiumIdentity: { score: number; selectedTags: string[] };
  accessibility: { score: number; selectedTags: string[] };
  comment?: string;
}

interface RatingState {
  ratings: Record<string, SupabaseRating>; // keyed by stadium_id
  isLoading: boolean;
  fetchUserRatings: (userId: string) => Promise<void>;
  submitRating: (stadiumId: string, userId: string, input: RatingInput) => Promise<void>;
  getRating: (stadiumId: string) => SupabaseRating | undefined;
  getAllRatings: () => SupabaseRating[];
  getVisitedStadiumIds: () => string[];
  averageRating: () => number;
}

export const useRatingStore = create<RatingState>()((set, get) => ({
  ratings: {},
  isLoading: false,

  fetchUserRatings: async (userId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const ratingsMap: Record<string, SupabaseRating> = {};
      for (const row of data ?? []) {
        ratingsMap[row.stadium_id] = row as SupabaseRating;
      }

      set({ ratings: ratingsMap });

      // Sync visited ids to stadium store
      useStadiumStore.getState().setVisitedIds(Object.keys(ratingsMap));
    } catch (err) {
      console.error('Failed to fetch ratings:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  submitRating: async (stadiumId: string, userId: string, input: RatingInput) => {
    set({ isLoading: true });
    try {
      const row = {
        user_id: userId,
        stadium_id: stadiumId,
        vibes_score: Math.round(input.vibes.score),
        vibes_tags: input.vibes.selectedTags,
        food_score: Math.round(input.foodAndBeer.score),
        food_tags: input.foodAndBeer.selectedTags,
        views_score: Math.round(input.views.score),
        views_tags: input.views.selectedTags,
        identity_score: Math.round(input.stadiumIdentity.score),
        identity_tags: input.stadiumIdentity.selectedTags,
        accessibility_score: Math.round(input.accessibility.score),
        accessibility_tags: input.accessibility.selectedTags,
        comment: input.comment ?? null,
      };

      const { data, error } = await supabase
        .from('ratings')
        .upsert(row, { onConflict: 'user_id,stadium_id' })
        .select()
        .single();

      if (error) throw error;

      const rating = data as SupabaseRating;
      set((state) => ({
        ratings: {
          ...state.ratings,
          [stadiumId]: rating,
        },
      }));

      // Sync visited ids to stadium store
      const visitedIds = Object.keys(get().ratings);
      if (!visitedIds.includes(stadiumId)) {
        visitedIds.push(stadiumId);
      }
      useStadiumStore.getState().setVisitedIds(visitedIds);
    } catch (err) {
      console.error('Failed to submit rating:', JSON.stringify(err));
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  getRating: (stadiumId: string) => {
    return get().ratings[stadiumId];
  },

  getAllRatings: () => {
    return Object.values(get().ratings);
  },

  getVisitedStadiumIds: () => {
    return Object.keys(get().ratings);
  },

  averageRating: () => {
    const allRatings = Object.values(get().ratings);
    if (allRatings.length === 0) return 0;
    const sum = allRatings.reduce((acc, r) => acc + r.overall, 0);
    return Math.round((sum / allRatings.length) * 10) / 10;
  },
}));
