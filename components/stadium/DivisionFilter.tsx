import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';

const DIVISIONS = [
  'AL East',
  'AL Central',
  'AL West',
  'NL East',
  'NL Central',
  'NL West',
] as const;

interface DivisionFilterProps {
  selectedDivision: string | null;
  onSelect: (division: string | null) => void;
}

export const DivisionFilter: React.FC<DivisionFilterProps> = ({
  selectedDivision,
  onSelect,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Chip
        label="All"
        selected={selectedDivision === null}
        onPress={() => onSelect(null)}
        color={Colors.accent.coral}
      />
      {DIVISIONS.map((division) => (
        <Chip
          key={division}
          label={division}
          selected={selectedDivision === division}
          onPress={() => onSelect(division)}
          color={Colors.division[division]}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
});
