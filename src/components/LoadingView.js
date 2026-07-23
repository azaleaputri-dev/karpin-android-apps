import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';

import colors from '../theme/colors';

function LoadingView({size = 'large'}) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={colors.primary} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 24,
  },
});

export default LoadingView;
