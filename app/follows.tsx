import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, Layout } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSocialStore } from '@/stores/useSocialStore';

interface UserRow {
  user_id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  bio?: string | null;
}

export default function FollowsScreen() {
  const params = useLocalSearchParams<{ type?: string; userId?: string }>();
  const type = (params.type === 'followers' ? 'followers' : 'following') as
    | 'followers'
    | 'following';
  const currentUser = useAuthStore((s) => s.user);
  const targetUserId = params.userId ?? currentUser?.id ?? '';

  const router = useRouter();
  const followingIds = useSocialStore((s) => s.followingIds);
  const followUser = useSocialStore((s) => s.followUser);
  const unfollowUser = useSocialStore((s) => s.unfollowUser);
  const isFollowing = useSocialStore((s) => s.isFollowing);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!targetUserId) return;
    try {
      let ids: string[] = [];

      if (type === 'followers') {
        // People who follow targetUserId
        const { data, error } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', targetUserId);
        if (error) throw error;
        ids = (data ?? []).map((r: { follower_id: string }) => r.follower_id);
      } else {
        // People targetUserId follows
        const { data, error } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', targetUserId);
        if (error) throw error;
        ids = (data ?? []).map(
          (r: { following_id: string }) => r.following_id
        );
      }

      if (ids.length === 0) {
        setUsers([]);
        return;
      }

      // user_stats view doesn't include bio; fetch bios from profiles separately.
      const [statsRes, profilesRes] = await Promise.all([
        supabase
          .from('user_stats')
          .select('user_id, display_name, username, avatar_url')
          .in('user_id', ids),
        supabase.from('profiles').select('id, bio').in('id', ids),
      ]);

      if (statsRes.error) throw statsRes.error;
      if (profilesRes.error) throw profilesRes.error;

      const bioById = new Map<string, string | null>(
        (profilesRes.data ?? []).map((p: { id: string; bio: string | null }) => [
          p.id,
          p.bio,
        ])
      );

      const merged: UserRow[] = (statsRes.data ?? []).map((u: any) => ({
        user_id: u.user_id,
        display_name: u.display_name,
        username: u.username,
        avatar_url: u.avatar_url,
        bio: bioById.get(u.user_id) ?? null,
      }));

      setUsers(merged);
    } catch (err) {
      console.error('Failed to fetch follows:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [targetUserId, type]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleToggleFollow = (userId: string) => {
    if (!currentUser) return;
    if (isFollowing(userId)) {
      unfollowUser(currentUser.id, userId);
    } else {
      followUser(currentUser.id, userId);
    }
  };

  const renderItem = ({ item }: { item: UserRow }) => {
    const following = isFollowing(item.user_id);
    const isSelf = item.user_id === currentUser?.id;

    const navigateToProfile = () => {
      if (isSelf) return; // Tapping yourself does nothing here
      router.push({ pathname: '/user/[userId]', params: { userId: item.user_id } } as any);
    };

    return (
      <Card style={styles.userCard}>
        <View style={styles.userRow}>
          <Pressable onPress={navigateToProfile} style={styles.userTappable}>
            <Avatar
              name={item.display_name}
              uri={item.avatar_url ?? undefined}
              size={48}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.display_name}</Text>
              <Text style={styles.userHandle}>@{item.username}</Text>
              {item.bio ? (
                <Text style={styles.userBio} numberOfLines={1}>
                  {item.bio}
                </Text>
              ) : null}
            </View>
          </Pressable>
          {!isSelf && (
            <Button
              title={following ? 'Following' : 'Follow'}
              onPress={() => handleToggleFollow(item.user_id)}
              variant={following ? 'outline' : 'primary'}
              size="sm"
            />
          )}
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: type === 'followers' ? 'Followers' : 'Following',
        }}
      />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent.coral} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.user_id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="people-outline"
                size={48}
                color={Colors.text.tertiary}
              />
              <Text style={styles.emptyText}>
                {type === 'followers'
                  ? 'No followers yet'
                  : 'Not following anyone yet'}
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
  listContent: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
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
  userTappable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
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
