import React, { useState, useMemo, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { FontSize, FontWeight, Typography } from '@/constants/typography';
import { Shadows } from '@/constants/shadows';
import { supabase } from '@/lib/supabase';
import { STADIUMS, getStadiumsByDivision, searchStadiums } from '@/data/stadiums';
import { HISTORIC_STADIUMS } from '@/data/historic-stadiums';
import { DivisionFilter } from '@/components/stadium/DivisionFilter';
import { StadiumCard } from '@/components/stadium/StadiumCard';
import type { Stadium, Division } from '@/types/stadium';

type SortKey = 'name' | 'rating' | 'year';
type StadiumTab = 'current' | 'historic';

interface StadiumStatsMap {
  [stadiumId: string]: { avg_rating: number; rating_count: number };
}

export default function ExploreScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [stadiumStats, setStadiumStats] = useState<StadiumStatsMap>({});
  const [activeTab, setActiveTab] = useState<StadiumTab>('current');

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase
        .from('stadium_stats')
        .select('*');

      if (!error && data) {
        const map: StadiumStatsMap = {};
        for (const row of data) {
          map[row.stadium_id] = {
            avg_rating: row.avg_rating,
            rating_count: row.rating_count,
          };
        }
        setStadiumStats(map);
      }
    };

    fetchStats();
  }, []);

  const filteredStadiums = useMemo(() => {
    const sourceStadiums: Stadium[] = activeTab === 'current' ? STADIUMS : [...HISTORIC_STADIUMS];
    let results: Stadium[];

    if (activeTab === 'current') {
      if (searchQuery.trim()) {
        results = searchStadiums(searchQuery.trim());
      } else if (selectedDivision) {
        results = getStadiumsByDivision(selectedDivision as Division);
      } else {
        results = [...STADIUMS];
      }

      // Apply division filter even when searching
      if (selectedDivision && searchQuery.trim()) {
        results = results.filter((s) => s.division === selectedDivision);
      }
    } else {
      results = sourceStadiums;

      if (searchQuery.trim()) {
        const lowerQuery = searchQuery.trim().toLowerCase();
        results = results.filter(
          (s) =>
            s.name.toLowerCase().includes(lowerQuery) ||
            s.team.toLowerCase().includes(lowerQuery) ||
            s.city.toLowerCase().includes(lowerQuery) ||
            s.state.toLowerCase().includes(lowerQuery) ||
            s.teamAbbr.toLowerCase().includes(lowerQuery)
        );
      }

      if (selectedDivision) {
        results = results.filter((s) => s.division === selectedDivision);
      }
    }

    // Sort
    switch (sortBy) {
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        results.sort((a, b) => {
          const aRating = stadiumStats[a.id]?.avg_rating ?? 0;
          const bRating = stadiumStats[b.id]?.avg_rating ?? 0;
          return bRating - aRating; // highest first
        });
        break;
      case 'year':
        results.sort((a, b) => a.yearOpened - b.yearOpened);
        break;
    }

    return results;
  }, [searchQuery, selectedDivision, sortBy, stadiumStats, activeTab]);

  const handleStadiumPress = (stadiumId: string) => {
    router.push(`/explore/${stadiumId}`);
  };

  const renderSortButton = (key: SortKey, label: string) => (
    <TouchableOpacity
      key={key}
      onPress={() => setSortBy(key)}
      style={[styles.sortButton, sortBy === key && styles.sortButtonActive]}
    >
      <Text style={[styles.sortText, sortBy === key && styles.sortTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Explore {'\u26BE'}</Text>
            <Text style={styles.subtitle}>
              {activeTab === 'current' ? 'All 30 MLB Stadiums' : 'Historic Stadiums'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.compareButton}
            onPress={() => router.push('/compare' as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="swap-horizontal" size={16} color={Colors.text.inverse} />
            <Text style={styles.compareButtonText}>Compare</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => { setActiveTab('current'); setSelectedDivision(null); }}
          style={[styles.tabButton, activeTab === 'current' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabText, activeTab === 'current' && styles.tabTextActive]}>
            Current ({STADIUMS.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { setActiveTab('historic'); setSelectedDivision(null); }}
          style={[styles.tabButton, activeTab === 'historic' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabText, activeTab === 'historic' && styles.tabTextActive]}>
            Historic ({HISTORIC_STADIUMS.length})
          </Text>
        </TouchableOpacity>
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
          placeholder="Search stadiums, teams, cities..."
          placeholderTextColor={Colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>

      <DivisionFilter
        selectedDivision={selectedDivision}
        onSelect={setSelectedDivision}
      />

      <View style={styles.sortRow}>
        {renderSortButton('name', 'Name')}
        {renderSortButton('rating', 'Rating')}
        {renderSortButton('year', 'Year')}
      </View>

      <FlatList
        data={filteredStadiums}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StadiumCard
            stadium={item}
            onPress={() => handleStadiumPress(item.id)}
            avgRating={stadiumStats[item.id]?.avg_rating}
            ratingCount={stadiumStats[item.id]?.rating_count}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...Typography.h2,
    color: Colors.primary.navy,
  },
  subtitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.accent.coral,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },
  compareButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.inverse,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  tabButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.white,
    ...Shadows.sm,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary.navy,
  },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.secondary,
  },
  tabTextActive: {
    color: Colors.text.inverse,
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
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  sortButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  sortButtonActive: {
    backgroundColor: Colors.primary.navy,
  },
  sortText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.secondary,
  },
  sortTextActive: {
    color: Colors.text.inverse,
  },
  resultCount: {
    marginLeft: 'auto',
    fontSize: FontSize.sm,
    color: Colors.text.tertiary,
  },
  listContent: {
    paddingBottom: Layout.tabBarHeight + Spacing.lg,
  },
});
