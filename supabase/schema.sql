-- BallParked Database Schema
-- Run this in the Supabase SQL Editor (supabase.com → SQL Editor → New Query)

-- ============================================================
-- 1. PROFILES
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  username text unique not null,
  avatar_url text,
  bio text,
  favorite_team text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(
      new.raw_user_meta_data->>'username',
      lower(replace(split_part(new.email, '@', 1), '.', '_')) || '_' || substr(new.id::text, 1, 4)
    )
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS for profiles
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- 2. RATINGS
-- ============================================================
create table public.ratings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  stadium_id text not null,
  vibes_score smallint not null check (vibes_score between 1 and 10),
  vibes_tags text[] default '{}',
  food_score smallint not null check (food_score between 1 and 10),
  food_tags text[] default '{}',
  views_score smallint not null check (views_score between 1 and 10),
  views_tags text[] default '{}',
  identity_score smallint not null check (identity_score between 1 and 10),
  identity_tags text[] default '{}',
  accessibility_score smallint not null check (accessibility_score between 1 and 10),
  accessibility_tags text[] default '{}',
  overall numeric(3,1) generated always as (
    round((vibes_score + food_score + views_score + identity_score + accessibility_score) / 5.0, 1)
  ) stored,
  comment text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  -- One rating per user per stadium (re-rating replaces)
  unique(user_id, stadium_id)
);

create index idx_ratings_stadium on public.ratings(stadium_id);
create index idx_ratings_user on public.ratings(user_id);

-- RLS for ratings
alter table public.ratings enable row level security;

create policy "Ratings are viewable by everyone"
  on public.ratings for select
  using (true);

create policy "Users can insert own ratings"
  on public.ratings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own ratings"
  on public.ratings for update
  using (auth.uid() = user_id);

create policy "Users can delete own ratings"
  on public.ratings for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 3. FOLLOWS
-- ============================================================
create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);

create index idx_follows_following on public.follows(following_id);

-- RLS for follows
alter table public.follows enable row level security;

create policy "Follows are viewable by everyone"
  on public.follows for select
  using (true);

create policy "Users can follow others"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- ============================================================
-- 4. COMMENTS
-- ============================================================
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  rating_id uuid references public.ratings(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  text text not null check (char_length(text) > 0),
  created_at timestamptz default now() not null
);

create index idx_comments_rating on public.comments(rating_id);

-- RLS for comments
alter table public.comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.comments for select
  using (true);

create policy "Users can insert own comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own comments"
  on public.comments for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 5. RATING PHOTOS
-- ============================================================
create table public.rating_photos (
  id uuid default gen_random_uuid() primary key,
  rating_id uuid references public.ratings(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  url text not null,
  created_at timestamptz default now() not null
);

create index idx_rating_photos_rating on public.rating_photos(rating_id);

-- RLS for rating photos
alter table public.rating_photos enable row level security;

create policy "Photos are viewable by everyone"
  on public.rating_photos for select
  using (true);

create policy "Users can upload own photos"
  on public.rating_photos for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own photos"
  on public.rating_photos for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 6. HELPER VIEWS
-- ============================================================

-- Stadium aggregate stats (avg rating, rating count)
create or replace view public.stadium_stats as
select
  stadium_id,
  count(*)::int as rating_count,
  round(avg(overall), 1) as avg_rating
from public.ratings
group by stadium_id;

-- User stats
create or replace view public.user_stats as
select
  p.id as user_id,
  p.display_name,
  p.username,
  p.avatar_url,
  count(distinct r.stadium_id)::int as stadiums_visited,
  coalesce(round(avg(r.overall), 1), 0) as avg_rating,
  (select count(*)::int from public.follows where following_id = p.id) as followers_count,
  (select count(*)::int from public.follows where follower_id = p.id) as following_count
from public.profiles p
left join public.ratings r on r.user_id = p.id
group by p.id, p.display_name, p.username, p.avatar_url;

-- Activity feed (recent ratings from people you follow + your own)
create or replace function public.get_activity_feed(requesting_user_id uuid, feed_limit int default 20)
returns table (
  id uuid,
  user_id uuid,
  display_name text,
  username text,
  avatar_url text,
  stadium_id text,
  overall numeric,
  comment text,
  created_at timestamptz
) as $$
begin
  return query
  select
    r.id,
    r.user_id,
    p.display_name,
    p.username,
    p.avatar_url,
    r.stadium_id,
    r.overall,
    r.comment,
    r.created_at
  from public.ratings r
  join public.profiles p on p.id = r.user_id
  where r.user_id = requesting_user_id
    or r.user_id in (select following_id from public.follows where follower_id = requesting_user_id)
  order by r.created_at desc
  limit feed_limit;
end;
$$ language plpgsql security definer;

-- ============================================================
-- 7. STORAGE BUCKET
-- ============================================================
-- Create via Supabase Dashboard: Storage → New Bucket → "rating-photos" (public)
-- Or uncomment below if using the SQL editor with storage admin access:
-- insert into storage.buckets (id, name, public) values ('rating-photos', 'rating-photos', true);

-- Storage RLS (run after creating the bucket in dashboard)
-- create policy "Anyone can view photos" on storage.objects for select using (bucket_id = 'rating-photos');
-- create policy "Auth users can upload photos" on storage.objects for insert with check (bucket_id = 'rating-photos' and auth.role() = 'authenticated');
-- create policy "Users can delete own photos" on storage.objects for delete using (bucket_id = 'rating-photos' and auth.uid()::text = (storage.foldername(name))[1]);
