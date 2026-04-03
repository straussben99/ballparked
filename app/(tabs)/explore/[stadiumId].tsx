import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { FontSize, FontWeight, Typography } from '@/constants/typography';
import { Shadows } from '@/constants/shadows';
import { getStadiumById } from '@/data/stadiums';
import { useStadiumStore } from '@/stores/useStadiumStore';
import { useRatingStore } from '@/stores/useRatingStore';
import { StadiumHero } from '@/components/stadium/StadiumHero';
import { StadiumFacts } from '@/components/stadium/StadiumFacts';

export default function StadiumDetailScreen() {
  const { stadiumId } = useLocalSearchParams<{ stadiumId: string }>();
  const router = useRouter();
  const stadium = getStadiumById(stadiumId);
  const isVisited = useStadiumStore((state) => state.isVisited(stadiumId));
  const rating = useRatingStore((state) => state.getRating(stadiumId));

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
