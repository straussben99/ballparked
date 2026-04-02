import React, { useRef } from 'react';
import {
  View,
  Text,
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
import { STADIUMS } from '@/data/stadiums';

// Conditionally import MapView to avoid web crashes
let MapView: any = null;
let Marker: any = null;
let Callout: any = null;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Callout = Maps.Callout;
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
    router.push(`/explore/${stadiumId}` as any);
  };

  const isVisited = (id: string) => visitedIds.includes(id);

  // Fallback for web
  if (Platform.OS === 'web' || !MapView) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>{'\uD83D\uDCCD'} Stadium Map</Text>
          <Text style={styles.subtitle}>Open on a device for the interactive map</Text>
        </View>
        <View style={styles.webFallback}>
          <Ionicons name="map-outline" size={64} color={Colors.text.tertiary} />
          <Text style={styles.webFallbackText}>
            Interactive map available on iOS & Android
          </Text>
        </View>
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
  webFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.base,
  },
  webFallbackText: {
    fontSize: FontSize.base,
    color: Colors.text.tertiary,
    textAlign: 'center',
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
