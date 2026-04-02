import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight } from '../../constants/typography';

interface ProgressBarProps {
  progress: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  color = Colors.accent.green,
  backgroundColor = '#E8E0D8',
  showLabel = false,
  label,
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const clampedProgress = Math.min(1, Math.max(0, progress));

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: clampedProgress,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [clampedProgress]);

  return (
    <View style={styles.container}>
      {showLabel && label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <View style={[styles.track, { height, backgroundColor, borderRadius: height / 2 }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              height,
              backgroundColor: color,
              borderRadius: height / 2,
              width: animatedWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
