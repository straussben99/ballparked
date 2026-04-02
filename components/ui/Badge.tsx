import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { FontSize, FontWeight } from '../../constants/typography';
import { Colors } from '../../constants/colors';

type BadgeVariant = 'visited' | 'unvisited' | 'rating' | 'division';

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
  color?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant,
  color,
  size = 'md',
}) => {
  const isSmall = size === 'sm';

  const containerStyle = [
    styles.base,
    isSmall ? styles.sm : styles.md,
    variant === 'visited' && styles.visited,
    variant === 'unvisited' && styles.unvisited,
    variant === 'rating' && styles.rating,
    variant === 'division' && {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: color ?? Colors.text.secondary,
    },
  ];

  const textStyle = [
    styles.text,
    isSmall ? styles.textSm : styles.textMd,
    variant === 'visited' && styles.textInverse,
    variant === 'unvisited' && styles.textNavy,
    variant === 'rating' && styles.textInverse,
    variant === 'division' && { color: color ?? Colors.text.secondary },
  ];

  return (
    <View style={containerStyle}>
      <Text style={textStyle}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
  },
  md: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  visited: {
    backgroundColor: Colors.accent.green,
  },
  unvisited: {
    backgroundColor: Colors.semantic.unvisited,
  },
  rating: {
    backgroundColor: Colors.accent.orange,
  },
  text: {
    fontWeight: FontWeight.semiBold,
  },
  textSm: {
    fontSize: FontSize.xs,
  },
  textMd: {
    fontSize: FontSize.sm,
  },
  textInverse: {
    color: Colors.text.inverse,
  },
  textNavy: {
    color: Colors.primary.navy,
  },
});
