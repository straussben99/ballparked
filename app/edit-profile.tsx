import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, Alert, ActivityIndicator, Modal, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { Typography, FontWeight } from '@/constants/typography';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { MLB_TEAMS } from '@/data/teams';
import { STADIUMS } from '@/data/stadiums';
import { Avatar } from '@/components/ui/Avatar';

export default function EditProfileScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [favoriteTeam, setFavoriteTeam] = useState(profile?.favorite_team || '');
  const [favoritePark, setFavoritePark] = useState(profile?.favorite_park || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [showTeamPicker, setShowTeamPicker] = useState(false);
  const [showParkPicker, setShowParkPicker] = useState(false);

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const ext = asset.uri.split('.').pop() || 'jpg';
    const filePath = `${user!.id}/avatar.${ext}`;

    const response = await fetch(asset.uri);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, arrayBuffer, {
        contentType: `image/${ext}`,
        upsert: true,
      });

    if (uploadError) {
      Alert.alert('Upload failed', uploadError.message);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    setAvatarUrl(urlData.publicUrl + '?t=' + Date.now());
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Display name is required');
      return;
    }
    setSaving(true);
    await updateProfile({
      display_name: displayName.trim(),
      bio: bio.trim() || null,
      favorite_team: favoriteTeam || null,
      favorite_park: favoritePark || null,
      avatar_url: avatarUrl || null,
    });
    setSaving(false);
    router.back();
  };

  const stadiumNames = STADIUMS.map((s) => ({ id: s.id, name: s.name })).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Avatar */}
        <TouchableOpacity style={styles.avatarSection} onPress={handlePickAvatar}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Avatar name={displayName || 'U'} size={90} />
          )}
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </TouchableOpacity>

        {/* Display Name */}
        <Text style={styles.label}>Display Name</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Your name"
          placeholderTextColor={Colors.text.tertiary}
        />

        {/* Bio */}
        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          value={bio}
          onChangeText={(t) => setBio(t.slice(0, 160))}
          placeholder="A few words about you"
          placeholderTextColor={Colors.text.tertiary}
          multiline
          maxLength={160}
        />
        <Text style={styles.charCount}>{bio.length}/160</Text>

        {/* Favorite Team */}
        <Text style={styles.label}>Favorite Team</Text>
        <TouchableOpacity style={styles.pickerButton} onPress={() => setShowTeamPicker(true)}>
          <Text style={favoriteTeam ? styles.pickerValue : styles.pickerPlaceholder}>
            {favoriteTeam || 'Select a team'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={Colors.text.tertiary} />
        </TouchableOpacity>

        {/* Favorite Park */}
        <Text style={styles.label}>Favorite Park</Text>
        <TouchableOpacity style={styles.pickerButton} onPress={() => setShowParkPicker(true)}>
          <Text style={favoritePark ? styles.pickerValue : styles.pickerPlaceholder}>
            {favoritePark ? stadiumNames.find((s) => s.id === favoritePark)?.name || favoritePark : 'Select a stadium'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={Colors.text.tertiary} />
        </TouchableOpacity>

        {/* Save */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={Colors.text.inverse} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Team Picker Modal */}
      <Modal visible={showTeamPicker} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Favorite Team</Text>
            <TouchableOpacity onPress={() => setShowTeamPicker(false)}>
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={MLB_TEAMS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.modalItem, favoriteTeam === item && styles.modalItemSelected]}
                onPress={() => { setFavoriteTeam(item); setShowTeamPicker(false); }}
              >
                <Text style={[styles.modalItemText, favoriteTeam === item && styles.modalItemTextSelected]}>
                  {item}
                </Text>
                {favoriteTeam === item && <Ionicons name="checkmark" size={20} color={Colors.accent.coral} />}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* Park Picker Modal */}
      <Modal visible={showParkPicker} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Favorite Park</Text>
            <TouchableOpacity onPress={() => setShowParkPicker(false)}>
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={stadiumNames}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.modalItem, favoritePark === item.id && styles.modalItemSelected]}
                onPress={() => { setFavoritePark(item.id); setShowParkPicker(false); }}
              >
                <Text style={[styles.modalItemText, favoritePark === item.id && styles.modalItemTextSelected]}>
                  {item.name}
                </Text>
                {favoritePark === item.id && <Ionicons name="checkmark" size={20} color={Colors.accent.coral} />}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.cream },
  scroll: { padding: Layout.screenPadding, paddingBottom: 60 },
  avatarSection: { alignItems: 'center', marginBottom: Spacing.xl },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
  changePhotoText: { ...Typography.caption, color: Colors.accent.coral, marginTop: Spacing.sm },
  label: { ...Typography.captionBold, color: Colors.text.primary, marginBottom: Spacing.xs, marginTop: Spacing.base },
  input: {
    backgroundColor: Colors.background.white, borderWidth: 1, borderColor: Colors.card.border,
    borderRadius: BorderRadius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.base,
    ...Typography.body, color: Colors.text.primary,
  },
  bioInput: { minHeight: 80, textAlignVertical: 'top' },
  charCount: { ...Typography.tiny, color: Colors.text.tertiary, textAlign: 'right', marginTop: 4 },
  pickerButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.background.white, borderWidth: 1, borderColor: Colors.card.border,
    borderRadius: BorderRadius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.base,
  },
  pickerValue: { ...Typography.body, color: Colors.text.primary },
  pickerPlaceholder: { ...Typography.body, color: Colors.text.tertiary },
  saveButton: {
    backgroundColor: Colors.accent.coral, borderRadius: BorderRadius.md,
    paddingVertical: Spacing.base, alignItems: 'center', marginTop: Spacing['2xl'],
  },
  saveText: { ...Typography.bodyBold, color: Colors.text.inverse },
  modalContainer: { flex: 1, backgroundColor: Colors.background.cream },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Layout.screenPadding, paddingVertical: Spacing.base,
    borderBottomWidth: 1, borderBottomColor: Colors.card.border,
  },
  modalTitle: { ...Typography.h4, color: Colors.primary.navy },
  modalItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.base, paddingHorizontal: Layout.screenPadding,
    borderBottomWidth: 1, borderBottomColor: Colors.card.border,
  },
  modalItemSelected: { backgroundColor: 'rgba(255,107,91,0.08)' },
  modalItemText: { ...Typography.body, color: Colors.text.primary },
  modalItemTextSelected: { color: Colors.accent.coral, fontWeight: FontWeight.semiBold },
});
