import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { FontSize, FontWeight, Typography } from '@/constants/typography';
import { Shadows } from '@/constants/shadows';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useStadiumStore } from '@/stores/useStadiumStore';
import { STADIUMS, getAllDivisions, getStadiumsByDivision } from '@/data/stadiums';

// Conditionally import MapView — fails in Expo Go (needs dev build)
let MapView: any = null;
let Marker: any = null;
let Callout: any = null;
let mapsAvailable = false;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    Callout = Maps.Callout;
    mapsAvailable = true;
  } catch {
    mapsAvailable = false;
  }
}

const US_CENTER = {
  latitude: 39.5,
  longitude: -98.35,
  latitudeDelta: 28,
  longitudeDelta: 50,
};

export default function MapScreen() {
  const router = useRouter();
  const visitedIds = useStadiumStore((s) => s.visitedIds);
  const mapRef = useRef<any>(null);

  const visitedCount = visitedIds.length;
  const total = STADIUMS.length;
  const remaining = total - visitedCount;
  const pct = total > 0 ? Math.round((visitedCount / total) * 100) : 0;

  const handleStadiumPress = (stadiumId: string) => {
    router.push({ pathname: '/explore/[stadiumId]', params: { stadiumId, from: 'map' } } as any);
  };

  const isVisited = (id: string) => visitedIds.includes(id);

  // Fallback for web or Expo Go (no native maps module)
  if (!mapsAvailable) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.fallbackScroll}>
          <View style={styles.header}>
            <Text style={styles.title}>{'\uD83D\uDCCD'} Stadium Map</Text>
            <Text style={styles.subtitle}>{visitedCount} / {total} Stadiums Visited</Text>
          </View>

          <View style={styles.progressContainer}>
            <ProgressBar progress={visitedCount / total} height={10} />
          </View>

          {getAllDivisions().map((division) => {
            const divStadiums = getStadiumsByDivision(division as any);
            const divColor = Colors.division[division] ?? Colors.primary.navy;
            return (
              <View key={division} style={styles.divisionSection}>
                <View style={[styles.divisionHeader, { borderLeftColor: divColor }]}>
                  <Text style={[styles.divisionTitle, { color: divColor }]}>{division}</Text>
                </View>
                <View style={styles.pinsRow}>
                  {divStadiums.map((stadium) => {
                    const visited = isVisited(stadium.id);
                    return (
                      <TouchableOpacity
                        key={stadium.id}
                        style={[
                          styles.fallbackPin,
                          { backgroundColor: visited ? Colors.accent.green : Colors.semantic.unvisited },
                        ]}
                        onPress={() => handleStadiumPress(stadium.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.fallbackPinText, { color: visited ? Colors.text.inverse : Colors.text.primary }]}>
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
            <View style={styles.fallbackStatsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{visitedCount}</Text>
                <Text style={styles.statLabel}>Visited</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{remaining}</Text>
                <Text style={styles.statLabel}>Remaining</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{pct}%</Text>
                <Text style={styles.statLabel}>Complete</Text>
              </View>
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.safeArea}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={US_CENTER}
        showsUserLocation={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {STADIUMS.map((stadium) => {
          const visited = isVisited(stadium.id);
          return (
            <Marker
              key={stadium.id}
              coordinate={stadium.coordinates}
              onCalloutPress={() => handleStadiumPress(stadium.id)}
            >
              <View
                style={[
                  styles.mapPin,
                  {
                    backgroundColor: visited
                      ? Colors.accent.green
                      : Colors.primary.navy,
                    borderColor: visited
                      ? Colors.accent.greenDark
                      : Colors.primary.navyLight,
                  },
                ]}
              >
                <Text style={styles.mapPinText}>{stadium.teamAbbr}</Text>
              </View>
              <Callout tooltip>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{stadium.name}</Text>
                  <Text style={styles.calloutSubtitle}>{stadium.team}</Text>
                  <Text style={styles.calloutCity}>
                    {stadium.city}, {stadium.state}
                  </Text>
                  {visited && (
                    <View style={styles.calloutVisited}>
                      <Ionicons name="checkmark-circle" size={12} color={Colors.accent.green} />
                      <Text style={styles.calloutVisitedText}>Visited</Text>
                    </View>
                  )}
                  <Text style={styles.calloutTap}>Tap for details</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Overlay: Progress Card */}
      <SafeAreaView style={styles.overlayTop} pointerEvents="box-none">
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Ionicons name="baseball-outline" size={20} color={Colors.accent.coral} />
            <Text style={styles.progressTitle}>
              {visitedCount} / {total} Stadiums
            </Text>
            <Text style={styles.progressPct}>{pct}%</Text>
          </View>
          <ProgressBar progress={visitedCount / total} height={6} />
        </View>
      </SafeAreaView>

      {/* Overlay: Stats Bar at bottom */}
      <View style={styles.overlayBottom}>
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{visitedCount}</Text>
            <Text style={styles.statLabel}>Visited</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{remaining}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <TouchableOpacity
              onPress={() => {
                mapRef.current?.animateToRegion(US_CENTER, 500);
              }}
            >
              <Ionicons name="locate-outline" size={24} color={Colors.accent.coral} />
            </TouchableOpacity>
            <Text style={styles.statLabel}>Reset</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.cream,
  },
  map: {
    flex: 1,
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
  fallbackScroll: {
    paddingBottom: Layout.tabBarHeight + Spacing.lg,
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
  fallbackPin: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  fallbackPinText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  statsCard: {
    marginHorizontal: Layout.screenPadding,
    marginTop: Spacing.md,
  },
  fallbackStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Map Pins
  mapPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    ...Shadows.sm,
  },
  mapPinText: {
    fontSize: 9,
    fontWeight: FontWeight.extraBold,
    color: Colors.text.inverse,
    letterSpacing: 0.3,
  },

  // Callout
  callout: {
    backgroundColor: Colors.background.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minWidth: 160,
    ...Shadows.md,
  },
  calloutTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.primary.navy,
  },
  calloutSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  calloutCity: {
    fontSize: FontSize.xs,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  calloutVisited: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
  },
  calloutVisitedText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.accent.green,
  },
  calloutTap: {
    fontSize: FontSize.xs,
    color: Colors.accent.coral,
    fontWeight: FontWeight.semiBold,
    marginTop: Spacing.sm,
  },

  // Overlay: Progress
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  progressCard: {
    marginHorizontal: Layout.screenPadding,
    marginTop: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.md,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  progressTitle: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.primary.navy,
  },
  progressPct: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.accent.coral,
  },

  // Overlay: Stats at bottom
  overlayBottom: {
    position: 'absolute',
    bottom: Layout.tabBarHeight,
    left: 0,
    right: 0,
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.sm,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    ...Shadows.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary.navy,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.card.border,
  },
});
