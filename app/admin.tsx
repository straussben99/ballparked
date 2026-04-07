import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { Shadows } from '@/constants/shadows';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { isAdmin } from '@/lib/admin';
import { getStadiumById, STADIUMS } from '@/data/stadiums';

interface OverviewStats {
  users: number;
  ratings: number;
  comments: number;
  follows: number;
  photos: number;
  avgRating: number;
}

interface RecentProfile {
  id: string;
  display_name: string | null;
  username: string | null;
  created_at: string;
}

interface TopStadium {
  stadium_id: string;
  avg: number;
  count: number;
}

interface ActiveUser {
  user_id: string;
  count: number;
  display_name: string | null;
  username: string | null;
}

interface CategoryAverages {
  vibes: number;
  food: number;
  views: number;
  identity: number;
  accessibility: number;
}

interface RecentRating {
  id: string;
  stadium_id: string;
  overall: number;
  created_at: string;
  user_id: string;
  display_name: string | null;
  username: string | null;
}

interface DashboardData {
  overview: OverviewStats;
  recentSignupsCount: number;
  recentSignups: RecentProfile[];
  topStadiums: TopStadium[];
  activeUsers: ActiveUser[];
  categoryAverages: CategoryAverages;
  recentRatings: RecentRating[];
  stadiumsCovered: number;
}

const TOTAL_STADIUMS = 30;

async function countTable(table: string): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });
  if (error) {
    console.warn(`Failed to count ${table}:`, error.message);
    return 0;
  }
  return count ?? 0;
}

async function fetchOverview(): Promise<OverviewStats> {
  const [users, ratings, comments, follows, photos, avgRow] = await Promise.all([
    countTable('profiles'),
    countTable('ratings'),
    countTable('comments'),
    countTable('follows'),
    countTable('rating_photos'),
    supabase.from('ratings').select('overall'),
  ]);

  let avgRating = 0;
  if (!avgRow.error && avgRow.data && avgRow.data.length > 0) {
    const total = avgRow.data.reduce(
      (sum: number, r: any) => sum + (Number(r.overall) || 0),
      0
    );
    avgRating = total / avgRow.data.length;
  }

  return { users, ratings, comments, follows, photos, avgRating };
}

async function fetchRecentSignups(): Promise<{
  count: number;
  list: RecentProfile[];
}> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo);

  const { data } = await supabase
    .from('profiles')
    .select('id, display_name, username, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    count: count ?? 0,
    list: (data ?? []) as RecentProfile[],
  };
}

async function fetchTopStadiums(): Promise<TopStadium[]> {
  const { data, error } = await supabase
    .from('ratings')
    .select('stadium_id, overall');

  if (error || !data) return [];

  const map = new Map<string, { sum: number; count: number }>();
  for (const row of data as any[]) {
    const id = row.stadium_id as string;
    const overall = Number(row.overall) || 0;
    const existing = map.get(id) ?? { sum: 0, count: 0 };
    existing.sum += overall;
    existing.count += 1;
    map.set(id, existing);
  }

  return Array.from(map.entries())
    .map(([stadium_id, v]) => ({
      stadium_id,
      avg: v.count > 0 ? v.sum / v.count : 0,
      count: v.count,
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);
}

async function fetchActiveUsers(): Promise<ActiveUser[]> {
  const { data, error } = await supabase.from('ratings').select('user_id');
  if (error || !data) return [];

  const counts = new Map<string, number>();
  for (const row of data as any[]) {
    const id = row.user_id as string;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  const top = Array.from(counts.entries())
    .map(([user_id, count]) => ({ user_id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  if (top.length === 0) return [];

  const ids = top.map((t) => t.user_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, username')
    .in('id', ids);

  const profileMap = new Map<string, { display_name: string | null; username: string | null }>();
  for (const p of (profiles ?? []) as any[]) {
    profileMap.set(p.id, { display_name: p.display_name, username: p.username });
  }

  return top.map((t) => ({
    ...t,
    display_name: profileMap.get(t.user_id)?.display_name ?? null,
    username: profileMap.get(t.user_id)?.username ?? null,
  }));
}

async function fetchCategoryAverages(): Promise<CategoryAverages> {
  const { data, error } = await supabase
    .from('ratings')
    .select('vibes_score, food_score, views_score, identity_score, accessibility_score');

  if (error || !data || data.length === 0) {
    return { vibes: 0, food: 0, views: 0, identity: 0, accessibility: 0 };
  }

  const sums = { vibes: 0, food: 0, views: 0, identity: 0, accessibility: 0 };
  for (const r of data as any[]) {
    sums.vibes += Number(r.vibes_score) || 0;
    sums.food += Number(r.food_score) || 0;
    sums.views += Number(r.views_score) || 0;
    sums.identity += Number(r.identity_score) || 0;
    sums.accessibility += Number(r.accessibility_score) || 0;
  }
  const n = data.length;
  return {
    vibes: sums.vibes / n,
    food: sums.food / n,
    views: sums.views / n,
    identity: sums.identity / n,
    accessibility: sums.accessibility / n,
  };
}

async function fetchRecentRatings(): Promise<RecentRating[]> {
  const { data, error } = await supabase
    .from('ratings')
    .select('id, stadium_id, overall, created_at, user_id')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error || !data) return [];

  const userIds = Array.from(new Set((data as any[]).map((r) => r.user_id)));
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, username')
    .in('id', userIds);

  const profileMap = new Map<string, { display_name: string | null; username: string | null }>();
  for (const p of (profiles ?? []) as any[]) {
    profileMap.set(p.id, { display_name: p.display_name, username: p.username });
  }

  return (data as any[]).map((r) => ({
    id: r.id,
    stadium_id: r.stadium_id,
    overall: Number(r.overall) || 0,
    created_at: r.created_at,
    user_id: r.user_id,
    display_name: profileMap.get(r.user_id)?.display_name ?? null,
    username: profileMap.get(r.user_id)?.username ?? null,
  }));
}

async function fetchStadiumsCovered(): Promise<number> {
  const { data, error } = await supabase.from('ratings').select('stadium_id');
  if (error || !data) return 0;
  const set = new Set<string>();
  for (const row of data as any[]) set.add(row.stadium_id);
  // Only count stadiums in our active list
  let covered = 0;
  for (const id of set) {
    if (STADIUMS.find((s) => s.id === id)) covered += 1;
  }
  return covered;
}

async function loadAll(): Promise<DashboardData> {
  const [
    overview,
    recent,
    topStadiums,
    activeUsers,
    categoryAverages,
    recentRatings,
    stadiumsCovered,
  ] = await Promise.all([
    fetchOverview(),
    fetchRecentSignups(),
    fetchTopStadiums(),
    fetchActiveUsers(),
    fetchCategoryAverages(),
    fetchRecentRatings(),
    fetchStadiumsCovered(),
  ]);

  return {
    overview,
    recentSignupsCount: recent.count,
    recentSignups: recent.list,
    topStadiums,
    activeUsers,
    categoryAverages,
    recentRatings,
    stadiumsCovered,
  };
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const allowed = isAdmin(user?.email);

  const load = useCallback(async () => {
    try {
      const result = await loadAll();
      setData(result);
    } catch (err: any) {
      console.error('Admin load failed:', err);
      Alert.alert('Error', err?.message ?? 'Failed to load admin data');
    }
  }, []);

  useEffect(() => {
    if (!allowed) {
      router.replace('/');
      return;
    }
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [allowed, load, router]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (!allowed) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.6}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>BallParked Analytics</Text>
        </View>
        <TouchableOpacity
          onPress={onRefresh}
          style={styles.refreshButton}
          activeOpacity={0.6}
          disabled={refreshing}
        >
          <Ionicons name="refresh" size={22} color={Colors.accent.coral} />
        </TouchableOpacity>
      </View>

      {loading || !data ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.accent.coral} />
          <Text style={styles.loadingText}>Loading dashboard…</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.accent.coral}
            />
          }
        >
          {/* Section 1: Overview */}
          <SectionTitle title="Overview" icon="stats-chart" />
          <View style={styles.statGrid}>
            <StatCard
              label="Total Users"
              value={data.overview.users.toLocaleString()}
              accent={Colors.accent.coral}
              icon="people"
            />
            <StatCard
              label="Total Ratings"
              value={data.overview.ratings.toLocaleString()}
              accent={Colors.accent.orange}
              icon="star"
            />
            <StatCard
              label="Total Comments"
              value={data.overview.comments.toLocaleString()}
              accent={Colors.accent.green}
              icon="chatbubble"
            />
            <StatCard
              label="Total Follows"
              value={data.overview.follows.toLocaleString()}
              accent={Colors.primary.navy}
              icon="person-add"
            />
            <StatCard
              label="Total Photos"
              value={data.overview.photos.toLocaleString()}
              accent={Colors.accent.yellow}
              icon="image"
            />
            <StatCard
              label="Avg Rating"
              value={data.overview.avgRating.toFixed(1)}
              accent={Colors.accent.coralDark}
              icon="trophy"
            />
          </View>

          {/* Section 2: Recent Signups */}
          <SectionTitle title="Recent Signups" icon="person-add" />
          <Card style={styles.sectionCard}>
            <View style={styles.row}>
              <Text style={styles.statLabelInline}>Last 7 Days</Text>
              <Text style={styles.bigNumberInline}>{data.recentSignupsCount}</Text>
            </View>
            <View style={styles.divider} />
            {data.recentSignups.length === 0 ? (
              <Text style={styles.emptyText}>No recent signups.</Text>
            ) : (
              data.recentSignups.map((p, idx) => (
                <View
                  key={p.id}
                  style={[
                    styles.listRow,
                    idx === data.recentSignups.length - 1 && styles.listRowLast,
                  ]}
                >
                  <View style={styles.listRowLeft}>
                    <Text style={styles.listPrimary}>
                      {p.display_name || 'Unnamed'}
                    </Text>
                    <Text style={styles.listSecondary}>
                      @{p.username || 'no-username'}
                    </Text>
                  </View>
                  <Text style={styles.listMeta}>{formatDate(p.created_at)}</Text>
                </View>
              ))
            )}
          </Card>

          {/* Section 3: Top Rated Stadiums */}
          <SectionTitle title="Top Rated Stadiums" icon="trophy" />
          <Card style={styles.sectionCard}>
            {data.topStadiums.length === 0 ? (
              <Text style={styles.emptyText}>No ratings yet.</Text>
            ) : (
              data.topStadiums.map((s, idx) => {
                const stadium = getStadiumById(s.stadium_id);
                return (
                  <View
                    key={s.stadium_id}
                    style={[
                      styles.listRow,
                      idx === data.topStadiums.length - 1 && styles.listRowLast,
                    ]}
                  >
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>{idx + 1}</Text>
                    </View>
                    <View style={styles.listRowLeft}>
                      <Text style={styles.listPrimary}>
                        {stadium?.name ?? s.stadium_id}
                      </Text>
                      <Text style={styles.listSecondary}>
                        {s.count} rating{s.count === 1 ? '' : 's'}
                      </Text>
                    </View>
                    <View style={styles.scoreBadge}>
                      <Text style={styles.scoreText}>{s.avg.toFixed(1)}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </Card>

          {/* Section 4: Most Active Users */}
          <SectionTitle title="Most Active Users" icon="flame" />
          <Card style={styles.sectionCard}>
            {data.activeUsers.length === 0 ? (
              <Text style={styles.emptyText}>No users yet.</Text>
            ) : (
              data.activeUsers.map((u, idx) => (
                <View
                  key={u.user_id}
                  style={[
                    styles.listRow,
                    idx === data.activeUsers.length - 1 && styles.listRowLast,
                  ]}
                >
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{idx + 1}</Text>
                  </View>
                  <View style={styles.listRowLeft}>
                    <Text style={styles.listPrimary}>
                      {u.display_name || 'Unnamed'}
                    </Text>
                    <Text style={styles.listSecondary}>
                      @{u.username || 'no-username'}
                    </Text>
                  </View>
                  <Text style={styles.listMeta}>
                    {u.count} rating{u.count === 1 ? '' : 's'}
                  </Text>
                </View>
              ))
            )}
          </Card>

          {/* Section 5: Category Averages */}
          <SectionTitle title="Category Averages" icon="bar-chart" />
          <Card style={styles.sectionCard}>
            <CategoryRow label="Vibes" value={data.categoryAverages.vibes} />
            <CategoryRow label="Food" value={data.categoryAverages.food} />
            <CategoryRow label="Views" value={data.categoryAverages.views} />
            <CategoryRow label="Identity" value={data.categoryAverages.identity} />
            <CategoryRow
              label="Accessibility"
              value={data.categoryAverages.accessibility}
              last
            />
          </Card>

          {/* Section 6: Recent Ratings */}
          <SectionTitle title="Recent Ratings" icon="time" />
          <Card style={styles.sectionCard}>
            {data.recentRatings.length === 0 ? (
              <Text style={styles.emptyText}>No ratings yet.</Text>
            ) : (
              data.recentRatings.map((r, idx) => {
                const stadium = getStadiumById(r.stadium_id);
                return (
                  <TouchableOpacity
                    key={r.id}
                    activeOpacity={0.6}
                    onPress={() => router.push(`/rating/${r.id}` as any)}
                    style={[
                      styles.listRow,
                      idx === data.recentRatings.length - 1 && styles.listRowLast,
                    ]}
                  >
                    <View style={styles.listRowLeft}>
                      <Text style={styles.listPrimary}>
                        {stadium?.name ?? r.stadium_id}
                      </Text>
                      <Text style={styles.listSecondary}>
                        {r.display_name || `@${r.username || 'unknown'}`} ·{' '}
                        {formatDate(r.created_at)}
                      </Text>
                    </View>
                    <View style={styles.scoreBadge}>
                      <Text style={styles.scoreText}>{r.overall.toFixed(1)}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </Card>

          {/* Section 7: Stadium Coverage */}
          <SectionTitle title="Stadium Coverage" icon="baseball" />
          <Card style={styles.sectionCard}>
            <View style={styles.coverageRow}>
              <View style={styles.coverageStat}>
                <Text style={styles.coverageBig}>
                  {data.stadiumsCovered}
                  <Text style={styles.coverageSmall}>/{TOTAL_STADIUMS}</Text>
                </Text>
                <Text style={styles.coverageLabel}>stadiums rated</Text>
              </View>
              <View style={styles.coverageStat}>
                <Text style={[styles.coverageBig, { color: Colors.accent.green }]}>
                  {Math.round((data.stadiumsCovered / TOTAL_STADIUMS) * 100)}%
                </Text>
                <Text style={styles.coverageLabel}>coverage</Text>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(
                      100,
                      (data.stadiumsCovered / TOTAL_STADIUMS) * 100
                    )}%`,
                  },
                ]}
              />
            </View>
          </Card>

          <View style={{ height: Spacing['3xl'] }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/* ---------------- Subcomponents ---------------- */

function SectionTitle({
  title,
  icon,
}: {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Ionicons name={icon} size={16} color={Colors.accent.coral} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function StatCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string;
  accent: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}) {
  return (
    <View style={[styles.statCard, { borderTopColor: accent }]}>
      <Ionicons name={icon} size={18} color={accent} style={{ marginBottom: Spacing.xs }} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function CategoryRow({
  label,
  value,
  last,
}: {
  label: string;
  value: number;
  last?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (value / 10) * 100));
  return (
    <View style={[styles.catRow, last && styles.listRowLast]}>
      <View style={styles.catHeader}>
        <Text style={styles.catLabel}>{label}</Text>
        <Text style={styles.catValue}>{value.toFixed(1)}</Text>
      </View>
      <View style={styles.catTrack}>
        <View style={[styles.catFill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
    backgroundColor: Colors.background.white,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    ...Typography.small,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  refreshButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  scroll: {
    padding: Layout.screenPadding,
    paddingBottom: Spacing['3xl'],
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.captionBold,
    color: Colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: '47%',
    backgroundColor: Colors.background.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderTopWidth: 3,
    ...Shadows.sm,
  },
  statValue: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  statLabel: {
    ...Typography.small,
    color: Colors.text.secondary,
    marginTop: 2,
  },

  sectionCard: {
    paddingVertical: Spacing.sm,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  statLabelInline: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  bigNumberInline: {
    ...Typography.h3,
    color: Colors.accent.coral,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.card.border,
    marginVertical: Spacing.xs,
  },
  emptyText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: Spacing.base,
  },

  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  listRowLast: {
    borderBottomWidth: 0,
  },
  listRowLeft: {
    flex: 1,
  },
  listPrimary: {
    ...Typography.bodyBold,
    color: Colors.text.primary,
  },
  listSecondary: {
    ...Typography.small,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  listMeta: {
    ...Typography.smallBold,
    color: Colors.text.tertiary,
  },

  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.background.warmGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    ...Typography.smallBold,
    color: Colors.text.secondary,
  },
  scoreBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.accent.coral,
    minWidth: 44,
    alignItems: 'center',
  },
  scoreText: {
    ...Typography.smallBold,
    color: Colors.text.inverse,
  },

  catRow: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  catLabel: {
    ...Typography.caption,
    color: Colors.text.primary,
  },
  catValue: {
    ...Typography.captionBold,
    color: Colors.accent.coral,
  },
  catTrack: {
    height: 6,
    backgroundColor: Colors.background.warmGrey,
    borderRadius: 3,
    overflow: 'hidden',
  },
  catFill: {
    height: '100%',
    backgroundColor: Colors.accent.coral,
    borderRadius: 3,
  },

  coverageRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
  },
  coverageStat: {
    alignItems: 'center',
  },
  coverageBig: {
    ...Typography.h2,
    color: Colors.accent.coral,
  },
  coverageSmall: {
    ...Typography.h4,
    color: Colors.text.tertiary,
  },
  coverageLabel: {
    ...Typography.small,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.background.warmGrey,
    borderRadius: 4,
    marginTop: Spacing.sm,
    marginHorizontal: Spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent.green,
    borderRadius: 4,
  },
});
