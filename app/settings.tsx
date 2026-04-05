import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { Shadows } from '@/constants/shadows';
import { useAuthStore } from '@/stores/useAuthStore';

function SettingsRow({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon as any} size={20} color={Colors.text.secondary} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <SettingsRow icon="person-outline" label="Edit Profile" onPress={() => router.push('/edit-profile')} />
          <SettingsRow icon="document-text-outline" label="Terms of Use" onPress={() => router.push('/terms')} />
          <SettingsRow icon="shield-outline" label="Privacy Policy" onPress={() => router.push('/privacy')} />
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutRow} onPress={signOut}>
            <Ionicons name="log-out-outline" size={20} color={Colors.semantic.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>
          BallParked v{Constants.expoConfig?.version || '1.0.0'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.cream },
  scroll: { padding: Layout.screenPadding, paddingBottom: 40 },
  section: {
    backgroundColor: Colors.background.white, borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl, ...Shadows.sm, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: Spacing.base, paddingHorizontal: Spacing.base,
    borderBottomWidth: 1, borderBottomColor: Colors.card.border,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  rowLabel: { ...Typography.body, color: Colors.text.primary },
  signOutRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.base, paddingHorizontal: Spacing.base,
  },
  signOutText: { ...Typography.body, color: Colors.semantic.error },
  version: { ...Typography.small, color: Colors.text.tertiary, textAlign: 'center', marginTop: Spacing.lg },
});
