import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { Shadows } from '@/constants/shadows';

function CreditSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function LibraryRow({ name, description }: { name: string; description: string }) {
  return (
    <View style={styles.libraryRow}>
      <Text style={styles.libraryName}>{name}</Text>
      <Text style={styles.libraryDesc}>{description}</Text>
    </View>
  );
}

export default function CreditsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Stadium Photos */}
      <CreditSection title="Stadium Photos">
        <View style={styles.card}>
          <Text style={styles.cardText}>
            Stadium photographs are sourced from Wikimedia Commons and are used under Creative
            Commons licenses. We thank the many photographers who contributed these images to
            the public domain.
          </Text>
        </View>
      </CreditSection>

      {/* Open Source */}
      <CreditSection title="Open Source Libraries">
        <View style={styles.card}>
          <LibraryRow name="React Native" description="Cross-platform mobile framework" />
          <LibraryRow name="Expo" description="React Native development platform" />
          <LibraryRow name="Supabase" description="Backend, auth, and database" />
          <LibraryRow name="Zustand" description="State management" />
          <LibraryRow name="React Native Maps" description="Map rendering" />
          <LibraryRow name="Expo Router" description="File-based navigation" />
        </View>
        <Text style={styles.note}>
          BallParked is built with open source software. We are grateful to the maintainers and
          contributors of these projects.
        </Text>
      </CreditSection>

      {/* MLB Disclaimer */}
      <CreditSection title="MLB Disclaimer">
        <View style={styles.card}>
          <Text style={styles.cardText}>
            BallParked is not affiliated with, endorsed by, or sponsored by Major League Baseball
            (MLB) or any MLB team. All team names, stadium names, and related marks are
            trademarks of their respective owners. Stadium information is compiled from publicly
            available sources for informational purposes.
          </Text>
        </View>
      </CreditSection>

      {/* Built By */}
      <View style={styles.builtBy}>
        <Ionicons name="baseball-outline" size={28} color={Colors.accent.coral} />
        <Text style={styles.builtByText}>Built by Ben Strauss</Text>
        <Text style={styles.builtBySubtext}>with love for the game</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.cream,
  },
  scroll: {
    padding: Layout.screenPadding,
    paddingBottom: 60,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.primary.navy,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.background.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  cardText: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  note: {
    ...Typography.small,
    color: Colors.text.tertiary,
    marginTop: Spacing.sm,
    lineHeight: 18,
  },
  libraryRow: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  libraryName: {
    ...Typography.bodyBold,
    color: Colors.text.primary,
  },
  libraryDesc: {
    ...Typography.small,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  builtBy: {
    alignItems: 'center',
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.xl,
  },
  builtByText: {
    ...Typography.h4,
    color: Colors.primary.navy,
    marginTop: Spacing.md,
  },
  builtBySubtext: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
});
