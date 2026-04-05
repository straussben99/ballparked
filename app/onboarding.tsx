import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Dimensions, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { Typography, FontWeight } from '@/constants/typography';
import { Shadows } from '@/constants/shadows';
import { useAuthStore } from '@/stores/useAuthStore';
import { useStadiumStore } from '@/stores/useStadiumStore';
import { MLB_TEAMS } from '@/data/teams';
import { STADIUMS } from '@/data/stadiums';
import { getStadiumImage } from '@/data/stadium-images';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_SIZE = (SCREEN_WIDTH - Layout.screenPadding * 2 - Spacing.sm) / 2;

export default function OnboardingScreen() {
  const router = useRouter();
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const setVisitedIds = useStadiumStore((s) => s.setVisitedIds);

  const [step, setStep] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedStadiums, setSelectedStadiums] = useState<string[]>([]);

  const toggleStadium = (id: string) => {
    setSelectedStadiums((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    await updateProfile({
      favorite_team: selectedTeam || null,
      has_onboarded: true,
    } as any);
    if (selectedStadiums.length > 0) {
      setVisitedIds(selectedStadiums);
    }
    router.replace('/');
  };

  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topSection}>
          <Text style={styles.stepLabel}>Step 1 of 3</Text>
          <Text style={styles.heading}>What's your favorite team?</Text>
          <Text style={styles.subheading}>You can always change this later.</Text>
        </View>
        <ScrollView contentContainerStyle={styles.teamGrid} showsVerticalScrollIndicator={false}>
          {MLB_TEAMS.map((team) => (
            <TouchableOpacity
              key={team}
              style={[styles.teamChip, selectedTeam === team && styles.teamChipSelected]}
              onPress={() => setSelectedTeam(team)}
            >
              <Text style={[styles.teamChipText, selectedTeam === team && styles.teamChipTextSelected]}>
                {team}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setStep(2)}>
            <Text style={styles.primaryButtonText}>{selectedTeam ? 'Next' : 'Skip'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 2) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topSection}>
          <Text style={styles.stepLabel}>Step 2 of 3</Text>
          <Text style={styles.heading}>Which stadiums have you been to?</Text>
          <Text style={styles.subheading}>
            Tap to select ({selectedStadiums.length} selected)
          </Text>
        </View>
        <ScrollView contentContainerStyle={styles.stadiumGrid} showsVerticalScrollIndicator={false}>
          {STADIUMS.map((stadium) => {
            const img = getStadiumImage(stadium.id);
            const isSelected = selectedStadiums.includes(stadium.id);
            return (
              <TouchableOpacity
                key={stadium.id}
                style={[styles.stadiumCard, isSelected && styles.stadiumCardSelected]}
                onPress={() => toggleStadium(stadium.id)}
              >
                {img && (
                  <Image source={img} style={styles.stadiumImage} />
                )}
                {isSelected && (
                  <View style={styles.checkOverlay}>
                    <Ionicons name="checkmark-circle" size={28} color={Colors.accent.coral} />
                  </View>
                )}
                <View style={styles.stadiumCardInfo}>
                  <Text style={styles.stadiumCardName} numberOfLines={1}>{stadium.name}</Text>
                  <Text style={styles.stadiumCardTeam} numberOfLines={1}>{stadium.teamAbbr}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(1)}>
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={() => setStep(3)}>
            <Text style={styles.primaryButtonText}>
              {selectedStadiums.length > 0 ? `Next (${selectedStadiums.length})` : 'Skip'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Step 3: Confirmation
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.confirmationContent}>
        <Text style={styles.confirmEmoji}>&#9918;</Text>
        <Text style={styles.confirmTitle}>You're all set!</Text>
        {selectedTeam ? (
          <Text style={styles.confirmDetail}>Favorite team: {selectedTeam}</Text>
        ) : null}
        {selectedStadiums.length > 0 ? (
          <Text style={styles.confirmDetail}>
            Stadiums visited: {selectedStadiums.length} / 30
          </Text>
        ) : null}
        <Text style={styles.confirmSubtext}>
          Start exploring and rating stadiums to build your profile.
        </Text>
      </View>
      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={handleFinish}>
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.cream },
  topSection: { paddingHorizontal: Layout.screenPadding, paddingTop: Spacing['2xl'], paddingBottom: Spacing.lg },
  stepLabel: { ...Typography.caption, color: Colors.accent.coral, marginBottom: Spacing.sm },
  heading: { ...Typography.h2, color: Colors.primary.navy, marginBottom: Spacing.sm },
  subheading: { ...Typography.body, color: Colors.text.secondary },
  teamGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Layout.screenPadding,
    gap: Spacing.sm, paddingBottom: 120,
  },
  teamChip: {
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.base, borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.white, borderWidth: 1.5, borderColor: Colors.card.border,
  },
  teamChipSelected: { borderColor: Colors.accent.coral, backgroundColor: 'rgba(255,107,91,0.08)' },
  teamChipText: { ...Typography.body, color: Colors.text.primary },
  teamChipTextSelected: { color: Colors.accent.coral, fontWeight: FontWeight.semiBold },
  stadiumGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Layout.screenPadding,
    gap: Spacing.sm, paddingBottom: 120,
  },
  stadiumCard: {
    width: CARD_SIZE, borderRadius: BorderRadius.md, overflow: 'hidden',
    backgroundColor: Colors.background.white, ...Shadows.sm,
  },
  stadiumCardSelected: { borderWidth: 2, borderColor: Colors.accent.coral },
  stadiumImage: { width: '100%', height: CARD_SIZE * 0.6 },
  checkOverlay: {
    position: 'absolute', top: 8, right: 8, backgroundColor: Colors.background.white,
    borderRadius: 14, width: 28, height: 28, alignItems: 'center', justifyContent: 'center',
  },
  stadiumCardInfo: { padding: Spacing.sm },
  stadiumCardName: { ...Typography.smallBold, color: Colors.text.primary },
  stadiumCardTeam: { ...Typography.tiny, color: Colors.text.secondary, marginTop: 2 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: Spacing.md,
    paddingHorizontal: Layout.screenPadding, paddingTop: Spacing.md, paddingBottom: Spacing['2xl'],
    backgroundColor: Colors.background.cream, borderTopWidth: 1, borderTopColor: Colors.card.border,
  },
  primaryButton: {
    backgroundColor: Colors.accent.coral, borderRadius: BorderRadius.md,
    paddingVertical: Spacing.base, alignItems: 'center', flex: 1,
  },
  primaryButtonText: { ...Typography.bodyBold, color: Colors.text.inverse },
  secondaryButton: {
    borderRadius: BorderRadius.md, paddingVertical: Spacing.base, paddingHorizontal: Spacing.xl,
    borderWidth: 1, borderColor: Colors.card.border, alignItems: 'center',
  },
  secondaryButtonText: { ...Typography.body, color: Colors.text.secondary },
  confirmationContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Layout.screenPadding },
  confirmEmoji: { fontSize: 64, marginBottom: Spacing.xl },
  confirmTitle: { ...Typography.h1, color: Colors.primary.navy, marginBottom: Spacing.lg },
  confirmDetail: { ...Typography.body, color: Colors.text.secondary, marginBottom: Spacing.sm },
  confirmSubtext: { ...Typography.body, color: Colors.text.tertiary, textAlign: 'center', marginTop: Spacing.lg },
});
