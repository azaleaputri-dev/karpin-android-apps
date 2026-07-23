import React, {useCallback, useState} from 'react';
import {Pressable, RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Card from '../components/Card';
import {useAuth} from '../context/AuthContext';
import {fetchCurrentUser} from '../services/auth';
import colors from '../theme/colors';
import {spacing} from '../theme/design';

function ProfileScreen() {
  const {token, user, logout} = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [profileUser, setProfileUser] = useState(user);

  const refresh = useCallback(async () => {
    try { setRefreshing(true); const r = await fetchCurrentUser(token); setProfileUser(r.user); }
    catch {} finally { setRefreshing(false); }
  }, [token]);

  const u = profileUser || user;
  const roleLabel = u?.role === 'admin' ? 'Admin Puskesmas' : u?.role === 'orangtua' ? 'Orang Tua' : 'Petugas Posyandu';
  const infoRows = [
    {icon: 'mail-outline', label: 'Email', value: u?.email || '-'},
    {icon: 'shield-checkmark-outline', label: 'Role', value: roleLabel},
    {icon: 'business-outline', label: 'Posyandu', value: u?.posyandu?.name || '-'},
    {icon: 'map-outline', label: 'Alamat', value: u?.posyandu?.address || '-'},
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl colors={[colors.primary]} onRefresh={refresh} refreshing={refreshing} tintColor={colors.primary} />}>
        <View style={styles.profileHero}>
          <View style={styles.profileDecor}>
            <Ionicons name="person" size={80} color="rgba(255,255,255,0.06)" />
          </View>
          <View style={styles.avatarWrap}>
            <Ionicons name="person-circle" size={72} color={colors.white} />
          </View>
          <Text style={styles.profileName}>{u?.name || 'Pengguna'}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
            <Text style={styles.roleText}>{roleLabel}</Text>
          </View>
        </View>

        <Card padding="xl" style={styles.infoCard}>
          <Text style={styles.infoSectionTitle}>Informasi Akun</Text>
          <View style={styles.infoGrid}>
            {infoRows.map(row => (
              <View key={row.label} style={styles.infoRow}>
                <Ionicons name={row.icon} size={18} color={colors.primary} />
                <View style={styles.infoBody}>
                  <Text style={styles.infoLabel}>{row.label}</Text>
                  <Text style={styles.infoValue}>{row.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        <Card padding="xl" style={styles.aboutCard}>
          <Text style={styles.infoSectionTitle}>Tentang Aplikasi</Text>
          <View style={styles.aboutRow}>
            <Ionicons name="information-circle-outline" size={18} color={colors.textMuted} />
            <Text style={styles.aboutLabel}>Versi</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Ionicons name="construct-outline" size={18} color={colors.textMuted} />
            <Text style={styles.aboutLabel}>Aplikasi</Text>
            <Text style={styles.aboutValue}>Kartu Pintar Posyandu</Text>
          </View>
        </Card>

        <Pressable onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Keluar</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  scroll: {padding: spacing.xl, paddingBottom: spacing.xxl},
  profileHero: {backgroundColor: colors.primary, borderRadius: 24, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.lg, overflow: 'hidden'},
  profileDecor: {position: 'absolute', top: -10, right: -10},
  avatarWrap: {width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md},
  profileName: {fontSize: 22, fontWeight: '800', color: colors.white},
  roleBadge: {flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.2)'},
  roleText: {fontSize: 13, fontWeight: '700', color: colors.white},
  infoCard: {marginBottom: spacing.md},
  infoSectionTitle: {fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: spacing.lg},
  infoGrid: {gap: spacing.lg},
  infoRow: {flexDirection: 'row', gap: spacing.md, alignItems: 'center'},
  infoBody: {flex: 1},
  infoLabel: {fontSize: 12, color: colors.textMuted},
  infoValue: {fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 2},
  aboutCard: {marginBottom: spacing.xl},
  aboutRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.md},
  aboutLabel: {flex: 1, fontSize: 14, color: colors.textMuted},
  aboutValue: {fontSize: 14, fontWeight: '700', color: colors.text},
  logoutBtn: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderRadius: 18, paddingVertical: 15, backgroundColor: colors.dangerSoft},
  logoutText: {fontSize: 15, fontWeight: '800', color: colors.danger},
});

export default ProfileScreen;
