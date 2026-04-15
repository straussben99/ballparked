import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSocialStore } from '@/stores/useSocialStore';
import { getStadiumById } from '@/data/stadiums';

interface UserProfile {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  favorite_team: string | null;
}

interface UserStats {
  followers_count: number;
  following_count: number;
  visited_count: number;
  ratings_count: number;
  avg_rating: number;
}

interface Rating {
  id: string;
  stadium_id: string;
  overall: number;
  updated_at: string;
}

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const followUser = useSocialStore((s) => s.followUser);
  const unfollowUser = useSocialStore((s) => s.unfollowUser);
  const isFollowing = useSocialStore((s) => s.isFollowing);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  // If user navigates to their own profile, redirect to the profile tab
  useEffect(() => {
    if (userId && currentUser?.id === userId) {
      router.replace('/(tabs)/profile' as any);
    }
  }, [userId, currentUser?.id]);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const [profileRes, statsRes, ratingsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, display_name, username, avatar_url, bio, favorite_team')
          .eq('id', userId)
          .single(),
        supabase
          .from('user_stats')
          .select('followers_count, following_count, stadiums_visited, avg_rating')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('ratings')
          .select('id, stadium_id, overall, updated_at')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false }),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (statsRes.data) {
        setStats({
          followers_count: statsRes.data.followers_count ?? 0,
          following_count: statsRes.data.following_count ?? 0,
          visited_count: statsRes.data.stadiums_visited ?? 0,
          ratings_count: statsRes.data.stadiums_visited ?? 0,
          avg_rating: statsRes.data.avg_rating ?? 0,
        });
      }
      if (ratingsRes.data) setRatings(ratingsRes.data);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleToggleFollow = () => {
    if (!currentUser || !userId) return;
    if (isFollowing(userId)) {
      unfollowUser(currentUser.id, userId);
      if (stats) setStats({ ...stats, followers_count: stats.followers_count - 1 });
    } else {
      followUser(currentUser.id, userId);
      if (stats) setStats({ ...stats, followers_count: stats.followers_count + 1 });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: '' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent.coral} />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: 'User Not Found' }} />
        <View style={styles.loadingContainer}>
          <Ionicons name="person-outline" size={48} color={Colors.text.tertiary} />
          <Text style={styles.emptyTitle}>User not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const following = isFollowing(userId!);
  const avgRating = stats?.avg_rating ?? 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: profile.display_name }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Avatar + Identity */}
        <View style={styles.profileCenter}>
          <Avatar
            name={profile.display_name}
            uri={profile.avatar_url ?? undefined}
            size={Layout.avatarSize.xl}
          />
          <Text style={styles.displayName}>{profile.display_name}</Text>
          <Text style={styles.username}>@{profile.username}</Text>
          {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

          {/* Follow button */}
          {currentUser && currentUser.id !== userId && (
            <View style={styles.followButtonContainer}>
              <Button
                title={following ? 'Following' : 'Follow'}
                onPress={handleToggleFollow}
                variant={following ? 'outline' : 'primary'}
                size="md"
              />
            </View>
          )}
        </View>

        {/* Stats row */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats?.visited_count ?? 0} / 30</Text>
              <Text style={styles.statLabel}>Visited</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {avgRating > 0 ? avgRating.toFixed(1) : '\u2014'}
              </Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <Pressable
              style={({ pressed }) => [styles.statBox, pressed && styles.statBoxPressed]}
              onPress={() =>
                router.push({
                  pathname: '/follows',
                  params: { type: 'followers', userId },
                } as any)
              }
            >
              <Text style={styles.statValue}>{stats?.followers_count ?? 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </Pressable>
            <View style={styles.statDivider} />
            <Pressable
              style={({ pressed }) => [styles.statBox, pressed && styles.statBoxPressed]}
              onPress={() =>
                router.push({
                  pathname: '/follows',
                  params: { type: 'following', userId },
                } as any)
              }
            >
              <Text style={styles.statValue}>{stats?.following_count ?? 0}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </Pressable>
          </View>
        </Card>

        {/* Their Ratings */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ratings</Text>
        </View>

        {ratings.length > 0 ? (
          ratings.map((r) => {
            const stadium = getStadiumById(r.stadium_id);
            return (
              <Card
                key={r.id}
                style={styles.ratingCard}
                onPress={() => router.push(('/rating/' + r.id) as any)}
              >
                <View style={styles.ratingRow}>
                  <View style={styles.ratingInfo}>
                    <Text style={styles.ratingStadium}>
                      {stadium?.name ?? r.stadium_id}
                    </Text>
                    <Text style={styles.ratingDate}>
                      {new Date(r.updated_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Badge label={r.overall.toFixed(1)} variant="rating" />
                </View>
              </Card>
            );
          })
        ) : (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <Ionicons name="star-outline" size={40} color={Colors.text.tertiary} />
              <Text style={styles.emptyTitle}>No ratings yet</Text>
            </View>
          </Card>
        )}

        {/* Favorite Team */}
        {profile.favorite_team && (
          <View style={styles.favoriteSection}>
            <Badge
              label={`Favorite Team: ${profile.favorite_team}`}
              variant="division"
              color={Colors.accent.coral}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.cream,
  },
  scrollContent: {
    paddingBottom: Spacing['2xl'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCenter: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  displayName: {
    ...Typography.h3,
    color: Colors.primary.navy,
    marginTop: Spacing.md,
  },
  username: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  bio: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  followButtonContainer: {
    marginTop: Spacing.md,
  },
  statsCard: {
    marginHorizontal: Layout.screenPadding,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  statBoxPressed: {
    opacity: 0.6,
  },
  statValue: {
    ...Typography.h4,
    color: Colors.primary.navy,
  },
  statLabel: {
    ...Typography.tiny,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.card.border,
  },
  sectionHeader: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.primary.navy,
  },
  ratingCard: {
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingInfo: {
    flex: 1,
  },
  ratingStadium: {
    ...Typography.bodyBold,
    color: Colors.text.primary,
  },
  ratingDate: {
    ...Typography.small,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  emptyCard: {
    marginHorizontal: Layout.screenPadding,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.bodyBold,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
  favoriteSection: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
});
