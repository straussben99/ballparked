import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { FontSize, FontWeight } from '@/constants/typography';

const GRADIENT_COLORS = [
  '#FF4757', '#FF5250', '#FF6B5B', '#FF8248', '#FF9F43',
  '#F5B83C', '#FECA57', '#A8D84A', '#5DD268', '#2ED573',
];

interface RatingSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  sliderLabels?: { left: string; right: string };
}

export const RatingSlider: React.FC<RatingSliderProps> = ({
  value,
  onValueChange,
  sliderLabels,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.circlesRow}>
        {Array.from({ length: 10 }, (_, i) => {
          const num = i + 1;
          const isActive = value >= num;
          return (
            <TouchableOpacity
              key={num}
              style={[
                styles.circle,
                isActive
                  ? { backgroundColor: GRADIENT_COLORS[i] }
                  : styles.circleInactive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onValueChange(num);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.circleText,
                  { color: isActive ? Colors.text.inverse : Colors.text.tertiary },
                ]}
              >
                {num}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {sliderLabels && (
        <View style={styles.labelsRow}>
          <Text style={styles.labelText}>{sliderLabels.left}</Text>
          <Text style={styles.labelText}>{sliderLabels.right}</Text>
        </View>
      )}
    </View>
  );
};

const CIRCLE_SIZE = 30;

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.sm,
  },
  circlesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleInactive: {
    borderWidth: 1.5,
    borderColor: Colors.text.tertiary,
  },
  circleText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  labelText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
});
