import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import colors from '../theme/colors';

function QuickStatCard({label, value, accent}) {
  return (
    <View style={styles.card}>
      <View style={[styles.accent, {backgroundColor: accent || colors.primary}]} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#0f172a',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  accent: {
    width: 42,
    height: 6,
    borderRadius: 999,
    marginBottom: 14,
  },
  value: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  label: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textMuted,
  },
});

export default QuickStatCard;
