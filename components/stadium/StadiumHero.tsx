import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Layout, Spacing } from '@/constants/spacing';
import { FontSize, FontWeight } from '@/constants/typography';
import type { Stadium } from '@/types/stadium';

interface StadiumHeroProps {
  stadium: Stadium;
}

export const StadiumHero: React.FC<StadiumHeroProps> = ({ stadium }) => {
  const divisionColor = Colors.division[stadium.division] ?? Colors.primary.navyLight;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[divisionColor, Colors.primary.navyLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      <LinearGradient
        colors={['transparent', 'rgba(27,42,74,0.85)']}
        style={styles.overlay}
      >
        <View style={styles.textContainer}>
          <Text style={styles.teamName}>{stadium.team}</Text>
          <Text style={styles.stadiumName}>{stadium.name}</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Layout.heroHeight,
    width: '100%',
    position: 'relative',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  textContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  teamName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semiBold,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.xs,
  },
  stadiumName: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    color: Colors.text.inverse,
  },
});
