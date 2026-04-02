import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RatingCategoryDefinition, CategoryRating } from '@/types/rating';
import { RatingSlider } from '@/components/rating/RatingSlider';
import { TagSelector } from '@/components/rating/TagSelector';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { FontSize, FontWeight } from '@/constants/typography';

interface RatingCategoryProps {
  category: RatingCategoryDefinition;
  rating: CategoryRating;
  onRatingChange: (rating: CategoryRating) => void;
}

export const RatingCategory: React.FC<RatingCategoryProps> = ({
  category,
  rating,
  onRatingChange,
}) => {
  const handleScoreChange = (score: number) => {
    onRatingChange({ ...rating, score });
  };

  const handleTagToggle = (tag: string) => {
    const selected = rating.selectedTags.includes(tag)
      ? rating.selectedTags.filter((t) => t !== tag)
      : [...rating.selectedTags, tag];
    onRatingChange({ ...rating, selectedTags: selected });
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.emoji}>{category.emoji}</Text>
        <View style={styles.headerText}>
          <Text style={styles.label}>{category.label}</Text>
          <Text style={styles.subtitle}>{category.subtitle}</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreBadgeText}>{rating.score}</Text>
        </View>
      </View>

      <Text style={styles.description}>{category.description}</Text>

      <RatingSlider
        value={rating.score}
        onValueChange={handleScoreChange}
        sliderLabels={category.sliderLabels}
      />

      <TagSelector
        tags={category.tags}
        selectedTags={rating.selectedTags}
        onToggle={handleTagToggle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.white,
    borderRadius: BorderRadius.lg,
    padding: Layout.cardPadding,
    borderWidth: 1,
    borderColor: Colors.card.border,
    marginBottom: Spacing.base,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  emoji: {
    fontSize: FontSize['2xl'],
    marginRight: Spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  label: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  scoreBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBadgeText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text.inverse,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
});
