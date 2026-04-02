import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from '@/components/ui/Chip';
import { Spacing } from '@/constants/spacing';
import { Colors } from '@/constants/colors';

interface TagSelectorProps {
  tags: string[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  tags,
  selectedTags,
  onToggle,
}) => {
  return (
    <View style={styles.container}>
      {tags.map((tag) => (
        <View key={tag} style={styles.chipWrapper}>
          <Chip
            label={tag}
            selected={selectedTags.includes(tag)}
            onPress={() => onToggle(tag)}
            color={Colors.accent.coral}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  chipWrapper: {},
});
