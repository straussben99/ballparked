import React, { useRef } from 'react';
import { View, TouchableOpacity, ViewStyle, StyleSheet, Animated } from 'react-native';
import { BorderRadius, Layout } from '../../constants/spacing';
import { Shadows } from '../../constants/shadows';
import { Colors } from '../../constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const cardStyle = [styles.card, style];

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={cardStyle}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.7}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.white,
    borderRadius: BorderRadius.lg,
    padding: Layout.cardPadding,
    ...Shadows.md,
  },
});
