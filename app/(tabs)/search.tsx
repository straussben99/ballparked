import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
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
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSocialStore } from '@/stores/useSocialStore';

interface UserStat {
  user_id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  stadiums_visited: number;
  avg_rating: number;
  followers_count: number;
  following_count: number;
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<UserStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currentUser = useAuthStore((s) => s.user);
  const followingIds = useSocialStore((s) => s.followingIds);
  const followUser = useSocialStore((s) => s.followUser);
  const unfollowUser = useSocialStore((s) => s.unfollowUser);
  const isFollowing = useSocialStore((s) => s.isFollowing);

  const fetchSuggestedUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .neq('user_id', currentUser?.id ?? '')
        .limit(20);

      if (error) throw error;
      setUsers((data as UserStat[]) ?? []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [currentUser?.id]);

  const searchUsers = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      fetchSuggestedUsers();
      return;
    }
    setIsLoading(true);
    try {
      const pattern = `%${searchQuery}%`;
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .neq('user_id', currentUser?.id ?? '')
        .or(`display_name.ilike.${pattern},username.ilike.${pattern}`)
        .limit(20);

      if (error) throw error;
      setUsers((data as UserStat[]) ?? []);
    } catch (err) {
      console.error('Failed to search users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id, fetchSuggestedUsers]);

  useEffect(() => {
    fetchSuggestedUsers();
  }, [fetchSuggestedUsers]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchUsers(query);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, searchUsers]);

  const handleRefresh = () => {
    setRefreshing(true);
    if (query.trim()) {
      searchUsers(query);
    } else {
      fetchSuggestedUsers();
    }
  };

  const handleToggleFollow = (userId: string) => {
    if (!currentUser) return;
    if (isFollowing(userId)) {
      unfollowUser(currentUser.id, userId);
    } else {
      followUser(currentUser.id, userId);
    }
  };

  function renderUserCard({ item }: { item: UserStat }) {
    const following = isFollowing(item.user_id);
    return (
      <Card style={styles.userCard}>
        <View style={styles.userRow}>
          <Avatar name={item.display_name} uri={item.avatar_url ?? undefined} size={48} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.display_name}</Text>
            <Text style={styles.userHandle}>@{item.username}</Text>
            {item.bio ? (
              <Text style={styles.userBio} numberOfLines={1}>{item.bio}</Text>
            ) : null}
            <View style={styles.progressRow}>
              <Text style={styles.visitedLabel}>{item.stadiums_visited}/30 visited</Text>
              <View style={styles.progressWrap}>
                <ProgressBar progress={item.stadiums_visited / 30} height={6} />
              </View>
            </View>
          </View>
          <Button
            title={following ? 'Following' : 'Follow'}
            onPress={() => handleToggleFollow(item.user_id)}
            variant={following ? 'outline' : 'primary'}
            size="sm"
          />
        </View>
      </Card>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
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
        <Text style={styles.sectionTitle}>
          {query.trim() ? 'Search Results' : 'Suggested Fans'}
        </Text>
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent.coral} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.user_id}
          renderItem={renderUserCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={Colors.text.tertiary} />
              <Text style={styles.emptyText}>
                {query.trim() ? 'No fans found' : 'No users yet'}
              </Text>
            </View>
          }
        />
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: Spacing['2xl'],
  },
  emptyText: {
    ...Typography.body,
    color: Colors.text.tertiary,
    marginTop: Spacing.md,
  },
});
