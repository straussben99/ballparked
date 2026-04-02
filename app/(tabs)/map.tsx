import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { FontSize, FontWeight, Typography } from '@/constants/typography';
import { Shadows } from '@/constants/shadows';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useStadiumStore } from '@/stores/useStadiumStore';
import { STADIUMS, getAllDivisions, getStadiumsByDivision } from '@/data/stadiums';
import type { Division } from '@/types/stadium';

export default function MapScreen() {
  const router = useRouter();
  const { isVisited, visitedCount } = useStadiumStore();
  const visited = visitedCount();
  const total = STADIUMS.length;
  const remaining = total - visited;
  const pct = total > 0 ? Math.round((visited / total) * 100) : 0;

  const divisions = getAllDivisions();

  const handleStadiumPress = (stadiumId: string) => {
    router.push(`/explore/${stadiumId}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{'\uD83D\uDCCD'} Stadium Map</Text>
          <Text style={styles.subtitle}>{visited} / {total} Stadiums Visited</Text>
        </View>

        <View style={styles.progressContainer}>
          <ProgressBar progress={visited / total} height={10} />
        </View>

        {divisions.map((division) => {
          const divisionStadiums = getStadiumsByDivision(division as Division);
          const divColor = Colors.division[division] ?? Colors.primary.navy;

          return (
            <View key={division} style={styles.divisionSection}>
              <View style={[styles.divisionHeader, { borderLeftColor: divColor }]}>
                <Text style={[styles.divisionTitle, { color: divColor }]}>{division}</Text>
              </View>
              <View style={styles.pinsRow}>
                {divisionStadiums.map((stadium) => {
                  const wasVisited = isVisited(stadium.id);
                  return (
                    <TouchableOpacity
                      key={stadium.id}
                      style={[
                        styles.pin,
                        {
                          backgroundColor: wasVisited
                            ? Colors.semantic.visited
                            : Colors.semantic.unvisited,
                        },
                      ]}
                      onPress={() => handleStadiumPress(stadium.id)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.pinText,
                          { color: wasVisited ? Colors.text.inverse : Colors.text.primary },
                        ]}
                      >
                        {stadium.teamAbbr}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}

        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{visited}</Text>
              <Text style={styles.statLabel}>Visited</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{remaining}</Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{pct}%</Text>
              <Text style={styles.statLabel}>Completion</Text>
            </View>
          </View>
        </Card>
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
  progressContainer: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
  },
  divisionSection: {
    marginBottom: Spacing.lg,
  },
  divisionHeader: {
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.sm,
    borderLeftWidth: 4,
    marginLeft: Layout.screenPadding,
    marginBottom: Spacing.sm,
  },
  divisionTitle: {
    ...Typography.captionBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pinsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.sm,
  },
  pin: {
    width: Layout.mapPinSize * 1.8,
    height: Layout.mapPinSize * 1.8,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  pinText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  statsCard: {
    marginHorizontal: Layout.screenPadding,
    marginTop: Spacing.md,
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
    ...Typography.h3,
    color: Colors.primary.navy,
  },
  statLabel: {
    ...Typography.small,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.card.border,
  },
});
