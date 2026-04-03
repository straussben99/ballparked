import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { FontSize, FontWeight } from '../../constants/typography';
import { Colors } from '../../constants/colors';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected,
  onPress,
  color = Colors.accent.coral,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        selected
          ? { backgroundColor: color, borderColor: color, borderWidth: 1.5 }
          : { backgroundColor: Colors.background.white, borderColor: color, borderWidth: 1.5 },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.text,
          { color: selected ? Colors.text.inverse : Colors.text.primary },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 2,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semiBold,
  },
});
