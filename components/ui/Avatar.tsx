import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '../../constants/colors';
import { FontWeight } from '../../constants/typography';

interface AvatarProps {
  uri?: string;
  size?: number;
  name: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name[0] ?? '').toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  size = 44,
  name,
}) => {
  const borderRadius = size / 2;
  const fontSize = size * 0.38;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{
          width: size,
          height: size,
          borderRadius,
        }}
        contentFit="cover"
        transition={200}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: Colors.accent.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.text.inverse,
    fontWeight: FontWeight.bold,
  },
});
