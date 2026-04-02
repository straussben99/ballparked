import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { FontSize, FontWeight, Typography } from '@/constants/typography';
import { Shadows } from '@/constants/shadows';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';

interface MockUser {
  id: string;
  displayName: string;
  username: string;
  bio: string;
  visited: number;
  favoriteTeam: string;
}

const MOCK_USERS: MockUser[] = [
  { id: '1', displayName: 'Sarah Martinez', username: 'sarahm', bio: 'Chasing all 30! 22 down', visited: 22, favoriteTeam: 'NYY' },
  { id: '2', displayName: 'Jake Thompson', username: 'jaket', bio: 'AL East completionist', visited: 15, favoriteTeam: 'BOS' },
  { id: '3', displayName: 'Mike Rodriguez', username: 'miker', bio: 'Best food at every park', visited: 28, favoriteTeam: 'CHC' },
  { id: '4', displayName: 'Emma Liu', username: 'emmal', bio: 'First-timer exploring MLB', visited: 5, favoriteTeam: 'LAD' },
  { id: '5', displayName: 'Chris Davis', username: 'chrisd', bio: 'Retired ballpark architect', visited: 30, favoriteTeam: 'STL' },
  { id: '6', displayName: 'Aisha Patel', username: 'aishap', bio: 'Weekend warrior', visited: 12, favoriteTeam: 'SF' },
  { id: '7', displayName: 'Ryan O\'Brien', username: 'ryano', bio: 'Beer league all-star', visited: 18, favoriteTeam: 'MIL' },
  { id: '8', displayName: 'Jordan Kim', username: 'jordank', bio: 'Photography at every park', visited: 25, favoriteTeam: 'SD' },
];

function renderUserCard({ item }: { item: MockUser }) {
  return (
    <Card style={styles.userCard}>
      <View style={styles.userRow}>
        <Avatar name={item.displayName} size={48} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.displayName}</Text>
          <Text style={styles.userHandle}>@{item.username}</Text>
          <Text style={styles.userBio} numberOfLines={1}>{item.bio}</Text>
          <View style={styles.progressRow}>
            <Text style={styles.visitedLabel}>{item.visited}/30 visited</Text>
            <View style={styles.progressWrap}>
              <ProgressBar progress={item.visited / 30} height={6} />
            </View>
          </View>
        </View>
        <Button title="Follow" onPress={() => {}} variant="primary" size="sm" />
      </View>
    </Card>
  );
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');

  const filteredUsers = useMemo(() => {
    if (!query.trim()) return MOCK_USERS;
    const lower = query.toLowerCase();
    return MOCK_USERS.filter(
      (u) =>
        u.displayName.toLowerCase().includes(lower) ||
        u.username.toLowerCase().includes(lower)
    );
  }, [query]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>{'\uD83D\uDD0D'} Discover</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color={Colors.text.tertiary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Find fellow fans..."
          placeholderTextColor={Colors.text.tertiary}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Suggested Fans</Text>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUserCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.cream,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    borderRadius: BorderRadius.md,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    ...Shadows.sm,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.text.primary,
    height: '100%',
  },
  sectionHeader: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.primary.navy,
  },
  userCard: {
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.sm,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...Typography.bodyBold,
    color: Colors.text.primary,
  },
  userHandle: {
    ...Typography.small,
    color: Colors.text.tertiary,
  },
  userBio: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: Spacing.xs / 2,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  visitedLabel: {
    ...Typography.tiny,
    color: Colors.text.secondary,
    minWidth: 68,
  },
  progressWrap: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Layout.tabBarHeight + Spacing.lg,
  },
});
