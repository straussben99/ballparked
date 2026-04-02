import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography, FontSize, FontWeight } from '@/constants/typography';
import { useStadiumStore } from '@/stores/useStadiumStore';
import type { Stadium } from '@/types/stadium';

interface StadiumCardProps {
  stadium: Stadium;
  onPress: () => void;
}

export const StadiumCard: React.FC<StadiumCardProps> = ({ stadium, onPress }) => {
  const isVisited = useStadiumStore((state) => state.isVisited(stadium.id));

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {stadium.name}
          </Text>
          <Text style={styles.team} numberOfLines={1}>
            {stadium.team}
          </Text>
          <Text style={styles.location} numberOfLines={1}>
            {stadium.city}, {stadium.state}
          </Text>
        </View>
        <View style={styles.right}>
          {isVisited ? (
            <Badge label="Visited" variant="visited" size="sm" />
          ) : (
            <Badge
              label={stadium.division}
              variant="division"
              size="sm"
              color={Colors.division[stadium.division]}
            />
          )}
          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.text.tertiary}
            style={styles.chevron}
          />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginRight: Spacing.md,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  team: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    marginTop: Spacing.xs / 2,
  },
  location: {
    fontSize: FontSize.sm,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs / 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  chevron: {
    marginLeft: Spacing.xs,
  },
});
