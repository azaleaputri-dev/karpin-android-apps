import {StyleSheet, Text, View} from 'react-native';
import colors from '../theme/colors';
import {spacing} from '../theme/design';

function SectionHeader({title, subtitle, style}) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {marginBottom: spacing.md, marginTop: spacing.xxl},
  title: {fontSize: 18, fontWeight: '800', color: colors.text},
  subtitle: {marginTop: spacing.xs, fontSize: 13, color: colors.textMuted, lineHeight: 18, maxWidth: '90%'},
});

export default SectionHeader;
