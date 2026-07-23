import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import colors from '../theme/colors';

function EmptyState({title, description}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
});

export default EmptyState;
