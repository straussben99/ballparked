import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getStadiumById } from '@/data/stadiums';
import {
  RATING_CATEGORIES,
  CategoryRating,
  RatingCategoryKey,
} from '@/types/rating';
import { useRatingStore } from '@/stores/useRatingStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { RatingCategory } from '@/components/rating/RatingCategory';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { FontSize, FontWeight } from '@/constants/typography';

const DEFAULT_CATEGORY_RATING: CategoryRating = { score: 5, selectedTags: [] };

export default function RateStadiumModal() {
  const { stadiumId } = useLocalSearchParams<{ stadiumId: string }>();
  const router = useRouter();
  const stadium = getStadiumById(stadiumId ?? '');
  const existingRating = useRatingStore((s) => s.getRating(stadiumId ?? ''));
  const submitRating = useRatingStore((s) => s.submitRating);
  const isSubmitting = useRatingStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);

  const [ratings, setRatings] = useState<Record<RatingCategoryKey, CategoryRating>>({
    vibes: { ...DEFAULT_CATEGORY_RATING },
    foodAndBeer: { ...DEFAULT_CATEGORY_RATING },
    views: { ...DEFAULT_CATEGORY_RATING },
    stadiumIdentity: { ...DEFAULT_CATEGORY_RATING },
    accessibility: { ...DEFAULT_CATEGORY_RATING },
  });

  useEffect(() => {
    if (existingRating) {
      setRatings({
        vibes: { score: existingRating.vibes_score, selectedTags: existingRating.vibes_tags },
        foodAndBeer: { score: existingRating.food_score, selectedTags: existingRating.food_tags },
        views: { score: existingRating.views_score, selectedTags: existingRating.views_tags },
        stadiumIdentity: { score: existingRating.identity_score, selectedTags: existingRating.identity_tags },
        accessibility: { score: existingRating.accessibility_score, selectedTags: existingRating.accessibility_tags },
      });
    }
  }, [existingRating]);

  const overallAverage = useMemo(() => {
    const scores = Object.values(ratings).map((r) => r.score);
    const sum = scores.reduce((acc, s) => acc + s, 0);
    return Math.round((sum / scores.length) * 10) / 10;
  }, [ratings]);

  const handleCategoryChange = (key: RatingCategoryKey, rating: CategoryRating) => {
    setRatings((prev) => ({ ...prev, [key]: rating }));
  };

  const handleSubmit = async () => {
    if (!stadiumId || !user) return;
    try {
      await submitRating(stadiumId, user.id, {
        vibes: ratings.vibes,
        foodAndBeer: ratings.foodAndBeer,
        views: ratings.views,
        stadiumIdentity: ratings.stadiumIdentity,
        accessibility: ratings.accessibility,
      });
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    }
  };

  if (!stadium) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Stadium not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {stadium.name}
          </Text>
          <Text style={styles.headerSubtitle}>{stadium.team}</Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.closeText}>X</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {RATING_CATEGORIES.map((category) => (
          <RatingCategory
            key={category.key}
            category={category}
            rating={ratings[category.key]}
            onRatingChange={(r) => handleCategoryChange(category.key, r)}
          />
        ))}

        {/* Add Photos Section */}
        <View style={styles.photosSection}>
          <Text style={styles.photosSectionTitle}>
            {'\uD83D\uDCF8'} Add Photos
          </Text>
          <Text style={styles.photosSubtext}>
            Share your experience with photos from your visit
          </Text>
          <TouchableOpacity
            style={styles.addPhotoButton}
            onPress={() => Alert.alert('Coming Soon', 'Photo uploads will be available when the backend is connected!')}
            activeOpacity={0.7}
          >
            <Ionicons name="camera-outline" size={32} color={Colors.accent.coral} />
            <Text style={styles.addPhotoText}>Tap to add photos</Text>
            <Text style={styles.addPhotoSubtext}>Up to 10 photos per visit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.overallCard}>
          <Text style={styles.overallLabel}>Overall Rating</Text>
          <Text style={styles.overallScore}>{overallAverage}</Text>
          <Text style={styles.overallSubtext}>Average of all categories</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.text.inverse} />
          ) : (
            <Text style={styles.submitText}>Submit Rating</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
    backgroundColor: Colors.background.white,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background.warmGrey,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  closeText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Layout.screenPadding,
  },
  overallCard: {
    backgroundColor: Colors.accent.coral,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  overallLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.inverse,
    opacity: 0.9,
  },
  overallScore: {
    fontSize: FontSize['4xl'],
    fontWeight: FontWeight.extraBold,
    color: Colors.text.inverse,
    marginVertical: Spacing.xs,
  },
  overallSubtext: {
    fontSize: FontSize.sm,
    color: Colors.text.inverse,
    opacity: 0.8,
  },
  submitButton: {
    backgroundColor: Colors.accent.coral,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text.inverse,
  },
  bottomSpacer: {
    height: Spacing['2xl'],
  },
  photosSection: {
    marginBottom: Spacing.base,
  },
  photosSectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary.navy,
    marginBottom: Spacing.xs,
  },
  photosSubtext: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  addPhotoButton: {
    borderWidth: 2,
    borderColor: Colors.card.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.white,
  },
  addPhotoText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    color: Colors.accent.coral,
    marginTop: Spacing.sm,
  },
  addPhotoSubtext: {
    fontSize: FontSize.sm,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: FontSize.lg,
    color: Colors.text.secondary,
  },
});
