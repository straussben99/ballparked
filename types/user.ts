export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  favoriteTeam?: string;
  favoritePark?: string;
  hasOnboarded?: boolean;
  joinedAt: string;
  stadiumsVisited: number;
  averageRating: number;
  followersCount: number;
  followingCount: number;
}
