import { Platform, ViewStyle } from 'react-native';

export const Shadows: Record<string, ViewStyle> = {
  sm: Platform.select({
    ios: {
      shadowColor: '#1B2A4A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }) as ViewStyle,
  md: Platform.select({
    ios: {
      shadowColor: '#1B2A4A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }) as ViewStyle,
  lg: Platform.select({
    ios: {
      shadowColor: '#1B2A4A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }) as ViewStyle,
};
