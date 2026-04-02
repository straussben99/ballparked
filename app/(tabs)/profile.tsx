import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { FontSize, FontWeight, Typography } from '@/constants/typography';
import { Shadows } from '@/constants/shadows';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAuthStore } from '@/stores/useAuthStore';
import { useStadiumStore } from '@/stores/useStadiumStore';
import { useRatingStore } from '@/stores/useRatingStore';
import { getStadiumById } from '@/data/stadiums';

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const visitedIds = useStadiumStore((s) => s.visitedIds);
  const ratings = useRatingStore((s) => s.ratings);

  const visitedCount = visitedIds.length;
  const allRatings = Object.values(ratings);
  const avgRating =
    allRatings.length > 0
      ? Math.round(
          (allRatings.reduce((acc, r) => acc + r.overall, 0) / allRatings.length) * 10
        ) / 10
      : 0;

  if (!user) return null;

  const total = 30;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Settings icon */}
        <View style={styles.settingsRow}>
          <Ionicons name="settings-outline" size={24} color={Colors.text.secondary} />
        </View>

        {/* Avatar + Identity */}
        <View style={styles.profileCenter}>
          <Avatar name={user.displayName} size={Layout.avatarSize.xl} />
          <Text style={styles.displayName}>{user.displayName}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
        </View>

        {/* Stats row */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{visitedCount} / {total}</Text>
              <Text style={styles.statLabel}>Visited</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{avgRating > 0 ? avgRating.toFixed(1) : '\u2014'}</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{user.followersCount} / {user.followingCount}</Text>
              <Text style={styles.statLabel}>Followers / Following</Text>
            </View>
          </View>
        </Card>

        {/* Progress */}
        <View style={styles.progressSection}>
          <ProgressBar
            progress={visitedCount / total}
            height={10}
            showLabel
            label={`${visitedCount} of ${total} stadiums visited`}
          />
        </View>

        {/* My Ratings */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Ratings</Text>
        </View>

        {allRatings.length > 0 ? (
          allRatings.map((r) => {
            const stadium = getStadiumById(r.stadiumId);
            return (
              <Card key={r.id} style={styles.ratingCard}>
                <View style={styles.ratingRow}>
                  <View style={styles.ratingInfo}>
                    <Text style={styles.ratingStadium}>{stadium?.name ?? r.stadiumId}</Text>
                    <Text style={styles.ratingDate}>
                      {new Date(r.updatedAt).toLocaleDateString()}
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
              <Text style={styles.emptySubtitle}>Start exploring stadiums!</Text>
            </View>
          </Card>
        )}

        {/* Favorite Team */}
        {user.favoriteTeam && (
          <View style={styles.favoriteSection}>
            <Badge
              label={`Favorite Team: ${user.favoriteTeam}`}
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
    paddingBottom: Layout.tabBarHeight + Spacing.lg,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.base,
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
  progressSection: {
    paddingHorizontal: Layout.screenPadding,
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    paddingHorizontal: Layout.screenPadding,
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
  emptySubtitle: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
  favoriteSection: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
});
