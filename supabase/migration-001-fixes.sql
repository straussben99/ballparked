-- ============================================================
-- BallParked Migration 001 - Critical Fixes for TestFlight Launch
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add missing profile columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS has_onboarded boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS favorite_park text;

-- 2. Create push_tokens table
CREATE TABLE IF NOT EXISTS public.push_tokens (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  token text NOT NULL,
  platform text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (user_id, token)
);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own push tokens"
  ON public.push_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Add UPDATE policy for comments (users can edit their own)
CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. Add performance index for community ratings queries
CREATE INDEX IF NOT EXISTS idx_ratings_stadium_created
  ON public.ratings(stadium_id, created_at DESC);

-- 5. Add performance index for follows
CREATE INDEX IF NOT EXISTS idx_follows_follower
  ON public.follows(follower_id);

-- ============================================================
-- Storage: Create avatars bucket (if not exists)
-- Run this in Supabase Dashboard → Storage → New Bucket: "avatars" (public)
-- Then run the storage policies below in SQL Editor
-- ============================================================

-- Storage policies for avatars bucket
-- (Only run after creating the bucket in the dashboard)

-- CREATE POLICY "Anyone can view avatars"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'avatars');

-- CREATE POLICY "Users can upload own avatar"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'avatars'
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Users can update own avatar"
--   ON storage.objects FOR UPDATE
--   USING (
--     bucket_id = 'avatars'
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Users can delete own avatar"
--   ON storage.objects FOR DELETE
--   USING (
--     bucket_id = 'avatars'
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );
