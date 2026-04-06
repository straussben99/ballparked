import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { FontSize, FontWeight, Typography } from '@/constants/typography';
import { Shadows } from '@/constants/shadows';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { getStadiumById } from '@/data/stadiums';
import { getStadiumImage } from '@/data/stadium-images';

interface StadiumRankingRow {
  stadium_id: string;
  avg_vibes: number;
  avg_food: number;
  avg_views: number;
  avg_identity: number;
  avg_accessibility: number;
  avg_overall: number;
  rating_count: number;
}

interface RankedStadium {
  stadiumId: string;
  name: string;
  team: string;
  score: number;
}

const CATEGORIES = [
  { key: 'avg_overall', label: 'Overall Best', icon: 'trophy', color: Colors.accent.orange },
  { key: 'avg_food', label: 'Best Food', icon: 'fast-food', color: Colors.accent.coral },
  { key: 'avg_views', label: 'Best Views', icon: 'eye', color: Colors.primary.navy },
  { key: 'avg_vibes', label: 'Best Vibes', icon: 'musical-notes', color: Colors.accent.green },
  { key: 'avg_identity', label: 'Most Unique', icon: 'finger-print', color: '#9370DB' },
  { key: 'avg_accessibility', label: 'Most Accessible', icon: 'accessibility', color: '#1E90FF' },
] as const;

const MIN_RATINGS_FOR_RANKING = 2;

export default function BestOfScreen() {
  const router = useRouter();
  const [rankings, setRankings] = useState<StadiumRankingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string>('avg_overall');

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('stadium_id, vibes_score, food_score, views_score, identity_score, accessibility_score, overall');

      if (error) throw error;
      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      // Group by stadium_id and compute averages
      const groups: Record<string, { sums: Record<string, number>; count: number }> = {};
      for (const row of data) {
        if (!groups[row.stadium_id]) {
          groups[row.stadium_id] = {
            sums: { vibes: 0, food: 0, views: 0, identity: 0, accessibility: 0, overall: 0 },
            count: 0,
          };
        }
        const g = groups[row.stadium_id];
        g.sums.vibes += row.vibes_score ?? 0;
        g.sums.food += row.food_score ?? 0;
        g.sums.views += row.views_score ?? 0;
        g.sums.identity += row.identity_score ?? 0;
        g.sums.accessibility += row.accessibility_score ?? 0;
        g.sums.overall += row.overall ?? 0;
        g.count++;
      }

      const result: StadiumRankingRow[] = Object.entries(groups).map(([stadiumId, g]) => ({
        stadium_id: stadiumId,
        avg_vibes: g.sums.vibes / g.count,
        avg_food: g.sums.food / g.count,
        avg_views: g.sums.views / g.count,
        avg_identity: g.sums.identity / g.count,
        avg_accessibility: g.sums.accessibility / g.count,
        avg_overall: g.sums.overall / g.count,
        rating_count: g.count,
      }));

      setRankings(result);
    } catch (err) {
      console.error('Failed to fetch rankings:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTopStadiums = (key: string, limit = 5): RankedStadium[] => {
    const eligible = rankings.filter((r) => r.rating_count >= MIN_RATINGS_FOR_RANKING);
    const sorted = [...eligible].sort(
      (a, b) => (b[key as keyof StadiumRankingRow] as number) - (a[key as keyof StadiumRankingRow] as number),
    );
    return sorted.slice(0, limit).map((r) => {
      const stadium = getStadiumById(r.stadium_id);
      return {
        stadiumId: r.stadium_id,
        name: stadium?.name ?? r.stadium_id,
        team: stadium?.team ?? '',
        score: Math.round((r[key as keyof StadiumRankingRow] as number) * 10) / 10,
      };
    });
  };

  const renderRankItem = (item: RankedStadium, index: number, color: string) => {
    const image = getStadiumImage(item.stadiumId);
    const barWidth = (item.score / 5) * 100;
    const isGold = index === 0;
    const isSilver = index === 1;
    const isBronze = index === 2;

    const rankColors = isGold
      ? Colors.accent.orange
      : isSilver
        ? Colors.text.tertiary
        : isBronze
          ? '#CD7F32'
          : Colors.text.secondary;

    return (
      <TouchableOpacity
        key={item.stadiumId}
        style={styles.rankItem}
        onPress={() => router.push(`/explore/${item.stadiumId}` as any)}
        activeOpacity={0.7}
      >
        <View style={styles.rankNumberContainer}>
          <Text style={[styles.rankNumber, { color: rankColors }]}>{index + 1}</Text>
        </View>
        {image ? (
          <Image source={image} style={styles.rankImage} contentFit="cover" />
        ) : (
          <View style={[styles.rankImage, { backgroundColor: Colors.background.warmGrey }]} />
        )}
        <View style={styles.rankInfo}>
          <Text style={styles.rankName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.rankTeam} numberOfLines={1}>
            {item.team}
          </Text>
          <View style={styles.rankBarTrack}>
            <View
              style={[styles.rankBarFill, { width: `${barWidth}%`, backgroundColor: color }]}
            />
          </View>
        </View>
        <Text style={[styles.rankScore, { color }]}>{item.score.toFixed(1)}</Text>
      </TouchableOpacity>
    );
  };

  const renderCategory = (cat: typeof CATEGORIES[number]) => {
    const top = getTopStadiums(cat.key);
    const isExpanded = expandedCategory === cat.key;
    const hasEnoughData = top.length > 0;

    return (
      <View key={cat.key} style={styles.categorySection}>
        <TouchableOpacity
          style={styles.categoryHeaderRow}
          onPress={() => setExpandedCategory(isExpanded ? '' : cat.key)}
          activeOpacity={0.7}
        >
          <View style={[styles.categoryIconCircle, { backgroundColor: cat.color + '20' }]}>
            <Ionicons name={cat.icon as any} size={18} color={cat.color} />
          </View>
          <Text style={styles.categoryTitle}>{cat.label}</Text>
          {hasEnoughData && top[0] && (
            <View style={[styles.topBadge, { backgroundColor: cat.color }]}>
              <Text style={styles.topBadgeText}>{top[0].score.toFixed(1)}</Text>
            </View>
          )}
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={Colors.text.tertiary}
          />
        </TouchableOpacity>

        {isExpanded && (
          <Card style={styles.rankCard}>
            {!hasEnoughData ? (
              <View style={styles.noDataContainer}>
                <Ionicons name="bar-chart-outline" size={32} color={Colors.text.tertiary} />
                <Text style={styles.noDataText}>
                  More ratings needed to generate rankings
                </Text>
              </View>
            ) : (
              top.map((item, index) => renderRankItem(item, index, cat.color))
            )}
          </Card>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary.navy} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Best Of {'\uD83C\uDFC6'}</Text>
            <Text style={styles.subtitle}>Community-ranked stadium superlatives</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.accent.coral} />
            <Text style={styles.loadingText}>Crunching the numbers...</Text>
          </View>
        ) : (
          CATEGORIES.map(renderCategory)
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
    paddingBottom: Spacing['4xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  title: {
    ...Typography.h3,
    color: Colors.primary.navy,
  },
  subtitle: {
    ...Typography.small,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['5xl'],
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  categorySection: {
    marginBottom: Spacing.sm,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  categoryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    ...Typography.bodyBold,
    color: Colors.primary.navy,
    flex: 1,
  },
  topBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
  },
  topBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.inverse,
  },
  rankCard: {
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.sm,
    padding: Spacing.sm,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.md,
  },
  rankNumberContainer: {
    width: 24,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extraBold,
  },
  rankImage: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    ...Typography.captionBold,
    color: Colors.text.primary,
  },
  rankTeam: {
    ...Typography.tiny,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  rankBarTrack: {
    height: 6,
    backgroundColor: Colors.background.warmGrey,
    borderRadius: 3,
    overflow: 'hidden',
  },
  rankBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  rankScore: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extraBold,
    width: 36,
    textAlign: 'right',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  noDataText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});
