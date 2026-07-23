import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';

import colors from '../theme/colors';

function ChildCard({child, onPress, linkText = 'Buka detail anak'}) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Text style={styles.name}>{child.child_name}</Text>
      <Text style={styles.meta}>Serial: {child.rfid_serial || '-'} | UID: {child.rfid_uid || '-'}</Text>
      <Text style={styles.meta}>NIK: {child.nik || '-'}</Text>
      <Text style={styles.link}>{linkText}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  meta: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textMuted,
  },
  link: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
});

export default ChildCard;
