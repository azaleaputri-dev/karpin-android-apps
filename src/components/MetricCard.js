import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import colors from '../theme/colors';

function MetricCard({accent, label, value}) {
  return (
    <View style={[styles.card, {backgroundColor: accent}]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47%',
    borderRadius: 16,
    padding: 14,
  },
  label: {
    fontSize: 13,
    color: colors.textMuted,
  },
  value: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
});

export default MetricCard;
