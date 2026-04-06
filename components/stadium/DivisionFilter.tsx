import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { Shadows } from '@/constants/shadows';

const DIVISIONS = [
  'AL East',
  'AL Central',
  'AL West',
  'NL East',
  'NL Central',
  'NL West',
] as const;

interface DivisionFilterProps {
  selectedDivision: string | null;
  onSelect: (division: string | null) => void;
}

export const DivisionFilter: React.FC<DivisionFilterProps> = ({
  selectedDivision,
  onSelect,
}) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (division: string | null) => {
    onSelect(division);
    setOpen(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="filter-outline" size={18} color={Colors.primary.navy} />
        <Text style={styles.buttonText}>
          {selectedDivision ?? 'All Divisions'}
        </Text>
        <Ionicons name="chevron-down" size={16} color={Colors.text.secondary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>Filter by Division</Text>

            <TouchableOpacity
              style={[
                styles.option,
                selectedDivision === null && styles.optionActive,
              ]}
              onPress={() => handleSelect(null)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedDivision === null && styles.optionTextActive,
                ]}
              >
                All Divisions
              </Text>
              {selectedDivision === null && (
                <Ionicons name="checkmark" size={20} color={Colors.accent.coral} />
              )}
            </TouchableOpacity>

            {DIVISIONS.map((division) => {
              const isSelected = selectedDivision === division;
              const divColor = Colors.division[division] ?? Colors.primary.navy;
              return (
                <TouchableOpacity
                  key={division}
                  style={[styles.option, isSelected && styles.optionActive]}
                  onPress={() => handleSelect(division)}
                >
                  <View style={[styles.divDot, { backgroundColor: divColor }]} />
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextActive,
                    ]}
                  >
                    {division}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={20} color={Colors.accent.coral} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: Spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    ...Shadows.sm,
  },
  buttonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary.navy,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  dropdown: {
    backgroundColor: Colors.background.white,
    borderRadius: BorderRadius.lg,
    padding: 8,
    width: '100%',
    maxWidth: 320,
    ...Shadows.lg,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary.navy,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: BorderRadius.sm,
    gap: 10,
  },
  optionActive: {
    backgroundColor: Colors.background.cream,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  optionTextActive: {
    fontWeight: '700',
    color: Colors.accent.coral,
  },
  divDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
