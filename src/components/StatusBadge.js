import {StyleSheet, Text, View} from 'react-native';
import colors from '../theme/colors';

const variants = {
  primary: {bg: colors.primarySoft, text: colors.primaryDark},
  info: {bg: colors.infoSoft, text: colors.secondary},
  purple: {bg: colors.purpleSoft, text: '#6d28d9'},
  danger: {bg: colors.dangerSoft, text: colors.danger},
  success: {bg: colors.successSoft, text: colors.success},
  gray: {bg: colors.graySoft, text: colors.textMuted},
};

function StatusBadge({label, variant = 'primary', style}) {
  const v = variants[variant] || variants.primary;
  return (
    <View style={[styles.badge, {backgroundColor: v.bg}, style]}>
      <Text style={[styles.text, {color: v.text}]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
  },
});

export default StatusBadge;
