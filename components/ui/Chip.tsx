import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BorderRadius } from '../../constants/spacing';
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
          ? { backgroundColor: color, borderColor: color }
          : { backgroundColor: Colors.background.white, borderColor: color },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.text,
          { color: selected ? '#FFFFFF' : Colors.text.primary },
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
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1.5,
    flexShrink: 0,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});
