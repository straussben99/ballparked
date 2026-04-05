import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { Shadows } from '@/constants/shadows';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { getStadiumById } from '@/data/stadiums';

export function WishlistSection() {
  const router = useRouter();
  const wishlistIds = useWishlistStore((s) => s.wishlistIds);

  if (wishlistIds.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="heart" size={18} color={Colors.accent.coral} />
        <Text style={styles.title}>Bucket List</Text>
        <Text style={styles.count}>{wishlistIds.length}</Text>
      </View>
      {wishlistIds.map((id) => {
        const stadium = getStadiumById(id);
        if (!stadium) return null;
        return (
          <TouchableOpacity
            key={id}
            style={styles.item}
            onPress={() => router.push((`/explore/${id}`) as any)}
          >
            <View style={styles.itemInfo}>
              <Text style={styles.stadiumName}>{stadium.name}</Text>
              <Text style={styles.teamName}>{stadium.team}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.text.tertiary} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.background.white,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  title: { ...Typography.bodyBold, color: Colors.primary.navy },
  count: { ...Typography.caption, color: Colors.text.tertiary },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  itemInfo: { flex: 1 },
  stadiumName: { ...Typography.bodyBold, color: Colors.text.primary },
  teamName: { ...Typography.small, color: Colors.text.secondary, marginTop: 2 },
});
