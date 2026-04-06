import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { Typography, FontSize, FontWeight } from '@/constants/typography';
import { Shadows } from '@/constants/shadows';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

const BIO_MAX_LENGTH = 150;

export default function EditProfileScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [username, setUsername] = useState(profile?.username ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [favoriteTeam, setFavoriteTeam] = useState(profile?.favorite_team ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? '');
      setUsername(profile.username ?? '');
      setBio(profile.bio ?? '');
      setFavoriteTeam(profile.favorite_team ?? '');
    }
  }, [profile]);

  const handleUsernameChange = (text: string) => {
    setUsername(text.toLowerCase().replace(/\s/g, ''));
  };

  const validate = (): string | null => {
    if (!displayName.trim()) return 'Display name is required.';
    if (!username.trim()) return 'Username is required.';
    if (username !== username.toLowerCase()) return 'Username must be lowercase.';
    if (/\s/.test(username)) return 'Username cannot contain spaces.';
    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await updateProfile({
        display_name: displayName.trim(),
        username: username.trim(),
        bio: bio.trim() || null,
        favorite_team: favoriteTeam.trim() || null,
      });
      Alert.alert('Profile updated!', '', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const userId = profile?.id;
      if (!userId) {
        setError('Not authenticated');
        return;
      }

      setIsUploadingPhoto(true);
      setError(null);

      const asset = result.assets[0];
      const fileExt = asset.uri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const filePath = `avatars/${userId}.${fileExt}`;

      // Read the file as a blob for upload
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      // Upload to Supabase storage (upsert to replace existing)
      const { error: uploadError } = await supabase.storage
        .from('rating-photos')
        .upload(filePath, blob, {
          contentType: asset.mimeType ?? 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('rating-photos')
        .getPublicUrl(filePath);

      // Append cache-buster so the image refreshes
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: publicUrl });
    } catch (e: any) {
      setError(e?.message ?? 'Failed to upload photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View>
            <Avatar
              uri={profile?.avatar_url ?? undefined}
              size={Layout.avatarSize.xl}
              name={displayName || 'U'}
            />
            {isUploadingPhoto && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color={Colors.text.inverse} />
              </View>
            )}
          </View>
          <TouchableOpacity onPress={handleChangePhoto} disabled={isUploadingPhoto} style={styles.changePhotoBtn}>
            <Text style={styles.changePhotoText}>
              {isUploadingPhoto ? 'Uploading...' : 'Change Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          {/* Display Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Display Name *</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your display name"
              placeholderTextColor={Colors.text.tertiary}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* Username */}
          <View style={styles.field}>
            <Text style={styles.label}>Username *</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={handleUsernameChange}
              placeholder="your_username"
              placeholderTextColor={Colors.text.tertiary}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          {/* Bio */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Bio</Text>
              <Text style={styles.charCount}>
                {bio.length}/{BIO_MAX_LENGTH}
              </Text>
            </View>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={(text) => setBio(text.slice(0, BIO_MAX_LENGTH))}
              placeholder="Tell us about yourself..."
              placeholderTextColor={Colors.text.tertiary}
              multiline
              maxLength={BIO_MAX_LENGTH}
              textAlignVertical="top"
            />
          </View>

          {/* Favorite Team */}
          <View style={styles.field}>
            <Text style={styles.label}>Favorite Team</Text>
            <TextInput
              style={styles.input}
              value={favoriteTeam}
              onChangeText={setFavoriteTeam}
              placeholder="e.g., NYY, BOS, LAD"
              placeholderTextColor={Colors.text.tertiary}
              autoCapitalize="characters"
              returnKeyType="done"
            />
          </View>
        </View>

        {/* Error */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          {isSaving ? (
            <ActivityIndicator size="large" color={Colors.accent.coral} />
          ) : (
            <Button
              title="Save Changes"
              onPress={handleSave}
              fullWidth
              size="lg"
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background.cream,
  },
  scroll: {
    padding: Layout.screenPadding,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
    marginTop: Spacing.base,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: Layout.avatarSize.xl / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoBtn: {
    marginTop: Spacing.md,
  },
  changePhotoText: {
    ...Typography.captionBold,
    color: Colors.accent.coral,
  },
  formCard: {
    backgroundColor: Colors.background.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    ...Shadows.sm,
  },
  field: {
    marginBottom: Spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...Typography.captionBold,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  charCount: {
    ...Typography.small,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.background.cream,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    ...Typography.body,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  bioInput: {
    height: 100,
    paddingTop: Spacing.md,
  },
  errorContainer: {
    backgroundColor: '#FFF0F0',
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginTop: Spacing.base,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.semantic.error,
  },
  buttonContainer: {
    marginTop: Spacing.xl,
  },
});
