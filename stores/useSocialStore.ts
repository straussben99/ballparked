import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface SocialState {
  followingIds: string[];
  isLoading: boolean;

  fetchFollowing: (userId: string) => Promise<void>;
  followUser: (currentUserId: string, targetUserId: string) => Promise<void>;
  unfollowUser: (currentUserId: string, targetUserId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
}

export const useSocialStore = create<SocialState>()((set, get) => ({
  followingIds: [],
  isLoading: false,

  fetchFollowing: async (userId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

      if (error) throw error;

      set({ followingIds: (data ?? []).map((r) => r.following_id) });
    } catch (err) {
      console.error('Failed to fetch following:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  followUser: async (currentUserId: string, targetUserId: string) => {
    try {
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: currentUserId, following_id: targetUserId });

      if (error) throw error;

      set((state) => ({
        followingIds: [...state.followingIds, targetUserId],
      }));
    } catch (err) {
      console.error('Failed to follow user:', err);
    }
  },

  unfollowUser: async (currentUserId: string, targetUserId: string) => {
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId);

      if (error) throw error;

      set((state) => ({
        followingIds: state.followingIds.filter((id) => id !== targetUserId),
      }));
    } catch (err) {
      console.error('Failed to unfollow user:', err);
    }
  },

  isFollowing: (userId: string) => {
    return get().followingIds.includes(userId);
  },
}));
