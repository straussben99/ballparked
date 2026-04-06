import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
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
import { STADIUMS } from '@/data/stadiums';
import { getStadiumImage } from '@/data/stadium-images';
import type { Stadium } from '@/types/stadium';

const RATING_CATEGORIES = [
  { key: 'vibes_score', label: 'Vibes', icon: 'musical-notes' as const },
  { key: 'food_score', label: 'Food', icon: 'fast-food' as const },
  { key: 'views_score', label: 'Views', icon: 'eye' as const },
  { key: 'identity_score', label: 'Uniqueness', icon: 'finger-print' as const },
  { key: 'accessibility_score', label: 'Accessibility', icon: 'accessibility' as const },
];

interface CategoryAverages {
  vibes_score: number | null;
  food_score: number | null;
  views_score: number | null;
  identity_score: number | null;
  accessibility_score: number | null;
}

function StadiumPicker({
  visible,
  onClose,
  onSelect,
  excludeId,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (stadium: Stadium) => void;
  excludeId?: string;
}) {
  const [search, setSearch] = useState('');

  const filtered = STADIUMS.filter((s) => {
    if (s.id === excludeId) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.team.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q)
    );
  });

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={pickerStyles.container}>
        <View style={pickerStyles.header}>
          <Text style={pickerStyles.title}>Select Stadium</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-circle" size={28} color={Colors.text.tertiary} />
          </TouchableOpacity>
        </View>
        <View style={pickerStyles.searchContainer}>
          <Ionicons name="search-outline" size={18} color={Colors.text.tertiary} />
          <TextInput
            style={pickerStyles.searchInput}
            placeholder="Search stadiums..."
            placeholderTextColor={Colors.text.tertiary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={pickerStyles.item}
              onPress={() => {
                onSelect(item);
                onClose();
              }}
            >
              <View style={pickerStyles.itemRow}>
                {(() => {
                  const img = getStadiumImage(item.id);
                  return img ? (
                    <Image source={img} style={pickerStyles.itemImage} />
                  ) : (
                    <View
                      style={[
                        pickerStyles.itemImage,
                        { backgroundColor: Colors.division[item.division] || Colors.primary.navy },
                      ]}
                    />
                  );
                })()}
                <View style={pickerStyles.itemText}>
                  <Text style={pickerStyles.itemName}>{item.name}</Text>
                  <Text style={pickerStyles.itemTeam}>{item.team}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const pickerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.cream,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.base,
  },
  title: {
    ...Typography.h3,
    color: Colors.primary.navy,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    borderRadius: BorderRadius.md,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    height: 40,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.text.primary,
  },
  item: {
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  itemImage: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
  },
  itemText: {
    flex: 1,
  },
  itemName: {
    ...Typography.bodyBold,
    color: Colors.text.primary,
  },
  itemTeam: {
    ...Typography.small,
    color: Colors.text.secondary,
    marginTop: 2,
  },
});

export default function CompareScreen() {
  const router = useRouter();
  const [stadiumA, setStadiumA] = useState<Stadium | null>(null);
  const [stadiumB, setStadiumB] = useState<Stadium | null>(null);
  const [pickerTarget, setPickerTarget] = useState<'A' | 'B' | null>(null);
  const [averagesA, setAveragesA] = useState<CategoryAverages | null>(null);
  const [averagesB, setAveragesB] = useState<CategoryAverages | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAverages = useCallback(async (stadiumId: string): Promise<CategoryAverages | null> => {
    const { data, error } = await supabase
      .from('ratings')
      .select('vibes_score, food_score, views_score, identity_score, accessibility_score')
      .eq('stadium_id', stadiumId);

    if (error || !data || data.length === 0) return null;

    const sums = { vibes_score: 0, food_score: 0, views_score: 0, identity_score: 0, accessibility_score: 0 };
    for (const row of data) {
      sums.vibes_score += row.vibes_score ?? 0;
      sums.food_score += row.food_score ?? 0;
      sums.views_score += row.views_score ?? 0;
      sums.identity_score += row.identity_score ?? 0;
      sums.accessibility_score += row.accessibility_score ?? 0;
    }
    const count = data.length;
    return {
      vibes_score: Math.round((sums.vibes_score / count) * 10) / 10,
      food_score: Math.round((sums.food_score / count) * 10) / 10,
      views_score: Math.round((sums.views_score / count) * 10) / 10,
      identity_score: Math.round((sums.identity_score / count) * 10) / 10,
      accessibility_score: Math.round((sums.accessibility_score / count) * 10) / 10,
    };
  }, []);

  useEffect(() => {
    if (stadiumA && stadiumB) {
      setLoading(true);
      Promise.all([fetchAverages(stadiumA.id), fetchAverages(stadiumB.id)]).then(([a, b]) => {
        setAveragesA(a);
        setAveragesB(b);
        setLoading(false);
      });
    }
  }, [stadiumA, stadiumB, fetchAverages]);

  const renderStadiumSelector = (label: string, stadium: Stadium | null, target: 'A' | 'B') => {
    const image = stadium ? getStadiumImage(stadium.id) : null;
    return (
      <TouchableOpacity
        style={styles.selectorCard}
        onPress={() => setPickerTarget(target)}
        activeOpacity={0.7}
      >
        {image ? (
          <Image source={image} style={styles.selectorImage} contentFit="cover" />
        ) : (
          <View style={[styles.selectorImage, styles.selectorPlaceholderImage]}>
            <Ionicons name="baseball-outline" size={28} color={Colors.text.tertiary} />
          </View>
        )}
        <Text style={styles.selectorName} numberOfLines={2}>
          {stadium?.name ?? 'Select Stadium'}
        </Text>
        {stadium && (
          <Text style={styles.selectorTeam} numberOfLines={1}>
            {stadium.team}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderComparisonBar = (
    cat: typeof RATING_CATEGORIES[number],
    valA: number | null,
    valB: number | null,
  ) => {
    const maxScore = 5;
    const widthA = valA != null ? (valA / maxScore) * 100 : 0;
    const widthB = valB != null ? (valB / maxScore) * 100 : 0;
    const aWins = valA != null && valB != null && valA > valB;
    const bWins = valA != null && valB != null && valB > valA;

    return (
      <View key={cat.key} style={styles.categoryRow}>
        <View style={styles.categoryHeader}>
          <Ionicons name={cat.icon} size={16} color={Colors.primary.navy} />
          <Text style={styles.categoryLabel}>{cat.label}</Text>
        </View>
        <View style={styles.barsContainer}>
          <View style={styles.barRow}>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFillA,
                  { width: `${widthA}%` },
                  aWins && styles.barWinner,
                ]}
              />
            </View>
            <Text style={[styles.barScore, aWins && styles.scoreWinner]}>
              {valA != null ? valA.toFixed(1) : '--'}
            </Text>
          </View>
          <View style={styles.barRow}>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFillB,
                  { width: `${widthB}%` },
                  bWins && styles.barWinner,
                ]}
              />
            </View>
            <Text style={[styles.barScore, bWins && styles.scoreWinner]}>
              {valB != null ? valB.toFixed(1) : '--'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderFactsComparison = () => {
    if (!stadiumA || !stadiumB) return null;

    const facts = [
      { label: 'Year Opened', a: String(stadiumA.yearOpened), b: String(stadiumB.yearOpened) },
      {
        label: 'Capacity',
        a: stadiumA.capacity.toLocaleString(),
        b: stadiumB.capacity.toLocaleString(),
      },
      { label: 'Roof Type', a: stadiumA.roofType, b: stadiumB.roofType },
      { label: 'Surface', a: stadiumA.surfaceType, b: stadiumB.surfaceType },
    ];

    return (
      <Card style={styles.factsCard}>
        <Text style={styles.factsTitle}>Stadium Facts</Text>
        {facts.map((fact) => (
          <View key={fact.label} style={styles.factRow}>
            <Text style={styles.factValue}>{fact.a}</Text>
            <Text style={styles.factLabel}>{fact.label}</Text>
            <Text style={styles.factValue}>{fact.b}</Text>
          </View>
        ))}
      </Card>
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
          <Text style={styles.title}>Compare Stadiums</Text>
        </View>

        {/* Stadium selectors */}
        <View style={styles.selectorsRow}>
          {renderStadiumSelector('Stadium A', stadiumA, 'A')}
          <View style={styles.vsCircle}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          {renderStadiumSelector('Stadium B', stadiumB, 'B')}
        </View>

        {/* Color legend */}
        {stadiumA && stadiumB && (
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.accent.coral }]} />
              <Text style={styles.legendLabel} numberOfLines={1}>
                {stadiumA.name}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.primary.navy }]} />
              <Text style={styles.legendLabel} numberOfLines={1}>
                {stadiumB.name}
              </Text>
            </View>
          </View>
        )}

        {/* Category comparison */}
        {stadiumA && stadiumB && (
          <Card style={styles.comparisonCard}>
            <Text style={styles.comparisonTitle}>Community Ratings</Text>
            {loading ? (
              <ActivityIndicator
                size="large"
                color={Colors.accent.coral}
                style={{ paddingVertical: Spacing.xl }}
              />
            ) : !averagesA && !averagesB ? (
              <Text style={styles.noRatings}>No ratings yet for either stadium</Text>
            ) : (
              RATING_CATEGORIES.map((cat) =>
                renderComparisonBar(
                  cat,
                  averagesA ? averagesA[cat.key as keyof CategoryAverages] : null,
                  averagesB ? averagesB[cat.key as keyof CategoryAverages] : null,
                ),
              )
            )}
          </Card>
        )}

        {/* Facts comparison */}
        {renderFactsComparison()}

        {/* Prompt to select stadiums */}
        {(!stadiumA || !stadiumB) && (
          <Card style={styles.promptCard}>
            <Ionicons name="swap-horizontal" size={40} color={Colors.text.tertiary} />
            <Text style={styles.promptText}>
              Select two stadiums above to compare them side by side
            </Text>
          </Card>
        )}
      </ScrollView>

      <StadiumPicker
        visible={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        onSelect={(stadium) => {
          if (pickerTarget === 'A') setStadiumA(stadium);
          else setStadiumB(stadium);
        }}
        excludeId={pickerTarget === 'A' ? stadiumB?.id : stadiumA?.id}
      />
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
    paddingBottom: Spacing.md,
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
  selectorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  selectorCard: {
    flex: 1,
    backgroundColor: Colors.background.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.md,
  },
  selectorImage: {
    width: '100%',
    height: 80,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  selectorPlaceholderImage: {
    backgroundColor: Colors.background.warmGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorName: {
    ...Typography.captionBold,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  selectorTeam: {
    ...Typography.small,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 2,
  },
  vsCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent.coral,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  vsText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.extraBold,
    color: Colors.text.inverse,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    ...Typography.small,
    color: Colors.text.secondary,
    flex: 1,
  },
  comparisonCard: {
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
  },
  comparisonTitle: {
    ...Typography.h4,
    color: Colors.primary.navy,
    marginBottom: Spacing.base,
  },
  categoryRow: {
    marginBottom: Spacing.base,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  categoryLabel: {
    ...Typography.captionBold,
    color: Colors.primary.navy,
  },
  barsContainer: {
    gap: Spacing.xs,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  barTrack: {
    flex: 1,
    height: 14,
    backgroundColor: Colors.background.warmGrey,
    borderRadius: 7,
    overflow: 'hidden',
  },
  barFillA: {
    height: '100%',
    backgroundColor: Colors.accent.coralLight,
    borderRadius: 7,
  },
  barFillB: {
    height: '100%',
    backgroundColor: Colors.primary.navyLight,
    borderRadius: 7,
  },
  barWinner: {
    opacity: 1,
  },
  barScore: {
    width: 32,
    ...Typography.smallBold,
    color: Colors.text.secondary,
    textAlign: 'right',
  },
  scoreWinner: {
    color: Colors.primary.navy,
    fontWeight: FontWeight.extraBold,
  },
  noRatings: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  factsCard: {
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
  },
  factsTitle: {
    ...Typography.h4,
    color: Colors.primary.navy,
    marginBottom: Spacing.base,
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.warmGrey,
  },
  factLabel: {
    ...Typography.smallBold,
    color: Colors.text.tertiary,
    textAlign: 'center',
    flex: 1,
  },
  factValue: {
    ...Typography.captionBold,
    color: Colors.text.primary,
    width: 100,
    textAlign: 'center',
  },
  promptCard: {
    marginHorizontal: Layout.screenPadding,
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    gap: Spacing.md,
  },
  promptText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    maxWidth: 240,
  },
});
