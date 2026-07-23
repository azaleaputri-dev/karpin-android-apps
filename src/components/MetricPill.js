import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import colors from '../theme/colors';

function MetricPill({label, value}) {
  return (
    <View style={styles.pill}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
  },
  label: {
    fontSize: 12,
    color: colors.textMuted,
  },
  value: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
});

export default MetricPill;
