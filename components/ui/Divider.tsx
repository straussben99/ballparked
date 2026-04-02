import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing } from '../../constants/spacing';

interface DividerProps {
  color?: string;
  marginVertical?: number;
}

export const Divider: React.FC<DividerProps> = ({
  color = '#E8E0D8',
  marginVertical = Spacing.base,
}) => {
  return <View style={[styles.line, { backgroundColor: color, marginVertical }]} />;
};

const styles = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
});
