import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { Typography, FontWeight } from '@/constants/typography';
import { Shadows } from '@/constants/shadows';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';

const DELETED_ITEMS = [
  'Your profile and account data',
  'All your stadium ratings',
  'All your photos',
  'Your followers and following connections',
  'All your comments',
];

export default function DeleteAccountScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const isConfirmed = confirmText === 'DELETE';

  const handleDelete = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: performDeletion,
        },
      ]
    );
  };

  const performDeletion = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      // Delete the user's profile. ON DELETE CASCADE in the database
      // will remove ratings, follows, comments, and other related data.
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (error) {
        Alert.alert('Error', 'Failed to delete account. Please try again.');
        setIsDeleting(false);
        return;
      }

      // Sign out and clear local state
      await signOut();

      // Navigate to auth screen
      router.replace('/auth/login');
    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      {/* Warning Card */}
      <View style={styles.warningCard}>
        <View style={styles.warningHeader}>
          <Ionicons name="warning" size={28} color={Colors.semantic.error} />
          <Text style={styles.warningTitle}>Delete Your Account</Text>
        </View>
        <Text style={styles.warningBody}>
          This action is permanent and cannot be reversed. Once your account is
          deleted, all of your data will be permanently removed from our servers.
        </Text>
      </View>

      {/* What will be deleted */}
      <View style={styles.deletedSection}>
        <Text style={styles.deletedTitle}>What will be deleted:</Text>
        {DELETED_ITEMS.map((item, index) => (
          <View key={index} style={styles.bulletRow}>
            <Ionicons
              name="close-circle"
              size={18}
              color={Colors.semantic.error}
            />
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Permanent warning */}
      <Text style={styles.permanentWarning}>
        This action cannot be undone.
      </Text>

      {/* Confirmation input */}
      <View style={styles.confirmSection}>
        <Text style={styles.confirmLabel}>
          Type <Text style={styles.deleteWord}>DELETE</Text> to confirm
        </Text>
        <TextInput
          style={styles.confirmInput}
          value={confirmText}
          onChangeText={setConfirmText}
          placeholder="Type DELETE here"
          placeholderTextColor={Colors.text.tertiary}
          autoCapitalize="characters"
          autoCorrect={false}
        />
      </View>

      {/* Delete button */}
      <View style={styles.buttonContainer}>
        {isDeleting ? (
          <ActivityIndicator size="large" color={Colors.semantic.error} />
        ) : (
          <TouchableOpacity
            style={[
              styles.deleteButton,
              !isConfirmed && styles.deleteButtonDisabled,
            ]}
            onPress={handleDelete}
            disabled={!isConfirmed}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteButtonText}>Delete My Account</Text>
          </TouchableOpacity>
        )}
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
    paddingBottom: 40,
  },
  warningCard: {
    backgroundColor: '#FFF0F0',
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#FFD4D4',
    marginBottom: Spacing.xl,
    marginTop: Spacing.base,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  warningTitle: {
    ...Typography.h4,
    color: Colors.semantic.error,
  },
  warningBody: {
    ...Typography.body,
    color: '#8B2020',
    lineHeight: 22,
  },
  deletedSection: {
    backgroundColor: Colors.background.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  deletedTitle: {
    ...Typography.bodyBold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  bulletText: {
    ...Typography.body,
    color: Colors.text.secondary,
    flex: 1,
  },
  permanentWarning: {
    ...Typography.bodyBold,
    color: Colors.semantic.error,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  confirmSection: {
    marginBottom: Spacing.xl,
  },
  confirmLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  deleteWord: {
    fontWeight: FontWeight.bold,
    color: Colors.semantic.error,
  },
  confirmInput: {
    backgroundColor: Colors.background.white,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    ...Typography.body,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: Colors.semantic.error,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.4,
  },
  deleteButtonText: {
    ...Typography.bodyBold,
    color: Colors.text.inverse,
  },
});
