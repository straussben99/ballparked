import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { FontSize, FontWeight } from '@/constants/typography';
import { Shadows } from '@/constants/shadows';
import type { Stadium } from '@/types/stadium';

interface FactItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

interface StadiumFactsProps {
  stadium: Stadium;
}

export const StadiumFacts: React.FC<StadiumFactsProps> = ({ stadium }) => {
  const facts: FactItem[] = [
    {
      icon: 'calendar-outline',
      label: 'Year Opened',
      value: String(stadium.yearOpened),
    },
    {
      icon: 'people-outline',
      label: 'Capacity',
      value: stadium.capacity.toLocaleString(),
    },
    {
      icon: 'resize-outline',
      label: 'Dimensions',
      value: `${stadium.fieldDimensions.leftField}/${stadium.fieldDimensions.centerField}/${stadium.fieldDimensions.rightField}`,
    },
    {
      icon: 'umbrella-outline',
      label: 'Roof Type',
      value: stadium.roofType,
    },
    {
      icon: 'leaf-outline',
      label: 'Surface',
      value: stadium.surfaceType,
    },
    {
      icon: 'baseball-outline',
      label: 'Division',
      value: stadium.division,
    },
  ];

  return (
    <View style={styles.grid}>
      {facts.map((fact) => (
        <View key={fact.label} style={styles.factCard}>
          <Ionicons
            name={fact.icon}
            size={20}
            color={Colors.accent.coral}
            style={styles.icon}
          />
          <Text style={styles.label}>{fact.label}</Text>
          <Text style={styles.value} numberOfLines={1}>
            {fact.value}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  factCard: {
    width: '47%',
    backgroundColor: Colors.background.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  icon: {
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs / 2,
  },
  value: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
});
