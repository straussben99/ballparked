import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface WishlistState {
  wishlistIds: string[];
  isLoading: boolean;
  fetchWishlist: (userId: string) => Promise<void>;
  addToWishlist: (userId: string, stadiumId: string) => Promise<void>;
  removeFromWishlist: (userId: string, stadiumId: string) => Promise<void>;
  isOnWishlist: (stadiumId: string) => boolean;
  wishlistCount: () => number;
}

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  wishlistIds: [],
  isLoading: false,

  fetchWishlist: async (userId: string) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('wishlist')
      .select('stadium_id')
      .eq('user_id', userId);

    if (!error && data) {
      set({ wishlistIds: data.map((d) => d.stadium_id) });
    }
    set({ isLoading: false });
  },

  addToWishlist: async (userId: string, stadiumId: string) => {
    // Optimistic update
    set((state) => ({ wishlistIds: [...state.wishlistIds, stadiumId] }));

    const { error } = await supabase
      .from('wishlist')
      .insert({ user_id: userId, stadium_id: stadiumId });

    if (error) {
      // Rollback
      set((state) => ({
        wishlistIds: state.wishlistIds.filter((id) => id !== stadiumId),
      }));
    }
  },

  removeFromWishlist: async (userId: string, stadiumId: string) => {
    // Optimistic update
    set((state) => ({
      wishlistIds: state.wishlistIds.filter((id) => id !== stadiumId),
    }));

    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('stadium_id', stadiumId);

    if (error) {
      // Rollback
      set((state) => ({ wishlistIds: [...state.wishlistIds, stadiumId] }));
    }
  },

  isOnWishlist: (stadiumId: string) => {
    return get().wishlistIds.includes(stadiumId);
  },

  wishlistCount: () => {
    return get().wishlistIds.length;
  },
}));
