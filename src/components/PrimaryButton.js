import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';

import colors from '../theme/colors';
import {borderRadius, spacing} from '../theme/design';

function PrimaryButton({children, disabled, loading, onPress, style}) {
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={[styles.button, (disabled || loading) && styles.disabled, style]}>
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : typeof children === 'string' ? (
        <Text style={styles.text}>{children}</Text>
      ) : (
        <View style={styles.row}>{children}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.lg,
    paddingVertical: 15,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});

export default PrimaryButton;
