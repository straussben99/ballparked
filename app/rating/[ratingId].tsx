import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { FontSize, FontWeight, Typography } from '@/constants/typography';
import { Shadows } from '@/constants/shadows';
import { supabase } from '@/lib/supabase';
import { getStadiumById } from '@/data/stadiums';
import { getStadiumImage } from '@/data/stadium-images';
import { RATING_CATEGORIES } from '@/types/rating';
import { CommentSection } from '@/components/social/CommentSection';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PHOTO_SIZE = (SCREEN_WIDTH - 60) / 3;

interface RatingDetail {
  id: string;
  user_id: string;
  stadium_id: string;
  vibes_score: number;
  vibes_tags: string[];
  food_score: number;
  food_tags: string[];
  views_score: number;
  views_tags: string[];
  identity_score: number;
  identity_tags: string[];
  accessibility_score: number;
  accessibility_tags: string[];
  overall: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    display_name: string;
    username: string;
    avatar_url: string | null;
  };
}

interface RatingPhoto {
  url: string;
}

const CATEGORY_SCORE_MAP: Record<string, { scoreKey: string; tagsKey: string }> = {
  vibes: { scoreKey: 'vibes_score', tagsKey: 'vibes_tags' },
  foodAndBeer: { scoreKey: 'food_score', tagsKey: 'food_tags' },
  views: { scoreKey: 'views_score', tagsKey: 'views_tags' },
  stadiumIdentity: { scoreKey: 'identity_score', tagsKey: 'identity_tags' },
  accessibility: { scoreKey: 'accessibility_score', tagsKey: 'accessibility_tags' },
};

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

export default function RatingDetailScreen() {
  const { ratingId } = useLocalSearchParams<{ ratingId: string }>();
  const router = useRouter();
  const [rating, setRating] = useState<RatingDetail | null>(null);
  const [photos, setPhotos] = useState<RatingPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!ratingId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [ratingRes, photosRes] = await Promise.all([
          supabase
            .from('ratings')
            .select('*, profiles(display_name, username, avatar_url)')
            .eq('id', ratingId)
            .single(),
          supabase
            .from('rating_photos')
            .select('url')
            .eq('rating_id', ratingId),
        ]);

        if (ratingRes.data) {
          setRating(ratingRes.data as RatingDetail);
        }
        if (photosRes.data) {
          setPhotos(photosRes.data as RatingPhoto[]);
        }
      } catch (err) {
        console.error('Failed to fetch rating detail:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [ratingId]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary.navy} />
        </TouchableOpacity>
        <ActivityIndicator size="large" color={Colors.accent.coral} />
      </SafeAreaView>
    );
  }

  if (!rating) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary.navy} />
        </TouchableOpacity>
        <Text style={styles.errorText}>Rating not found</Text>
      </SafeAreaView>
    );
  }

  const stadium = getStadiumById(rating.stadium_id);
  const stadiumImage = getStadiumImage(rating.stadium_id);
  const stadiumName = stadium?.name ?? rating.stadium_id;
  const teamName = stadium?.team ?? '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stadium Hero Image */}
        <View style={styles.heroContainer}>
          {stadiumImage && (
            <Image
              source={stadiumImage}
              style={styles.heroImage}
              contentFit="cover"
            />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(27, 42, 74, 0.85)']}
            style={styles.heroGradient}
          >
            <Text style={styles.heroStadiumName}>{stadiumName}</Text>
            {teamName ? (
              <Text style={styles.heroTeamName}>{teamName}</Text>
            ) : null}
          </LinearGradient>
          <TouchableOpacity
            style={styles.heroBackButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.inverse} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.heroShareButton}
            onPress={() => {
              const displayName = rating.profiles?.display_name ?? 'Someone';
              let message = `${displayName} rated ${stadiumName} ${rating.overall.toFixed(1)}/10 on BallParked! \u{1F3DF}\u26BE\n\nVibes: ${rating.vibes_score}/10\nFood & Beer: ${rating.food_score}/10\nViews: ${rating.views_score}/10\nStadium Identity: ${rating.identity_score}/10\nAccessibility: ${rating.accessibility_score}/10`;
              if (rating.comment) {
                message += `\n\n"${rating.comment}"`;
              }
              message += '\n\nDownload BallParked to track your MLB stadium journey!';
              Share.share({ message });
            }}
          >
            <Ionicons name="share-outline" size={22} color={Colors.text.inverse} />
          </TouchableOpacity>
        </View>

        {/* User Row */}
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(rating.profiles?.display_name)}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.displayName}>
              {rating.profiles?.display_name ?? 'User'}
            </Text>
            {rating.profiles?.username && (
              <Text style={styles.username}>@{rating.profiles.username}</Text>
            )}
          </View>
          <Text style={styles.timestamp}>
            {getRelativeTime(rating.created_at)}
          </Text>
        </View>

        {/* Overall Score Card */}
        <View style={styles.overallCard}>
          <Text style={styles.overallScore}>{rating.overall.toFixed(1)}</Text>
          <Text style={styles.overallLabel}>/ 10</Text>
        </View>

        {/* Category Breakdowns */}
        <View style={styles.categoriesSection}>
          {RATING_CATEGORIES.map((category) => {
            const mapping = CATEGORY_SCORE_MAP[category.key];
            const score = (rating as any)[mapping.scoreKey] as number;
            const tags = (rating as any)[mapping.tagsKey] as string[];

            return (
              <View key={category.key} style={styles.categoryBlock}>
                <View style={styles.categoryRow}>
                  <View style={styles.categoryLeft}>
                    <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                    <Text style={styles.categoryLabel}>{category.label}</Text>
                  </View>
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreBadgeText}>{score}</Text>
                    <Text style={styles.scoreBadgeMax}>/10</Text>
                  </View>
                </View>
                {tags && tags.length > 0 && (
                  <View style={styles.tagsRow}>
                    {tags.map((tag) => (
                      <View key={tag} style={styles.tagChip}>
                        <Text style={styles.tagChipText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Photos Section */}
        {photos.length > 0 && (
          <View style={styles.photosSection}>
            <Text style={styles.photosSectionTitle}>Photos</Text>
            <View style={styles.photosGrid}>
              {photos.map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: photo.url }}
                  style={styles.photoThumbnail}
                  contentFit="cover"
                  transition={200}
                />
              ))}
            </View>
          </View>
        )}

        {/* Comment Section */}
        <View style={styles.commentSection}>
          <CommentSection ratingId={ratingId} stadiumId={rating.stadium_id} />
        </View>
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
    paddingBottom: Spacing['3xl'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.cream,
  },
  errorText: {
    ...Typography.h4,
    color: Colors.text.secondary,
    marginTop: Spacing.lg,
  },
  backButton: {
    position: 'absolute',
    top: Spacing.xl,
    left: Layout.screenPadding,
  },

  // Hero
  heroContainer: {
    height: 180,
    backgroundColor: Colors.primary.navyDark,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.base,
    paddingTop: Spacing['3xl'],
  },
  heroStadiumName: {
    ...Typography.h3,
    color: Colors.text.inverse,
  },
  heroTeamName: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.xs,
  },
  heroBackButton: {
    position: 'absolute',
    top: Spacing.xl,
    left: Layout.screenPadding,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroShareButton: {
    position: 'absolute',
    top: Spacing.xl,
    right: Layout.screenPadding,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // User Row
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.base,
    gap: Spacing.md,
  },
  avatar: {
    width: Layout.avatarSize.md,
    height: Layout.avatarSize.md,
    borderRadius: Layout.avatarSize.md / 2,
    backgroundColor: Colors.primary.navyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.inverse,
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    ...Typography.bodyBold,
    color: Colors.primary.navy,
  },
  username: {
    ...Typography.small,
    color: Colors.text.tertiary,
    marginTop: 1,
  },
  timestamp: {
    ...Typography.small,
    color: Colors.text.tertiary,
  },

  // Overall Score
  overallCard: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.accent.coral,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  overallScore: {
    fontSize: FontSize['4xl'],
    fontWeight: FontWeight.extraBold,
    color: Colors.text.inverse,
  },
  overallLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: Spacing.xs,
  },

  // Categories
  categoriesSection: {
    marginTop: Spacing.lg,
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.base,
  },
  categoryBlock: {
    backgroundColor: Colors.background.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryEmoji: {
    fontSize: FontSize.xl,
  },
  categoryLabel: {
    ...Typography.bodyBold,
    color: Colors.primary.navy,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: Colors.accent.coral,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  scoreBadgeText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text.inverse,
  },
  scoreBadgeMax: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  tagChip: {
    backgroundColor: Colors.accent.coralLight + '30',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  tagChipText: {
    ...Typography.small,
    color: Colors.accent.coralDark,
    fontWeight: FontWeight.semiBold,
  },

  // Photos
  photosSection: {
    marginTop: Spacing.xl,
    paddingHorizontal: Layout.screenPadding,
  },
  photosSectionTitle: {
    ...Typography.h4,
    color: Colors.primary.navy,
    marginBottom: Spacing.md,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  photoThumbnail: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: BorderRadius.sm,
  },

  // Comments
  commentSection: {
    marginTop: Spacing.xl,
    paddingHorizontal: Layout.screenPadding,
  },
});
