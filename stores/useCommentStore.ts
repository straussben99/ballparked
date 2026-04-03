import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface Comment {
  id: string;
  rating_id: string;
  user_id: string;
  text: string;
  created_at: string;
  display_name?: string;
  username?: string;
  avatar_url?: string;
}

interface CommentState {
  comments: Record<string, Comment[]>; // keyed by rating_id
  isLoading: boolean;
  fetchComments: (ratingId: string) => Promise<void>;
  addComment: (ratingId: string, userId: string, text: string) => Promise<void>;
  deleteComment: (commentId: string, ratingId: string) => Promise<void>;
  getComments: (ratingId: string) => Comment[];
}

export const useCommentStore = create<CommentState>()((set, get) => ({
  comments: {},
  isLoading: false,

  fetchComments: async (ratingId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('id, rating_id, user_id, text, created_at, profiles(display_name, username, avatar_url)')
        .eq('rating_id', ratingId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const comments: Comment[] = (data ?? []).map((row: any) => ({
        id: row.id,
        rating_id: row.rating_id,
        user_id: row.user_id,
        text: row.text,
        created_at: row.created_at,
        display_name: row.profiles?.display_name,
        username: row.profiles?.username,
        avatar_url: row.profiles?.avatar_url,
      }));

      set((state) => ({
        comments: { ...state.comments, [ratingId]: comments },
      }));
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  addComment: async (ratingId: string, userId: string, text: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .insert({ rating_id: ratingId, user_id: userId, text });

      if (error) throw error;

      // Re-fetch to get joined profile data
      await get().fetchComments(ratingId);
    } catch (err) {
      console.error('Failed to add comment:', err);
      throw err;
    }
  },

  deleteComment: async (commentId: string, ratingId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      set((state) => ({
        comments: {
          ...state.comments,
          [ratingId]: (state.comments[ratingId] ?? []).filter((c) => c.id !== commentId),
        },
      }));
    } catch (err) {
      console.error('Failed to delete comment:', err);
      throw err;
    }
  },

  getComments: (ratingId: string) => {
    return get().comments[ratingId] ?? [];
  },
}));
