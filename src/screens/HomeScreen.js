import React from 'react';
import {Pressable, ScrollView, StatusBar, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Card from '../components/Card';
import LoadingView from '../components/LoadingView';
import {useAuth} from '../context/AuthContext';
import {roleContent} from '../data/karpinConfig';
import {fetchDashboard} from '../services/mobileData';
import colors from '../theme/colors';
import {borderRadius, spacing} from '../theme/design';
import {getRole, isReadOnlyViewer} from '../utils/permissions';

function HomeScreen({navigation}) {
  const {logout, token, user} = useAuth();
  const role = roleContent[getRole(user)] ? getRole(user) : 'admin';
  const currentRole = roleContent[role];
  const readOnlyViewer = isReadOnlyViewer(user);
  const scopeLabel = role === 'admin'
    ? 'Monitoring Puskesmas'
    : readOnlyViewer
      ? 'Dashboard Orang Tua'
      : `Petugas ${user?.posyandu?.name || 'Posyandu'}`;
  const [loading, setLoading] = React.useState(true);
  const [dashboard, setDashboard] = React.useState(null);
  const [errorMessage, setErrorMessage] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      try { setLoading(true); setErrorMessage(''); const r = await fetchDashboard(token); if (mounted) setDashboard(r); }
      catch (e) { if (mounted) setErrorMessage(e.message); }
      finally { if (mounted) setLoading(false); }
    }
    load();
    return () => {mounted = false;};
  }, [token]);

  const stats = role === 'admin'
    ? [
        {label: 'Posyandu', value: dashboard?.stats?.posyandus ?? '-', icon: 'business-outline', color: colors.primary},
        {label: 'Anak', value: dashboard?.stats?.children ?? '-', icon: 'people-outline', color: colors.secondary},
        {label: 'Bln Ini', value: dashboard?.stats?.measurements_this_month ?? '-', icon: 'calendar-outline', color: colors.warning},
        {label: 'Total', value: dashboard?.stats?.measurements ?? '-', icon: 'analytics-outline', color: colors.info},
      ]
    : readOnlyViewer
      ? [
          {label: 'Anak', value: dashboard?.stats?.children ?? '-', icon: 'people-outline', color: colors.primary},
          {label: 'Bln Ini', value: dashboard?.stats?.measurements_this_month ?? '-', icon: 'calendar-outline', color: colors.secondary},
          {label: 'Total', value: dashboard?.stats?.measurements ?? '-', icon: 'analytics-outline', color: colors.warning},
          {label: 'Tertaut', value: Array.isArray(dashboard?.children) ? dashboard.children.length : '-', icon: 'link-outline', color: colors.info},
        ]
      : [
          {label: 'Anak', value: dashboard?.stats?.children ?? '-', icon: 'people-outline', color: colors.primary},
          {label: 'Bln Ini', value: dashboard?.stats?.measurements_this_month ?? '-', icon: 'calendar-outline', color: colors.secondary},
          {label: 'Total', value: dashboard?.stats?.measurements ?? '-', icon: 'analytics-outline', color: colors.warning},
          {label: 'Aktif', value: dashboard?.stats?.posyandus ?? '-', icon: 'flag-outline', color: colors.info},
        ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.topLeft}>
            <View style={styles.appIconSmall}>
              <Ionicons name="heart-circle" size={28} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.appName}>Kartu Pintar</Text>
              <Text style={styles.scope}>{scopeLabel}</Text>
            </View>
          </View>
          <Pressable onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroDecor}>
            <Ionicons name="heart" size={80} color="rgba(255,255,255,0.08)" style={styles.heroDecor1} />
            <Ionicons name="medical" size={50} color="rgba(255,255,255,0.06)" style={styles.heroDecor2} />
          </View>
          <View style={styles.heroTop}>
            <View style={styles.heroAvatar}>
              <Ionicons name="person-circle" size={44} color={colors.white} />
            </View>
            <View style={styles.heroBadge}>
              <Ionicons name="shield-checkmark" size={12} color={colors.primary} />
              <Text style={styles.heroBadgeText}>{currentRole.badge}</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Halo, {user?.name || 'Pengguna'}</Text>
          <Text style={styles.heroDesc}>{currentRole.headline}</Text>
        </View>

        <View style={styles.statsRow}>
          {stats.map(item => (
            <View key={item.label} style={styles.statCard}>
              <View style={[styles.statIcon, {backgroundColor: item.color + '18'}]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHead}>
          <View style={styles.sectionLeft}>
            <View style={[styles.sectionDot, {backgroundColor: colors.primary}]} />
            <Text style={styles.sectionTitle}>Menu</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>
        <View style={styles.menuGrid}>
          {currentRole.navItems.map(item => (
            <Pressable key={item.title} onPress={() => {if (item.route) navigation.navigate(item.route);}}>
              <Card padding="lg" style={styles.menuCard}>
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon} size={22} color={colors.primary} />
                </View>
                <View style={styles.menuTextWrap}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSub}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.border} />
              </Card>
            </Pressable>
          ))}
        </View>

        {readOnlyViewer && Array.isArray(dashboard?.children) && dashboard.children.length > 0 ? (
          <>
            <View style={styles.sectionHead}>
              <View style={styles.sectionLeft}>
                <View style={[styles.sectionDot, {backgroundColor: colors.info}]} />
                <Text style={styles.sectionTitle}>Anak Tertaut</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </View>
            <View style={styles.menuGrid}>
              {dashboard.children.map(child => (
                <Pressable key={child.id} onPress={() => navigation.navigate('DataAnak', {screen: 'ChildDetail', params: {childId: child.id, title: child.child_name}})}>
                  <Card padding="lg" style={styles.menuCard}>
                    <View style={[styles.menuIcon, {backgroundColor: child.gender === 'L' ? colors.infoSoft : colors.purpleSoft}]}>
                      <Ionicons name={child.gender === 'L' ? 'man-outline' : 'woman-outline'} size={22} color={child.gender === 'L' ? colors.info : colors.purple} />
                    </View>
                    <View style={styles.menuTextWrap}>
                      <Text style={styles.menuTitle}>{child.child_name}</Text>
                      <Text style={styles.menuSub}>{child.posyandu_name || 'Posyandu'}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.border} />
                  </Card>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        <View style={styles.sectionHead}>
          <View style={styles.sectionLeft}>
            <View style={[styles.sectionDot, {backgroundColor: colors.secondary}]} />
            <Text style={styles.sectionTitle}>Pengukuran Terbaru</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>

        {loading ? <View style={styles.loadingBox}><LoadingView size="small" /></View> : null}
        {!loading && errorMessage ? (
          <Card padding="lg" style={styles.errorCard}>
            <Ionicons name="alert-circle" size={32} color={colors.danger} />
            <Text style={styles.errorTitle}>Gagal memuat</Text>
            <Text style={styles.errorDesc}>{errorMessage}</Text>
          </Card>
        ) : null}
        {!loading && !errorMessage && Array.isArray(dashboard?.latest_measurements) && dashboard.latest_measurements.length > 0
          ? dashboard.latest_measurements.map(item => (
              <Card key={`${item.id}`} padding="lg" style={styles.measCard}>
                <View style={styles.measAvatar}>
                  <Ionicons name="person" size={18} color={colors.white} />
                </View>
                <View style={styles.measBody}>
                  <Text style={styles.measName}>{item.child_name}</Text>
                  <Text style={styles.measDate}>{item.measured_at}</Text>
                </View>
                <View style={styles.measBadge}>
                  <Text style={styles.measValue}>{item.weight_kg} kg</Text>
                  <Text style={styles.measValue}>{item.height_cm} cm</Text>
                </View>
              </Card>
            ))
          : !loading && !errorMessage ? (
            <Card padding="xl" style={styles.emptyCard}>
              <Ionicons name="analytics-outline" size={48} color={colors.border} />
              <Text style={styles.emptyTitle}>Belum ada pengukuran</Text>
              <Text style={styles.emptyDesc}>Data akan muncul setelah pengukuran dicatat.</Text>
            </Card>
          ) : null}
        <View style={{height: spacing.xxl}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  scroll: {paddingBottom: spacing.xxl},
  topBar: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md, backgroundColor: colors.white},
  topLeft: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  appIconSmall: {width: 36, height: 36, borderRadius: 12, backgroundColor: colors.primarySoft, justifyContent: 'center', alignItems: 'center'},
  appName: {fontSize: 17, fontWeight: '800', color: colors.text},
  scope: {fontSize: 11, color: colors.textMuted, marginTop: 1},
  logoutBtn: {width: 40, height: 40, borderRadius: borderRadius.sm, backgroundColor: colors.graySoft, justifyContent: 'center', alignItems: 'center'},

  heroCard: {marginHorizontal: spacing.xl, marginTop: spacing.md, backgroundColor: colors.primary, borderRadius: 24, padding: spacing.xl, overflow: 'hidden'},
  heroDecor: {position: 'absolute', top: 0, right: 0, bottom: 0, left: 0},
  heroDecor1: {position: 'absolute', top: -20, right: -20},
  heroDecor2: {position: 'absolute', bottom: -10, right: 10},
  heroTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  heroAvatar: {},
  heroBadge: {flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.2)'},
  heroBadgeText: {fontSize: 12, fontWeight: '800', color: colors.white},
  heroTitle: {fontSize: 22, fontWeight: '800', color: colors.white, marginTop: spacing.lg},
  heroDesc: {fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: spacing.xs, lineHeight: 20},

  statsRow: {flexDirection: 'row', gap: 10, paddingHorizontal: spacing.xl, marginTop: spacing.lg},
  statCard: {flex: 1, backgroundColor: colors.white, borderRadius: 16, paddingVertical: spacing.lg, paddingHorizontal: spacing.sm, alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1},
  statIcon: {width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center'},
  statValue: {fontSize: 22, fontWeight: '800', color: colors.text, marginTop: spacing.sm},
  statLabel: {fontSize: 11, fontWeight: '700', color: colors.textMuted, marginTop: 2},

  sectionHead: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, marginTop: spacing.xxl, marginBottom: spacing.lg},
  sectionLeft: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  sectionDot: {width: 8, height: 8, borderRadius: 4},
  sectionTitle: {fontSize: 18, fontWeight: '800', color: colors.text},

  menuGrid: {gap: spacing.sm, paddingHorizontal: spacing.xl},
  menuCard: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  menuIcon: {width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primarySoft, justifyContent: 'center', alignItems: 'center'},
  menuTextWrap: {flex: 1},
  menuTitle: {fontSize: 15, fontWeight: '700', color: colors.text},
  menuSub: {fontSize: 12, color: colors.textMuted, marginTop: 2},

  loadingBox: {paddingVertical: spacing.xxl, alignItems: 'center'},
  errorCard: {marginHorizontal: spacing.xl, alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl},
  errorTitle: {fontSize: 15, fontWeight: '800', color: colors.text, marginTop: spacing.sm},
  errorDesc: {fontSize: 13, color: colors.textMuted, textAlign: 'center'},

  measCard: {flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginHorizontal: spacing.xl, marginBottom: spacing.sm},
  measAvatar: {width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center'},
  measBody: {flex: 1},
  measName: {fontSize: 15, fontWeight: '700', color: colors.text},
  measDate: {fontSize: 12, color: colors.textMuted, marginTop: 2},
  measBadge: {flexDirection: 'row', gap: spacing.sm},
  measValue: {fontSize: 12, fontWeight: '700', color: colors.primary},

  emptyCard: {marginHorizontal: spacing.xl, alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl},
  emptyTitle: {fontSize: 15, fontWeight: '800', color: colors.textMuted, marginTop: spacing.sm},
  emptyDesc: {fontSize: 13, color: colors.border, textAlign: 'center'},
});

export default HomeScreen;
