import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};

export const Typography = {
  h1: { fontSize: FontSize['4xl'], fontWeight: FontWeight.extraBold, fontFamily },
  h2: { fontSize: FontSize['3xl'], fontWeight: FontWeight.bold, fontFamily },
  h3: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, fontFamily },
  h4: { fontSize: FontSize.xl, fontWeight: FontWeight.semiBold, fontFamily },
  body: { fontSize: FontSize.base, fontWeight: FontWeight.regular, fontFamily },
  bodyBold: { fontSize: FontSize.base, fontWeight: FontWeight.semiBold, fontFamily },
  caption: { fontSize: FontSize.md, fontWeight: FontWeight.regular, fontFamily },
  captionBold: { fontSize: FontSize.md, fontWeight: FontWeight.semiBold, fontFamily },
  small: { fontSize: FontSize.sm, fontWeight: FontWeight.regular, fontFamily },
  smallBold: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, fontFamily },
  tiny: { fontSize: FontSize.xs, fontWeight: FontWeight.regular, fontFamily },
};
