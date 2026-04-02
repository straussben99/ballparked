import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { FontSize, FontWeight } from '../../constants/typography';
import { Colors } from '../../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon,
  fullWidth = false,
}) => {
  const containerStyle: ViewStyle[] = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
  ].filter(Boolean) as ViewStyle[];

  const textColor =
    variant === 'outline' ? Colors.accent.coral : Colors.text.inverse;

  const fontSize =
    size === 'sm' ? FontSize.sm : size === 'lg' ? FontSize.lg : FontSize.base;

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={styles.content}>
        {icon && (
          <Ionicons
            name={icon}
            size={fontSize + 2}
            color={textColor}
            style={styles.icon}
          />
        )}
        <Text
          style={[
            styles.text,
            { color: textColor, fontSize },
          ]}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: Colors.accent.coral,
  },
  secondary: {
    backgroundColor: Colors.primary.navy,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.accent.coral,
  },
  size_sm: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  size_md: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  size_lg: {
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: Spacing.sm,
  },
  text: {
    fontWeight: FontWeight.semiBold,
  },
});
