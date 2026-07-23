import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import colors from '../theme/colors';

function ChoiceChip({active, icon, label, onPress}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.activeChip]}>
      {icon ? <Ionicons name={icon} size={16} color={active ? colors.primary : colors.textMuted} style={styles.icon} /> : null}
      <Text style={[styles.text, active && styles.activeText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {marginRight: 6},
  activeChip: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  activeText: {
    color: colors.primary,
  },
});

export default ChoiceChip;
