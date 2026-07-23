import {StyleSheet, View} from 'react-native';
import colors from '../theme/colors';

function Card({children, style, padding = 'xl'}) {
  const pad = padding === 'none' ? 0 : padding === 'lg' ? 18 : padding === 'md' ? 16 : 20;
  return <View style={[styles.card, {padding: pad}, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    shadowColor: '#0f172a',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
});

export default Card;
