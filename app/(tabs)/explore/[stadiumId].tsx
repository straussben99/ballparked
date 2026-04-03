import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { FontSize, FontWeight, Typography } from '@/constants/typography';
import { Shadows } from '@/constants/shadows';
import { getStadiumById } from '@/data/stadiums';
import { useStadiumStore } from '@/stores/useStadiumStore';
import { useRatingStore } from '@/stores/useRatingStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { StadiumHero } from '@/components/stadium/StadiumHero';
import { StadiumFacts } from '@/components/stadium/StadiumFacts';
import { CommentSection } from '@/components/social/CommentSection';

interface CommunityRating {
  id: string;
  user_id: string;
  stadium_id: string;
  overall: number;
  created_at: string;
  profiles: {
    display_name: string;
    username: string;
    avatar_url: string | null;
  };
}

interface StadiumStats {
  stadium_id: string;
  avg_rating: number;
  rating_count: number;
}

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  return date.toLocaleDateString();
}

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function StadiumDetailScreen() {
  const { stadiumId } = useLocalSearchParams<{ stadiumId: string }>();
  const router = useRouter();
  const stadium = getStadiumById(stadiumId);
  const isVisited = useStadiumStore((state) => state.isVisited(stadiumId));
  const rating = useRatingStore((state) => state.getRating(stadiumId));
  const user = useAuthStore((state) => state.user);

  const [communityRatings, setCommunityRatings] = useState<CommunityRating[]>([]);
  const [stadiumStats, setStadiumStats] = useState<StadiumStats | null>(null);
  const [isLoadingCommunity, setIsLoadingCommunity] = useState(true);
  const [userPhotos, setUserPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (!stadiumId) return;

    const fetchCommunityData = async () => {
      setIsLoadingCommunity(true);
      try {
        const [ratingsRes, statsRes] = await Promise.all([
          supabase
            .from('ratings')
            .select('*, profiles(display_name, username, avatar_url)')
            .eq('stadium_id', stadiumId)
            .order('created_at', { ascending: false })
            .limit(10),
          supabase
            .from('stadium_stats')
            .select('*')
            .eq('stadium_id', stadiumId)
            .single(),
        ]);

        if (ratingsRes.data) {
          setCommunityRatings(ratingsRes.data as CommunityRating[]);
        }
        if (statsRes.data) {
          setStadiumStats(statsRes.data as StadiumStats);
        }

        // Fetch user-uploaded photos for ratings at this stadium
        const ratingIds = (ratingsRes.data ?? []).map((r: any) => r.id);
        if (ratingIds.length > 0) {
          const { data: photosData } = await supabase
            .from('rating_photos')
            .select('url')
            .in('rating_id', ratingIds)
            .limit(20);

          if (photosData && photosData.length > 0) {
            setUserPhotos(photosData.map((p: any) => p.url));
          }
        }
      } catch (err) {
        console.error('Failed to fetch community data:', err);
      } finally {
        setIsLoadingCommunity(false);
      }
    };

    fetchCommunityData();
  }, [stadiumId]);

  // Filter out current user's rating from community list
  const otherRatings = communityRatings.filter(
    (r) => r.user_id !== user?.id
  );

  if (!stadium) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Stadium not found</Text>
      </View>
    );
  }

  const openMaps = () => {
    const address = encodeURIComponent(stadium.address);
    const url = Platform.select({
      ios: `maps:0,0?q=${address}`,
      android: `geo:0,0?q=${address}`,
      default: `https://maps.google.com/?q=${address}`,
    });
    Linking.openURL(url);
  };

  const handleRate = () => {
    router.push(`/rate/${stadiumId}` as any);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StadiumHero stadium={stadium} />

        {/* Community Average */}
        {stadiumStats && (
          <View style={styles.communityAvgRow}>
            <Ionicons name="people" size={18} color={Colors.accent.orange} />
            <Text style={styles.communityAvgText}>
              Community: {stadiumStats.avg_rating}
            </Text>
            <Text style={styles.communityAvgCount}>
              ({stadiumStats.rating_count} rating{stadiumStats.rating_count !== 1 ? 's' : ''})
            </Text>
          </View>
        )}

        {/* Address */}
        <TouchableOpacity style={styles.addressRow} onPress={openMaps}>
          <Ionicons name="location-outline" size={18} color={Colors.accent.coral} />
          <Text style={styles.addressText}>{stadium.address}</Text>
          <Ionicons
            name="open-outline"
            size={14}
            color={Colors.text.tertiary}
          />
        </TouchableOpacity>

        {/* Visited Badge (auto-set when rated) */}
        {isVisited && (
          <View style={styles.visitedBadgeRow}>
            <View style={styles.visitedBadge}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.text.inverse} />
              <Text style={styles.visitedBadgeText}>Visited</Text>
            </View>
          </View>
        )}

        {/* Stadium Facts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stadium Facts</Text>
          <StadiumFacts stadium={stadium} />
        </View>

        {/* Notable Features */}
        {stadium.notableFeatures.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notable Features</Text>
            {stadium.notableFeatures.map((feature, index) => (
              <View key={index} style={styles.bulletRow}>
                <Text style={styles.bulletEmoji}>{'\u26BE'}</Text>
                <Text style={styles.bulletText}>{feature}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Fun Facts */}
        {stadium.funFacts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fun Facts</Text>
            {stadium.funFacts.map((fact, index) => (
              <View key={index} style={styles.bulletRow}>
                <Text style={styles.bulletEmoji}>{'\uD83D\uDCA1'}</Text>
                <Text style={styles.bulletText}>{fact}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Your Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rating</Text>
          {rating ? (
            <View style={styles.ratingDisplay}>
              <Text style={styles.ratingScore}>{rating.overall}</Text>
              <Text style={styles.ratingLabel}>/ 10</Text>
            </View>
          ) : (
            <Text style={styles.noRatingText}>
              You haven't rated this stadium yet.
            </Text>
          )}
          {userPhotos.length > 0 && (
            <View style={styles.userPhotosSection}>
              <Text style={styles.userPhotosTitle}>{'\uD83D\uDCF8'} Your Photos</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.userPhotosScroll}
              >
                {userPhotos.map((url, i) => (
                  <Image
                    key={i}
                    source={{ uri: url }}
                    style={styles.userPhoto}
                    contentFit="cover"
                    transition={200}
                  />
                ))}
              </ScrollView>
            </View>
          )}
          {rating && (
            <CommentSection ratingId={rating.id} stadiumId={stadiumId} />
          )}
        </View>

        {/* Community Ratings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Community Ratings{otherRatings.length > 0 ? ` (${otherRatings.length})` : ''}
          </Text>
          {isLoadingCommunity ? (
            <ActivityIndicator color={Colors.accent.coral} style={{ marginVertical: Spacing.base }} />
          ) : otherRatings.length === 0 ? (
            <Text style={styles.noRatingText}>
              Be the first to rate this stadium!
            </Text>
          ) : (
            otherRatings.map((cr) => (
              <View key={cr.id} style={styles.communityCard}>
                <View style={styles.communityHeader}>
                  <View style={styles.communityAvatar}>
                    <Text style={styles.communityAvatarText}>
                      {getInitials(cr.profiles?.display_name)}
                    </Text>
                  </View>
                  <View style={styles.communityInfo}>
                    <Text style={styles.communityDisplayName}>
                      {cr.profiles?.display_name ?? 'User'}
                    </Text>
                    {cr.profiles?.username && (
                      <Text style={styles.communityUsername}>
                        @{cr.profiles.username}
                      </Text>
                    )}
                  </View>
                  <View style={styles.communityScoreBadge}>
                    <Text style={styles.communityScoreText}>{cr.overall}</Text>
                  </View>
                  <Text style={styles.communityTimestamp}>
                    {getRelativeTime(cr.created_at)}
                  </Text>
                </View>
                <CommentSection ratingId={cr.id} stadiumId={stadiumId} />
              </View>
            ))
          )}
        </View>

        {/* Bottom spacer for floating bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.rateButton} onPress={handleRate}>
          <Ionicons name="star-outline" size={20} color={Colors.text.inverse} />
          <Text style={styles.rateButtonText}>
            {rating ? 'Update Rating' : 'Rate This Stadium'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.cream,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.cream,
  },
  errorText: {
    ...Typography.h4,
    color: Colors.text.secondary,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.base,
    gap: Spacing.sm,
  },
  addressText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text.secondary,
  },
  section: {
    paddingHorizontal: Layout.screenPadding,
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.primary.navy,
    marginBottom: Spacing.md,
  },
  visitedBadgeRow: {
    paddingHorizontal: Layout.screenPadding,
    marginTop: Spacing.md,
  },
  visitedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.accent.green,
  },
  visitedBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.inverse,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
    paddingRight: Spacing.base,
  },
  bulletEmoji: {
    fontSize: FontSize.base,
    marginRight: Spacing.sm,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  ratingScore: {
    fontSize: FontSize['4xl'],
    fontWeight: FontWeight.bold,
    color: Colors.accent.orange,
  },
  ratingLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: Colors.text.tertiary,
    marginLeft: Spacing.xs,
  },
  noRatingText: {
    fontSize: FontSize.md,
    color: Colors.text.tertiary,
  },
  userPhotosSection: {
    marginTop: Spacing.base,
  },
  userPhotosTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    color: Colors.primary.navy,
    marginBottom: Spacing.sm,
  },
  userPhotosScroll: {
    gap: Spacing.sm,
  },
  userPhoto: {
    width: 160,
    height: 120,
    borderRadius: BorderRadius.md,
  },
  communityAvgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  communityAvgText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.accent.orange,
  },
  communityAvgCount: {
    fontSize: FontSize.md,
    color: Colors.text.tertiary,
  },
  communityCard: {
    backgroundColor: Colors.background.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  communityAvatar: {
    width: Layout.avatarSize.sm,
    height: Layout.avatarSize.sm,
    borderRadius: Layout.avatarSize.sm / 2,
    backgroundColor: Colors.primary.navyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityAvatarText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.inverse,
  },
  communityInfo: {
    flex: 1,
  },
  communityDisplayName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary.navy,
  },
  communityUsername: {
    fontSize: FontSize.sm,
    color: Colors.text.tertiary,
  },
  communityScoreBadge: {
    backgroundColor: Colors.accent.orange,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  communityScoreText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.inverse,
  },
  communityTimestamp: {
    fontSize: FontSize.xs,
    color: Colors.text.tertiary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['2xl'],
    backgroundColor: Colors.background.cream,
    borderTopWidth: 1,
    borderTopColor: Colors.card.border,
    ...Shadows.md,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent.coral,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.md,
  },
  rateButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text.inverse,
  },
});
