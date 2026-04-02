import React from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { FontSize, FontWeight, Typography } from '@/constants/typography';
import { Shadows } from '@/constants/shadows';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import type { ActivityType } from '@/types/social';

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
  type: ActivityType;
  userName: string;
  stadiumName?: string;
  rating?: number;
  timestamp: string;
}

const MOCK_FEED: FeedItem[] = [
  { id: '1', type: 'rating', userName: 'Sarah M.', stadiumName: 'Fenway Park', rating: 9.2, timestamp: '2h ago' },
  { id: '2', type: 'visit', userName: 'Jake T.', stadiumName: 'Wrigley Field', timestamp: '5h ago' },
  { id: '3', type: 'rating', userName: 'Mike R.', stadiumName: 'PNC Park', rating: 8.7, timestamp: '8h ago' },
  { id: '4', type: 'follow', userName: 'Emma L.', timestamp: '12h ago' },
  { id: '5', type: 'rating', userName: 'Chris D.', stadiumName: 'Oracle Park', rating: 9.0, timestamp: '1d ago' },
  { id: '6', type: 'visit', userName: 'Alex J.', stadiumName: 'Dodger Stadium', timestamp: '1d ago' },
];

function getActionText(item: FeedItem): string {
  switch (item.type) {
    case 'rating':
      return `rated ${item.stadiumName} ${item.rating}`;
    case 'visit':
      return `visited ${item.stadiumName}`;
    case 'follow':
      return 'started following you';
    default:
      return '';
  }
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

function renderFeedItem({ item }: { item: FeedItem }) {
  return (
    <Card style={styles.feedCard}>
      <View style={styles.feedRow}>
        <Avatar name={item.userName} size={40} />
        <View style={styles.feedContent}>
          <Text style={styles.feedText}>
            <Text style={styles.feedUserName}>{item.userName}</Text>
            {' '}{getActionText(item)}
          </Text>
          <Text style={styles.feedTimestamp}>{item.timestamp}</Text>
        </View>
        {item.type === 'rating' && item.rating != null && (
          <Badge label={String(item.rating)} variant="rating" size="sm" />
        )}
      </View>
    </Card>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={MOCK_FEED}
        keyExtractor={(item) => item.id}
        renderItem={renderFeedItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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
          </>
        }
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
});
