import React from 'react';
import {Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import FilterChip from '../components/FilterChip';
import StatusBadge from '../components/StatusBadge';
import {useAuth} from '../context/AuthContext';
import {deleteMeasurement, fetchMeasurements, fetchPosyandus} from '../services/mobileData';
import colors from '../theme/colors';
import {borderRadius, spacing} from '../theme/design';

function MeasurementsScreen({navigation}) {
  const {token, user} = useAuth();
  const [search, setSearch] = React.useState('');
  const [source, setSource] = React.useState('');
  const [posyanduId, setPosyanduId] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [measurements, setMeasurements] = React.useState([]);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [posyanduList, setPosyanduList] = React.useState([]);

  const loadPosyandus = React.useCallback(async () => {
    try { const r = await fetchPosyandus(token); setPosyanduList(r.data || []); }
    catch {}
  }, [token]);

  const loadMeasurements = React.useCallback(async isRefresh => {
    try {
      setErrorMessage('');
      if (isRefresh) setRefreshing(true); else setLoading(true);
      const params = {search: search.trim(), source};
      if (posyanduId) params.posyandu_id = posyanduId;
      const response = await fetchMeasurements(token, params);
      setMeasurements(response.data || []);
    } catch (error) { setErrorMessage(error.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, [search, source, posyanduId, token]);

  React.useEffect(() => {loadPosyandus(); loadMeasurements(false);}, [loadPosyandus, loadMeasurements]);

  const debouncedSearch = React.useRef(null);
  function handleSearch(text) {
    setSearch(text);
    if (debouncedSearch.current) clearTimeout(debouncedSearch.current);
    debouncedSearch.current = setTimeout(() => loadMeasurements(false), 400);
  }

  function handleDelete(id) {
    Alert.alert('Hapus pengukuran', 'Riwayat ini akan dihapus permanen. Lanjutkan?', [
      {text: 'Batal', style: 'cancel'},
      {text: 'Hapus', style: 'destructive', onPress: async () => {
        try { await deleteMeasurement(id, token); loadMeasurements(false); }
        catch (error) { Alert.alert('Gagal', error.message); }
      }},
    ]);
  }

  function renderItem({item}) {
    return (
      <Card padding="lg" style={styles.measCard}>
        <View style={styles.measTop}>
          <View style={styles.measAvatar}>
            <Ionicons name="person" size={18} color={colors.white} />
          </View>
          <View style={styles.measInfo}>
            <Text style={styles.measName}>{item.child?.child_name || 'Tanpa nama'}</Text>
            <Text style={styles.measPosyandu}>{item.child?.posyandu_name || '-'}</Text>
          </View>
          <StatusBadge label={String(item.source).toUpperCase()} variant={item.source === 'iot' ? 'info' : 'purple'} />
        </View>
        <View style={styles.measPills}>
          <View style={[styles.pill, {backgroundColor: colors.primarySoft}]}>
            <Ionicons name="scale-outline" size={14} color={colors.primary} />
            <Text style={styles.pillText}>{item.weight_kg} kg</Text>
          </View>
          <View style={[styles.pill, {backgroundColor: colors.infoSoft}]}>
            <Ionicons name="resize-outline" size={14} color={colors.info} />
            <Text style={styles.pillText}>{item.height_cm} cm</Text>
          </View>
          <View style={[styles.pill, {backgroundColor: colors.warning + '20'}]}>
            <Ionicons name="thermometer-outline" size={14} color={colors.warning} />
            <Text style={styles.pillText}>{item.temperature_c !== null ? `${item.temperature_c}°C` : '-'}</Text>
          </View>
        </View>
        <Text style={styles.measDate}>{item.measured_at || '-'}</Text>
          {user?.role ? (
          <View style={styles.actionRow}>
            <Pressable onPress={() =>
              navigation.navigate('DataAnak', {
                screen: 'CreateMeasurement',
                params: {child: {id: item.child?.id, child_name: item.child?.child_name}, devices: item.device ? [{id: item.device.id, device_name: item.device.device_name}] : [], measurement: {...item, device_id: item.device?.id || null}},
              })
            } style={styles.actionBtn}>
              <Ionicons name="create-outline" size={16} color={colors.primary} />
              <Text style={styles.actionBtnText}>Edit</Text>
            </Pressable>
            <Pressable onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
              <Ionicons name="trash-outline" size={16} color={colors.danger} />
              <Text style={[styles.actionBtnText, {color: colors.danger}]}>Hapus</Text>
            </Pressable>
          </View>
        ) : null}
      </Card>
    );
  }

  const hasFilters = search || source || posyanduId;

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        contentContainerStyle={styles.content}
        data={measurements}
        keyExtractor={item => String(item.id)}
        ListEmptyComponent={loading ? null : (
          <View style={styles.emptyWrap}>
            <Ionicons name="analytics-outline" size={56} color={colors.border} />
            <EmptyState title={errorMessage || 'Belum ada pengukuran'} description={errorMessage || 'Belum ada data.'} />
          </View>
        )}
        ListHeaderComponent={
          <View>
            <View style={styles.headerSection}>
              <Text style={styles.headerTitle}>Riwayat Pengukuran</Text>
              {user?.role ? (
                <Pressable onPress={() => navigation.navigate('DataAnak', {screen: 'CreateMeasurement'})} style={styles.addBtn}>
                  <Ionicons name="add" size={18} color={colors.white} />
                  <Text style={styles.addBtnText}>Tambah</Text>
                </Pressable>
              ) : null}
            </View>
            <View style={styles.searchSection}>
              <View style={styles.searchWrap}>
                <Ionicons name="search-outline" size={18} color={colors.textMuted} />
                <TextInput
                  onChangeText={handleSearch}
                  placeholder="Cari nama anak"
                  placeholderTextColor={colors.placeholder}
                  style={styles.searchInput}
                  value={search}
                />
                {search ? (
                  <Pressable onPress={() => {setSearch(''); loadMeasurements(false);}}>
                    <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                  </Pressable>
                ) : null}
              </View>
              <View style={styles.filterRow}>
                <FilterChip active={source === ''} label="Semua" onPress={() => setSource('')} />
                <FilterChip active={source === 'manual'} icon="create-outline" label="Manual" onPress={() => setSource('manual')} />
                <FilterChip active={source === 'iot'} icon="hardware-chip-outline" label="IoT" onPress={() => setSource('iot')} />
                {hasFilters ? (
                  <Pressable onPress={() => {setSearch(''); setSource(''); setPosyanduId('');}} style={styles.resetBtn}>
                    <Ionicons name="refresh" size={14} color={colors.text} />
                    <Text style={styles.resetText}>Reset</Text>
                  </Pressable>
                ) : null}
              </View>
              {posyanduList.length > 0 ? (
                <View style={styles.posyanduRow}>
                  <FilterChip active={posyanduId === ''} label="Semua Posyandu" onPress={() => setPosyanduId('')} />
                  {posyanduList.map(p => (
                    <FilterChip key={p.id} active={String(posyanduId) === String(p.id)} icon="business-outline" label={p.name} onPress={() => setPosyanduId(String(p.id))} />
                  ))}
                </View>
              ) : null}
            </View>
            {loading ? <View style={styles.loadingWrap}><Text style={styles.loadingText}>Memuat...</Text></View> : null}
          </View>
        }
        refreshControl={<RefreshControl colors={[colors.primary]} onRefresh={() => loadMeasurements(true)} refreshing={refreshing} tintColor={colors.primary} />}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.xl, paddingBottom: spacing.xxl},
  emptyWrap: {alignItems: 'center', paddingTop: spacing.xxl, gap: spacing.md},
  headerSection: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md},
  headerTitle: {fontSize: 20, fontWeight: '800', color: colors.text},
  addBtn: {flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: 11, backgroundColor: colors.primary, shadowColor: colors.primary, shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3},
  addBtnText: {color: colors.white, fontSize: 14, fontWeight: '800'},
  searchSection: {marginBottom: spacing.md},
  searchWrap: {flexDirection: 'row', alignItems: 'center', backgroundColor: colors.graySoft, borderRadius: borderRadius.lg, paddingHorizontal: spacing.lg, gap: spacing.sm},
  searchInput: {flex: 1, paddingVertical: 14, fontSize: 14, color: colors.text},
  filterRow: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md, alignItems: 'center'},
  posyanduRow: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm},
  resetBtn: {flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.graySoft},
  resetText: {fontSize: 12, fontWeight: '800', color: colors.text},
  loadingWrap: {paddingVertical: spacing.xl},
  loadingText: {textAlign: 'center', color: colors.textMuted, fontSize: 14, fontWeight: '600'},
  measCard: {marginBottom: spacing.sm},
  measTop: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  measAvatar: {width: 36, height: 36, borderRadius: 10, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center'},
  measInfo: {flex: 1},
  measName: {fontSize: 15, fontWeight: '800', color: colors.text},
  measPosyandu: {fontSize: 11, color: colors.textMuted, marginTop: 1},
  measPills: {flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md},
  pill: {flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 8},
  pillText: {fontSize: 13, fontWeight: '700', color: colors.text},
  measDate: {marginTop: spacing.sm, fontSize: 12, color: colors.textMuted},
  actionRow: {flexDirection: 'row', gap: spacing.md, marginTop: spacing.md},
  actionBtn: {flexDirection: 'row', alignItems: 'center', gap: 4},
  actionBtnText: {fontSize: 13, fontWeight: '700', color: colors.primary},
});

export default MeasurementsScreen;
