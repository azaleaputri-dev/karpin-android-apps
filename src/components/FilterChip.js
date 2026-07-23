import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import colors from '../theme/colors';

function FilterChip({active, icon, label, onPress}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.activeChip]}>
      {icon ? <Ionicons name={icon} size={14} color={active ? colors.primary : colors.textMuted} style={styles.icon} /> : null}
      <Text style={[styles.text, active && styles.activeText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.graySoft,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {marginRight: 4},
  activeChip: {
    backgroundColor: colors.primarySoft,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  activeText: {
    color: colors.primary,
  },
});

export default FilterChip;
