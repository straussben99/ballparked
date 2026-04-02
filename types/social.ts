export type ActivityType = 'rating' | 'visit' | 'follow' | 'comment';

export interface ActivityFeedItem {
  id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  stadiumId?: string;
  stadiumName?: string;
  rating?: number;
  comment?: string;
  targetUserId?: string;
  targetUserName?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  ratingId: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  text: string;
  createdAt: string;
}
