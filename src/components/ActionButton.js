import {Pressable, StyleSheet, Text} from 'react-native';
import colors from '../theme/colors';

const variants = {
  edit: {bg: colors.infoSoft, text: colors.secondary},
  delete: {bg: colors.dangerSoft, text: colors.danger},
  primary: {bg: colors.primary, text: colors.white},
  ghost: {bg: colors.graySoft, text: colors.text},
};

function ActionButton({label, variant = 'ghost', onPress, style}) {
  const v = variants[variant] || variants.ghost;
  return (
    <Pressable onPress={onPress} style={[styles.button, {backgroundColor: v.bg}, style]}>
      <Text style={[styles.text, {color: v.text}]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  text: {
    fontSize: 13,
    fontWeight: '800',
  },
});

export default ActionButton;
