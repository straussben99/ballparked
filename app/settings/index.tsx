import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { Shadows } from '@/constants/shadows';
import { useAuthStore } from '@/stores/useAuthStore';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface SettingsRowProps {
  icon: IoniconsName;
  label: string;
  onPress: () => void;
  color?: string;
  showChevron?: boolean;
}

function SettingsRow({ icon, label, onPress, color, showChevron = true }: SettingsRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={color ?? Colors.text.secondary} />
        <Text style={[styles.rowLabel, color ? { color } : undefined]}>{label}</Text>
      </View>
      {showChevron && (
        <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Account */}
      <View style={styles.section}>
        <SettingsRow
          icon="person-outline"
          label="Edit Profile"
          onPress={() => router.push('/settings/edit-profile')}
        />
      </View>

      {/* Legal & Info */}
      <View style={styles.section}>
        <SettingsRow
          icon="shield-outline"
          label="Privacy Policy"
          onPress={() => router.push('/settings/privacy')}
        />
        <SettingsRow
          icon="document-text-outline"
          label="Terms of Use"
          onPress={() => router.push('/settings/terms')}
        />
        <SettingsRow
          icon="heart-outline"
          label="Credits"
          onPress={() => router.push('/settings/credits')}
        />
        <SettingsRow
          icon="information-circle-outline"
          label="About"
          onPress={() =>
            Alert.alert('BallParked', `Version ${appVersion}\n\nRate, track, and share your MLB stadium experiences.`)
          }
          showChevron={false}
        />
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
        <SettingsRow
          icon="log-out-outline"
          label="Sign Out"
          onPress={handleSignOut}
          color={Colors.semantic.error}
          showChevron={false}
        />
      </View>

      {/* Danger Zone */}
      <View style={[styles.section, { marginTop: Spacing.md }]}>
        <SettingsRow
          icon="trash-outline"
          label="Delete Account"
          onPress={() => router.push('/settings/delete-account')}
          color={Colors.semantic.error}
        />
      </View>

      <Text style={styles.version}>BallParked v{appVersion}</Text>
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
    paddingBottom: 40,
  },
  section: {
    backgroundColor: Colors.background.white,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  rowLabel: {
    ...Typography.body,
    color: Colors.text.primary,
  },
  version: {
    ...Typography.small,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
