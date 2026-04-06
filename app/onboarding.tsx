import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { Typography, FontWeight } from '@/constants/typography';
import { useAuthStore } from '@/stores/useAuthStore';
import { STADIUMS } from '@/data/stadiums';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Derive unique teams from STADIUMS data, sorted by full name
const TEAMS = STADIUMS.map((s) => ({
  name: s.team,
  abbr: s.teamAbbr,
  division: s.division,
})).sort((a, b) => a.name.localeCompare(b.name));

const TOTAL_STEPS = 3;

export default function OnboardingScreen() {
  const router = useRouter();
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [step, setStep] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinish = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateProfile({
        favorite_team: selectedTeam || null,
        has_onboarded: true,
      } as any);
      router.replace('/');
    } catch {
      setIsSubmitting(false);
    }
  };

  // --- Step 1: Welcome ---
  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeEmoji}>{'\u26BE'}</Text>
          <Text style={styles.welcomeTitle}>Welcome to{'\n'}BallParked!</Text>
          <Text style={styles.welcomeSubtitle}>
            Track your stadium journey, rate every park, and connect with fans.
          </Text>
          <View style={styles.featureList}>
            <FeatureRow icon={'\uD83C\uDFDF\uFE0F'} text="Track every stadium you visit" />
            <FeatureRow icon={'\u2B50'} text="Rate and review each ballpark" />
            <FeatureRow icon={'\uD83D\uDC65'} text="See where your friends have been" />
          </View>
        </View>
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setStep(2)}>
            <Text style={styles.primaryButtonText}>Let's get started</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- Step 2: Pick Your Favorite Team ---
  if (step === 2) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topSection}>
          <ProgressDots current={2} total={TOTAL_STEPS} />
          <Text style={styles.heading}>What's your team?</Text>
          <Text style={styles.subheading}>Pick your favorite. You can always change this later.</Text>
        </View>
        <ScrollView
          contentContainerStyle={styles.teamGrid}
          showsVerticalScrollIndicator={false}
        >
          {TEAMS.map((team) => {
            const isSelected = selectedTeam === team.name;
            return (
              <TouchableOpacity
                key={team.abbr}
                style={[styles.teamChip, isSelected && styles.teamChipSelected]}
                onPress={() => setSelectedTeam(isSelected ? '' : team.name)}
                activeOpacity={0.7}
              >
                <Text style={[styles.teamAbbr, isSelected && styles.teamAbbrSelected]}>
                  {team.abbr}
                </Text>
                <Text
                  style={[styles.teamName, isSelected && styles.teamNameSelected]}
                  numberOfLines={1}
                >
                  {team.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, { flex: 1 }]}
            onPress={() => setStep(3)}
          >
            <Text style={styles.primaryButtonText}>
              {selectedTeam ? 'Next' : 'Skip'}
            </Text>
          </TouchableOpacity>
        </View>
        {!selectedTeam && (
          <View style={styles.skipHintContainer}>
            <Text style={styles.skipHint}>No worries -- you can pick a team later</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // --- Step 3: All set ---
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.confirmationContent}>
        <Text style={styles.confirmEmoji}>{'\uD83C\uDF89'}</Text>
        <Text style={styles.confirmTitle}>You're all set!</Text>
        {selectedTeam ? (
          <View style={styles.teamBadge}>
            <Text style={styles.teamBadgeText}>
              {TEAMS.find((t) => t.name === selectedTeam)?.abbr ?? ''}
            </Text>
          </View>
        ) : null}
        {selectedTeam ? (
          <Text style={styles.confirmDetail}>Go {selectedTeam}!</Text>
        ) : null}
        <Text style={styles.confirmSubtext}>
          Start exploring and rating stadiums to build your ballpark profile.
        </Text>
      </View>
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, { flex: 1 }, isSubmitting && styles.primaryButtonDisabled]}
          onPress={handleFinish}
          disabled={isSubmitting}
        >
          <Text style={styles.primaryButtonText}>
            {isSubmitting ? 'Setting up...' : 'Get Started'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- Sub-components ---

function FeatureRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.progressContainer}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            styles.progressDot,
            i + 1 === current && styles.progressDotActive,
            i + 1 < current && styles.progressDotDone,
          ]}
        />
      ))}
    </View>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.cream,
  },

  // Welcome (Step 1)
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding + 12,
  },
  welcomeEmoji: {
    fontSize: 72,
    marginBottom: Spacing['2xl'],
  },
  welcomeTitle: {
    ...Typography.h1,
    color: Colors.primary.navy,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 44,
  },
  welcomeSubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing['3xl'],
  },
  featureList: {
    alignSelf: 'stretch',
    gap: Spacing.base,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  featureIcon: {
    fontSize: 22,
    marginRight: Spacing.md,
  },
  featureText: {
    ...Typography.body,
    color: Colors.text.primary,
    flex: 1,
  },

  // Progress dots
  progressContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.semantic.unvisited,
  },
  progressDotActive: {
    width: 24,
    backgroundColor: Colors.accent.coral,
    borderRadius: 4,
  },
  progressDotDone: {
    backgroundColor: Colors.accent.coralLight,
  },

  // Top section (Steps 2+)
  topSection: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.lg,
  },
  heading: {
    ...Typography.h2,
    color: Colors.primary.navy,
    marginBottom: Spacing.sm,
  },
  subheading: {
    ...Typography.body,
    color: Colors.text.secondary,
  },

  // Team grid (Step 2)
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.sm,
    paddingBottom: 140,
  },
  teamChip: {
    width: (SCREEN_WIDTH - Layout.screenPadding * 2 - Spacing.sm * 2) / 3,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.white,
    borderWidth: 1.5,
    borderColor: Colors.card.border,
    alignItems: 'center',
  },
  teamChipSelected: {
    borderColor: Colors.accent.coral,
    backgroundColor: 'rgba(255,107,91,0.08)',
  },
  teamAbbr: {
    ...Typography.h4,
    color: Colors.primary.navy,
    marginBottom: 2,
  },
  teamAbbrSelected: {
    color: Colors.accent.coral,
  },
  teamName: {
    ...Typography.tiny,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  teamNameSelected: {
    color: Colors.accent.coralDark,
  },

  // Skip hint
  skipHintContainer: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  skipHint: {
    ...Typography.small,
    color: Colors.text.tertiary,
  },

  // Confirmation (Step 3)
  confirmationContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding + 12,
  },
  confirmEmoji: {
    fontSize: 64,
    marginBottom: Spacing.xl,
  },
  confirmTitle: {
    ...Typography.h1,
    color: Colors.primary.navy,
    marginBottom: Spacing.lg,
  },
  teamBadge: {
    backgroundColor: Colors.accent.coral,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  teamBadgeText: {
    ...Typography.h4,
    color: Colors.text.inverse,
  },
  confirmDetail: {
    ...Typography.bodyBold,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  confirmSubtext: {
    ...Typography.body,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 24,
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['2xl'],
    backgroundColor: Colors.background.cream,
    borderTopWidth: 1,
    borderTopColor: Colors.card.border,
  },
  primaryButton: {
    backgroundColor: Colors.accent.coral,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    flex: 1,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    ...Typography.bodyBold,
    color: Colors.text.inverse,
  },
  backButton: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.card.border,
    alignItems: 'center',
  },
  backButtonText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
});
