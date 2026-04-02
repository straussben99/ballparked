import { create } from 'zustand';
import { UserProfile } from '../types/user';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
}

const mockUser: UserProfile = {
  id: 'mock-user-1',
  displayName: 'Alex Johnson',
  username: 'alexj',
  email: 'alex@ballparked.com',
  bio: 'Chasing all 30 stadiums \u26be',
  favoriteTeam: 'NYY',
  stadiumsVisited: 12,
  averageRating: 7.8,
  followersCount: 24,
  followingCount: 18,
  joinedAt: '2024-01-15',
};

export const useAuthStore = create<AuthState>()(() => ({
  user: mockUser,
  isAuthenticated: true,
}));
