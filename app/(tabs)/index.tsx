import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getStadiumImage } from '@/data/stadium-images';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { FontSize, FontWeight, Typography } from '@/constants/typography';
import { Shadows } from '@/constants/shadows';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { getStadiumById } from '@/data/stadiums';

interface TrendingStadium {
  id: string;
  name: string;
  team: string;
  division: string;
}

const TRENDING_STADIUMS: TrendingStadium[] = [
  { id: 'fenway-park', name: 'Fenway Park', team: 'Red Sox', division: 'AL East' },
  { id: 'wrigley-field', name: 'Wrigley Field', team: 'Cubs', division: 'NL Central' },
  { id: 'dodger-stadium', name: 'Dodger Stadium', team: 'Dodgers', division: 'NL West' },
  { id: 'pnc-park', name: 'PNC Park', team: 'Pirates', division: 'NL Central' },
  { id: 'oracle-park', name: 'Oracle Park', team: 'Giants', division: 'NL West' },
];

interface RatingFeedItem {
  kind: 'rating';
  id: string;
  user_id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  stadium_id: string;
  overall: number;
  comment: string | null;
  created_at: string;
}

interface FollowFeedItem {
  kind: 'follow';
  id: string;
  user_id: string; // the follower
  display_name: string;
  username: string;
  avatar_url: string | null;
  target_display_name: string;
  target_username: string;
  created_at: string;
}

type FeedItem = RatingFeedItem | FollowFeedItem;

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function TrendingCard({ stadium, onPress }: { stadium: TrendingStadium; onPress: () => void }) {
  const image = getStadiumImage(stadium.id);
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <ImageBackground
        source={image}
        style={styles.trendingCard}
        imageStyle={{ borderRadius: BorderRadius.md }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.trendingOverlay}
        >
          <Text style={styles.trendingName} numberOfLines={2}>{stadium.name}</Text>
          <Text style={styles.trendingTeam}>{stadium.team}</Text>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const fetchFeed = useCallback(async () => {
    if (!user) return;
    try {
      // 1. Ratings feed (from the RPC)
      const ratingsPromise = supabase.rpc('get_activity_feed', {
        requesting_user_id: user.id,
        feed_limit: 30,
      });

      // 2. Recent follow events across the app (last 30)
      const followsPromise = supabase
        .from('follows')
        .select('follower_id, following_id, created_at')
        .order('created_at', { ascending: false })
        .limit(30);

      const [ratingsRes, followsRes] = await Promise.all([
        ratingsPromise,
        followsPromise,
      ]);

      if (ratingsRes.error) throw ratingsRes.error;
      if (followsRes.error) throw followsRes.error;

      const ratingItems: RatingFeedItem[] = (ratingsRes.data ?? []).map(
        (r: any) => ({ ...r, kind: 'rating' as const })
      );

      // Resolve profile info for each follower/following involved in recent follows
      const followRows = followsRes.data ?? [];
      const profileIds = Array.from(
        new Set(
          followRows.flatMap((f: any) => [f.follower_id, f.following_id])
        )
      );

      let followItems: FollowFeedItem[] = [];
      if (profileIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, username, avatar_url')
          .in('id', profileIds);
        if (profilesError) throw profilesError;

        const profileById = new Map<string, any>(
          (profiles ?? []).map((p: any) => [p.id, p])
        );

        followItems = followRows
          .map((f: any, idx: number): FollowFeedItem | null => {
            const follower = profileById.get(f.follower_id);
            const target = profileById.get(f.following_id);
            if (!follower || !target) return null;
            return {
              kind: 'follow',
              id: `follow-${f.follower_id}-${f.following_id}-${idx}`,
              user_id: f.follower_id,
              display_name: follower.display_name,
              username: follower.username,
              avatar_url: follower.avatar_url,
              target_display_name: target.display_name,
              target_username: target.username,
              created_at: f.created_at,
            };
          })
          .filter((x: FollowFeedItem | null): x is FollowFeedItem => x !== null);
      }

      // Merge and sort by created_at descending
      const merged = [...ratingItems, ...followItems].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setFeedItems(merged);
    } catch (err) {
      console.error('Failed to fetch feed:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFeed();
  };

  function renderFeedItem({ item }: { item: FeedItem }) {
    if (item.kind === 'follow') {
      return (
        <Card style={styles.feedCard}>
          <View style={styles.feedRow}>
            <Avatar
              name={item.display_name}
              uri={item.avatar_url ?? undefined}
              size={40}
            />
            <View style={styles.feedContent}>
              <Text style={styles.feedText}>
                <Text style={styles.feedUserName}>{item.display_name}</Text>
                {' started following '}
                <Text style={styles.feedUserName}>
                  {item.target_display_name}
                </Text>
              </Text>
              <Text style={styles.feedTimestamp}>
                {timeAgo(item.created_at)}
              </Text>
            </View>
            <Ionicons
              name="person-add"
              size={18}
              color={Colors.accent.coral}
            />
          </View>
        </Card>
      );
    }

    const stadium = getStadiumById(item.stadium_id);
    const stadiumName = stadium?.name ?? item.stadium_id;

    return (
      <Card style={styles.feedCard} onPress={() => router.push(('/rating/' + item.id) as any)}>
        <View style={styles.feedRow}>
          <Avatar name={item.display_name} uri={item.avatar_url ?? undefined} size={40} />
          <View style={styles.feedContent}>
            <Text style={styles.feedText}>
              <Text style={styles.feedUserName}>{item.display_name}</Text>
              {' '}rated {stadiumName}
            </Text>
            <Text style={styles.feedTimestamp}>{timeAgo(item.created_at)}</Text>
          </View>
          <Badge label={item.overall.toFixed(1)} variant="rating" size="sm" />
        </View>
      </Card>
    );
  }

  const renderEmptyFeed = () => (
    <Card style={styles.emptyCard}>
      <View style={styles.emptyContent}>
        <Text style={styles.emptyTitle}>Welcome to BallParked!</Text>
        <Text style={styles.emptySubtitle}>
          Start by exploring stadiums and following fans!
        </Text>
        <View style={styles.emptyButtonWrap}>
          <Button
            title="Explore Stadiums"
            onPress={() => router.push('/(tabs)/explore')}
            variant="primary"
            size="md"
          />
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={feedItems}
        keyExtractor={(item) => item.id}
        renderItem={renderFeedItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>BallParked</Text>
              <Text style={styles.subtitle}>Your Stadium Journey</Text>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending Stadiums</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trendingRow}
            >
              {TRENDING_STADIUMS.map((s) => (
                <TrendingCard key={s.id} stadium={s} onPress={() => router.push(`/explore/${s.id}` as any)} />
              ))}
            </ScrollView>

            {/* Leaderboard Teaser */}
            <Card style={styles.leaderboardTeaser} onPress={() => router.push('/leaderboard' as any)}>
              <View style={styles.leaderboardRow}>
                <Ionicons name="trophy" size={22} color={Colors.accent.orange} />
                <View style={{ flex: 1, marginLeft: Spacing.md }}>
                  <Text style={styles.leaderboardTitle}>Leaderboard</Text>
                  <Text style={styles.leaderboardSub}>See who's visited the most stadiums</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
              </View>
            </Card>

            {/* Best Of Rankings */}
            <Card style={styles.leaderboardTeaser} onPress={() => router.push('/best-of' as any)}>
              <View style={styles.leaderboardRow}>
                <Text style={{ fontSize: 20 }}>{'\uD83C\uDFC6'}</Text>
                <View style={{ flex: 1, marginLeft: Spacing.md }}>
                  <Text style={styles.leaderboardTitle}>Best Of</Text>
                  <Text style={styles.leaderboardSub}>Top stadiums ranked by the community</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
              </View>
            </Card>

            {/* Compare Stadiums */}
            <Card style={styles.leaderboardTeaser} onPress={() => router.push('/compare' as any)}>
              <View style={styles.leaderboardRow}>
                <Ionicons name="swap-horizontal" size={22} color={Colors.accent.coral} />
                <View style={{ flex: 1, marginLeft: Spacing.md }}>
                  <Text style={styles.leaderboardTitle}>Compare Stadiums</Text>
                  <Text style={styles.leaderboardSub}>Side-by-side stadium matchups</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
              </View>
            </Card>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
            </View>

            {isLoading && !refreshing && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.accent.coral} />
              </View>
            )}
          </>
        }
        ListEmptyComponent={!isLoading ? renderEmptyFeed : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.cream,
  },
  header: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
    color: Colors.primary.navy,
  },
  subtitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  sectionHeader: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.primary.navy,
  },
  trendingRow: {
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  trendingCard: {
    width: 140,
    height: 100,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadows.md,
  },
  trendingOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  leaderboardTeaser: {
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderboardTitle: {
    ...Typography.bodyBold,
    color: Colors.primary.navy,
  },
  leaderboardSub: {
    ...Typography.small,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  trendingName: {
    ...Typography.smallBold,
    color: Colors.text.inverse,
    marginBottom: Spacing.xs,
  },
  trendingTeam: {
    ...Typography.tiny,
    color: 'rgba(255,255,255,0.8)',
  },
  feedCard: {
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.sm,
  },
  feedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  feedContent: {
    flex: 1,
  },
  feedText: {
    ...Typography.caption,
    color: Colors.text.primary,
  },
  feedUserName: {
    fontWeight: FontWeight.bold,
  },
  feedTimestamp: {
    ...Typography.small,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs / 2,
  },
  listContent: {
    paddingBottom: Layout.tabBarHeight + Spacing.lg,
  },
  loadingContainer: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyCard: {
    marginHorizontal: Layout.screenPadding,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.primary.navy,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyButtonWrap: {
    marginTop: Spacing.sm,
  },
});
