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
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
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

interface FeedItem {
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

function renderTrendingCard(stadium: TrendingStadium) {
  const divisionColor = Colors.division[stadium.division] ?? Colors.primary.navy;
  return (
    <LinearGradient
      key={stadium.id}
      colors={[divisionColor, Colors.primary.navyDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.trendingCard}
    >
      <Text style={styles.trendingName} numberOfLines={2}>{stadium.name}</Text>
      <Text style={styles.trendingTeam}>{stadium.team}</Text>
    </LinearGradient>
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
      const { data, error } = await supabase.rpc('get_activity_feed', {
        requesting_user_id: user.id,
        feed_limit: 30,
      });

      if (error) throw error;
      setFeedItems((data as FeedItem[]) ?? []);
    } catch (err) {
      console.error('Failed to fetch feed:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFeed();
  };

  function renderFeedItem({ item }: { item: FeedItem }) {
    const stadium = getStadiumById(item.stadium_id);
    const stadiumName = stadium?.name ?? item.stadium_id;

    return (
      <Card style={styles.feedCard} onPress={() => router.push(('/rating/' + item.id) as any)}>
        <View style={styles.feedRow}>
          <Avatar name={item.display_name} size={40} />
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
              {TRENDING_STADIUMS.map(renderTrendingCard)}
            </ScrollView>

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
    padding: Spacing.md,
    justifyContent: 'flex-end',
    ...Shadows.md,
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
