import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, SafeAreaView,
  TouchableOpacity, Pressable, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { Typography, FontWeight } from '@/constants/typography';
import { Shadows } from '@/constants/shadows';
import { Avatar } from '@/components/ui/Avatar';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSocialStore } from '@/stores/useSocialStore';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  stadiums_visited: number;
  avg_rating: number;
}

export default function LeaderboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const followingIds = useSocialStore((s) => s.followingIds);
  const [tab, setTab] = useState<'global' | 'friends'>('global');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_leaderboard', { limit_count: 50 });
    if (!error && data) {
      setEntries(data as LeaderboardEntry[]);
    }
    setLoading(false);
  };

  const displayEntries = tab === 'friends'
    ? entries
        .filter((e) => followingIds.includes(e.user_id) || e.user_id === user?.id)
        .map((e, i) => ({ ...e, rank: i + 1 }))
    : entries;

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  const renderItem = ({ item }: { item: LeaderboardEntry }) => {
    const isMe = item.user_id === user?.id;
    return (
      <Pressable
        style={[styles.row, isMe && styles.rowHighlight]}
        onPress={() =>
          router.push({ pathname: '/user/[userId]', params: { userId: item.user_id } } as any)
        }
      >
        <Text style={styles.rank}>{getRankDisplay(item.rank)}</Text>
        <Avatar name={item.display_name} size={38} uri={item.avatar_url ?? undefined} />
        <View style={styles.info}>
          <Text style={styles.name}>{item.display_name}</Text>
          <Text style={styles.username}>@{item.username}</Text>
        </View>
        <View style={styles.stats}>
          <Text style={styles.visited}>{item.stadiums_visited}/30</Text>
          <Text style={styles.avgLabel}>
            {Number(item.avg_rating) > 0 ? `${Number(item.avg_rating).toFixed(1)} avg` : ''}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={Colors.primary.navy} />
      </TouchableOpacity>

      {/* Tab Switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'global' && styles.tabActive]}
          onPress={() => setTab('global')}
        >
          <Text style={[styles.tabText, tab === 'global' && styles.tabTextActive]}>Global</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'friends' && styles.tabActive]}
          onPress={() => setTab('friends')}
        >
          <Text style={[styles.tabText, tab === 'friends' && styles.tabTextActive]}>Friends</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent.coral} />
        </View>
      ) : (
        <FlatList
          data={displayEntries}
          keyExtractor={(item) => item.user_id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="trophy-outline" size={48} color={Colors.text.tertiary} />
              <Text style={styles.emptyText}>
                {tab === 'friends' ? 'Follow people to see them here' : 'No entries yet'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.cream },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Layout.screenPadding,
    marginTop: Spacing.sm,
    ...Shadows.sm,
  },
  tabRow: {
    flexDirection: 'row', marginHorizontal: Layout.screenPadding, marginTop: Spacing.md,
    backgroundColor: Colors.background.warmGrey, borderRadius: BorderRadius.md, padding: 3,
  },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: BorderRadius.sm },
  tabActive: { backgroundColor: Colors.background.white, ...Shadows.sm },
  tabText: { ...Typography.captionBold, color: Colors.text.secondary },
  tabTextActive: { color: Colors.accent.coral },
  list: { padding: Layout.screenPadding, paddingBottom: 40 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.background.white, borderRadius: BorderRadius.md,
    padding: Spacing.base, marginBottom: Spacing.sm, ...Shadows.sm,
  },
  rowHighlight: { borderWidth: 1.5, borderColor: Colors.accent.coral },
  rank: { ...Typography.h4, color: Colors.primary.navy, width: 32, textAlign: 'center' },
  info: { flex: 1 },
  name: { ...Typography.bodyBold, color: Colors.text.primary },
  username: { ...Typography.small, color: Colors.text.secondary, marginTop: 2 },
  stats: { alignItems: 'flex-end' },
  visited: { ...Typography.bodyBold, color: Colors.accent.coral },
  avgLabel: { ...Typography.tiny, color: Colors.text.tertiary, marginTop: 2 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: Spacing['3xl'] },
  emptyText: { ...Typography.body, color: Colors.text.tertiary, marginTop: Spacing.md },
});
