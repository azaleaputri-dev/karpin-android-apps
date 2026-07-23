import React from 'react';
import {Alert, RefreshControl, ScrollView, StyleSheet, Text, View, Pressable} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LoadingView from '../components/LoadingView';
import StatusBadge from '../components/StatusBadge';
import {useAuth} from '../context/AuthContext';
import {deleteChild, deleteMeasurement, fetchChildDetail} from '../services/mobileData';
import colors from '../theme/colors';
import {borderRadius, spacing} from '../theme/design';

function ChildDetailScreen({navigation, route}) {
  const {token, user} = useAuth();
  const childId = route.params?.childId;
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [payload, setPayload] = React.useState(null);
  const [errorMessage, setErrorMessage] = React.useState('');

  const loadDetail = React.useCallback(async isRefresh => {
    try {
      setErrorMessage('');
      if (isRefresh) setRefreshing(true); else setLoading(true);
      const response = await fetchChildDetail(childId, token);
      setPayload(response);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [childId, token]);

  React.useEffect(() => {loadDetail(false);}, [loadDetail, route.params?.refreshAt]);

  const child = payload?.child;
  const summary = payload?.summary;
  const nutrition = payload?.nutrition_status;
  const measurements = payload?.measurements || [];

  function handleDeleteChild() {
    Alert.alert('Hapus data anak', 'Data anak ini akan dihapus permanen. Lanjutkan?', [
      {text: 'Batal', style: 'cancel'},
      {text: 'Hapus', style: 'destructive', onPress: async () => {
        try { await deleteChild(child.id, token); navigation.replace('ChildrenList', {refreshAt: Date.now()}); }
        catch (error) { Alert.alert('Gagal', error.message); }
      }},
    ]);
  }

  function handleDeleteMeasurement(mId) {
    Alert.alert('Hapus pengukuran', 'Riwayat ini akan dihapus permanen. Lanjutkan?', [
      {text: 'Batal', style: 'cancel'},
      {text: 'Hapus', style: 'destructive', onPress: async () => {
        try { await deleteMeasurement(mId, token); loadDetail(false); }
        catch (error) { Alert.alert('Gagal', error.message); }
      }},
    ]);
  }

  if (loading) return <SafeAreaView style={styles.safe}><LoadingView /></SafeAreaView>;
  if (errorMessage) return <SafeAreaView style={styles.safe}><EmptyState title="Detail anak belum tampil" description={errorMessage} /></SafeAreaView>;
  if (!child) return null;

  const infoRows = [
    {icon: 'business-outline', label: 'Posyandu', value: child.posyandu?.name || '-'},
    {icon: 'calendar-outline', label: 'Usia', value: `${child.birth_age_years || 0} tahun`},
    {icon: 'card-outline', label: 'NIK', value: child.nik || '-'},
    {icon: 'key-outline', label: 'Serial NFC', value: child.rfid_serial || '-'},
    {icon: 'id-card-outline', label: 'UID', value: child.rfid_uid || '-'},
    {icon: 'person-outline', label: 'Ibu', value: child.mother_name || '-'},
  ];

  const snapshots = [
    {icon: 'scale-outline', label: 'Berat', value: summary?.latest_weight != null ? `${summary?.latest_weight} kg` : '-', bg: colors.primarySoft, clr: colors.primary},
    {icon: 'resize-outline', label: 'Tinggi', value: summary?.latest_height != null ? `${summary?.latest_height} cm` : '-', bg: colors.infoSoft, clr: colors.info},
    {icon: 'trending-up-outline', label: 'Naik BB', value: summary?.weight_gain != null ? `${summary?.weight_gain} kg` : '-', bg: colors.successSoft, clr: colors.success},
    {icon: 'trending-up-outline', label: 'Naik TB', value: summary?.height_gain != null ? `${summary?.height_gain} cm` : '-', bg: colors.purpleSoft, clr: colors.purple},
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl colors={[colors.primary]} onRefresh={() => loadDetail(true)} refreshing={refreshing} tintColor={colors.primary} />}>
        <View style={styles.profileHero}>
          <View style={styles.profileDecor}>
            <Ionicons name="happy" size={72} color="rgba(255,255,255,0.08)" />
          </View>
          <View style={styles.profileRow}>
            <View style={[styles.profileAvatar, {backgroundColor: child.gender === 'L' ? colors.info : colors.purple}]}>
              <Ionicons name={child.gender === 'L' ? 'man' : 'woman'} size={32} color={colors.white} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{child.child_name}</Text>
              <Text style={styles.profileUid}>Serial: {child.rfid_serial || '-'} | UID: {child.rfid_uid || '-'}</Text>
            </View>
            <StatusBadge label={child.gender === 'L' ? 'Laki-laki' : 'Perempuan'} />
          </View>
          <View style={styles.profileMeta}>
            {infoRows.map(row => (
              <View key={row.label} style={styles.profileMetaItem}>
                <Ionicons name={row.icon} size={13} color="rgba(255,255,255,0.7)" />
                <Text style={styles.profileMetaLabel}>{row.label}</Text>
                <Text style={styles.profileMetaValue}>{row.value}</Text>
              </View>
            ))}
          </View>
          {user?.role ? (
            <View style={styles.profileActions}>
              <Pressable onPress={() => navigation.navigate('CreateChild', {child})} style={styles.profileActionBtn}>
                <Ionicons name="create-outline" size={16} color={colors.white} />
                <Text style={styles.profileActionText}>Edit</Text>
              </Pressable>
              <Pressable onPress={handleDeleteChild} style={[styles.profileActionBtn, styles.profileActionBtnDanger]}>
                <Ionicons name="trash-outline" size={16} color={colors.white} />
                <Text style={styles.profileActionText}>Hapus</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View style={styles.sectionHead}>
          <View style={styles.sectionDot} />
          <Text style={styles.sectionTitle}>Status Gizi</Text>
        </View>
        <Card padding="lg" style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusIconWrap}>
              <Ionicons name="nutrition-outline" size={28} color={colors.primary} />
            </View>
            <View style={styles.statusBody}>
              <Text style={styles.statusValue}>{nutrition?.overall || 'Belum ada data'}</Text>
              {nutrition?.note ? <Text style={styles.statusNote}>{nutrition.note}</Text> : null}
            </View>
          </View>
        </Card>

        <View style={styles.sectionHead}>
          <View style={[styles.sectionDot, {backgroundColor: colors.secondary}]} />
          <Text style={styles.sectionTitle}>Snapshoot Terkini</Text>
        </View>
        <View style={styles.snapshotGrid}>
          {snapshots.map(item => (
            <View key={item.label} style={[styles.snapshotCard, {backgroundColor: item.bg}]}>
              <Ionicons name={item.icon} size={22} color={item.clr} />
              <Text style={styles.snapshotValue}>{item.value}</Text>
              <Text style={styles.snapshotLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHead}>
          <View style={[styles.sectionDot, {backgroundColor: colors.warning}]} />
          <Text style={styles.sectionTitle}>Timeline Pengukuran</Text>
          <Text style={styles.sectionSub}>{summary?.total_measurements || 0} data</Text>
        </View>

        {user?.role ? (
          <Pressable onPress={() => navigation.navigate('CreateMeasurement', {child, devices: payload?.devices || []})} style={styles.addMeasBtn}>
            <Ionicons name="add-circle" size={20} color={colors.white} />
            <Text style={styles.addMeasText}>Tambah Pengukuran</Text>
          </Pressable>
        ) : null}

        {measurements.length === 0 ? (
          <View style={styles.emptyMeas}>
            <Ionicons name="analytics-outline" size={48} color={colors.border} />
            <Text style={styles.emptyMeasTitle}>Riwayat masih kosong</Text>
            <Text style={styles.emptyMeasDesc}>Belum ada pengukuran.</Text>
          </View>
        ) : (
          measurements.map(item => (
            <Card key={item.id} padding="lg" style={styles.measCard}>
              <View style={styles.measHead}>
                <Ionicons name="calendar" size={14} color={colors.textMuted} />
                <Text style={styles.measDate}>{item.measured_at}</Text>
                <StatusBadge label={String(item.source).toUpperCase()} variant={item.source === 'iot' ? 'info' : 'purple'} />
              </View>
              <View style={styles.measBody}>
                <View style={styles.pill}><Ionicons name="scale-outline" size={14} color={colors.primary} /><Text style={styles.pillText}>{item.weight_kg} kg</Text></View>
                <View style={styles.pill}><Ionicons name="resize-outline" size={14} color={colors.secondary} /><Text style={styles.pillText}>{item.height_cm} cm</Text></View>
                <View style={styles.pill}><Ionicons name="thermometer-outline" size={14} color={colors.warning} /><Text style={styles.pillText}>{item.temperature_c != null ? `${item.temperature_c}°C` : '-'}</Text></View>
              </View>
              {item.notes ? <Text style={styles.measNote}>{item.notes}</Text> : null}
              {user?.role ? (
                <View style={styles.measActions}>
                  <Pressable onPress={() => navigation.navigate('CreateMeasurement', {child, devices: payload?.devices || [], measurement: item})} style={styles.measActionBtn}>
                    <Ionicons name="create-outline" size={14} color={colors.primary} />
                    <Text style={styles.measActionText}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => handleDeleteMeasurement(item.id)} style={styles.measActionBtn}>
                    <Ionicons name="trash-outline" size={14} color={colors.danger} />
                    <Text style={[styles.measActionText, {color: colors.danger}]}>Hapus</Text>
                  </Pressable>
                </View>
              ) : null}
            </Card>
          ))
        )}
        <View style={{height: spacing.xxl}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  scroll: {padding: spacing.xl, paddingBottom: 0},
  profileHero: {backgroundColor: colors.primary, borderRadius: 24, padding: spacing.xl, overflow: 'hidden', marginBottom: spacing.md},
  profileDecor: {position: 'absolute', bottom: -10, right: -10, opacity: 0.5},
  profileRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  profileAvatar: {width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center'},
  profileInfo: {flex: 1},
  profileName: {fontSize: 20, fontWeight: '800', color: colors.white},
  profileUid: {fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2},
  profileMeta: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg},
  profileMetaItem: {flexDirection: 'row', alignItems: 'center', gap: 6, width: '47%'},
  profileMetaLabel: {fontSize: 12, color: 'rgba(255,255,255,0.6)', flex: 1},
  profileMetaValue: {fontSize: 12, fontWeight: '700', color: colors.white},
  profileActions: {flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg},
  profileActionBtn: {flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.2)'},
  profileActionBtnDanger: {backgroundColor: 'rgba(255,255,255,0.12)'},
  profileActionText: {fontSize: 14, fontWeight: '800', color: colors.white},
  sectionHead: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xxl, marginBottom: spacing.md},
  sectionDot: {width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary},
  sectionTitle: {fontSize: 18, fontWeight: '800', color: colors.text, flex: 1},
  sectionSub: {fontSize: 13, color: colors.textMuted},
  statusCard: {},
  statusRow: {flexDirection: 'row', gap: spacing.md, alignItems: 'center'},
  statusIconWrap: {width: 48, height: 48, borderRadius: 16, backgroundColor: colors.primarySoft, justifyContent: 'center', alignItems: 'center'},
  statusBody: {flex: 1},
  statusValue: {fontSize: 20, fontWeight: '800', color: colors.text},
  statusNote: {marginTop: spacing.sm, fontSize: 13, lineHeight: 18, color: colors.textMuted},
  snapshotGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm},
  snapshotCard: {flex: 1, minWidth: 80, padding: spacing.lg, borderRadius: 16, gap: spacing.sm},
  snapshotValue: {fontSize: 18, fontWeight: '800', color: colors.text},
  snapshotLabel: {fontSize: 12, color: colors.textMuted},
  addMeasBtn: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, alignSelf: 'flex-start', marginBottom: spacing.md, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: 12, backgroundColor: colors.primary, shadowColor: colors.primary, shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3},
  addMeasText: {color: colors.white, fontSize: 14, fontWeight: '800'},
  emptyMeas: {alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm},
  emptyMeasTitle: {fontSize: 15, fontWeight: '800', color: colors.textMuted, marginTop: spacing.sm},
  emptyMeasDesc: {fontSize: 13, color: colors.border},
  measCard: {marginBottom: spacing.sm},
  measHead: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  measDate: {flex: 1, fontSize: 14, fontWeight: '700', color: colors.text},
  measBody: {flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap'},
  pill: {flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 8, backgroundColor: colors.graySoft},
  pillText: {fontSize: 13, fontWeight: '700', color: colors.text},
  measNote: {marginTop: spacing.md, fontSize: 13, lineHeight: 20, color: colors.textMuted},
  measActions: {flexDirection: 'row', gap: spacing.md, marginTop: spacing.md},
  measActionBtn: {flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: borderRadius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.graySoft},
  measActionText: {fontSize: 13, fontWeight: '800', color: colors.primary},
});

export default ChildDetailScreen;
