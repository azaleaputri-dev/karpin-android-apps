import React, {useCallback, useEffect, useState} from 'react';
import {Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import StatusBadge from '../components/StatusBadge';
import {useAuth} from '../context/AuthContext';
import {createDevice, deleteDevice, fetchDevices, updateDevice} from '../services/mobileData';
import colors from '../theme/colors';
import {borderRadius, spacing} from '../theme/design';

function IoTDevicesScreen({navigation}) {
  const {token, user} = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formName, setFormName] = useState('');
  const [formToken, setFormToken] = useState('');
  const [formStatus, setFormStatus] = useState('active');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async isRefresh => {
    try { if (isRefresh) setRefreshing(true); else setLoading(true); const r = await fetchDevices(token); setList(r.data || []); }
    catch { setList([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, [token]);

  useEffect(() => {load(false);}, [load]);

  function openCreate() { setEditItem(null); setFormName(''); setFormToken(''); setFormStatus('active'); setShowForm(true); }

  function openEdit(item) { setEditItem(item); setFormName(item.device_name || ''); setFormToken(item.device_token || ''); setFormStatus(item.status || 'active'); setShowForm(true); }

  async function handleSave() {
    if (!formName.trim()) { Alert.alert('Lengkapi data', 'Nama perangkat wajib diisi.'); return; }
    try {
      setSaving(true);
      const payload = {device_name: formName.trim(), device_token: formToken.trim() || null, status: formStatus};
      if (editItem) await updateDevice(editItem.id, payload, token);
      else await createDevice(payload, token);
      setShowForm(false); setEditItem(null); load(false);
    } catch (e) { Alert.alert('Gagal', e.message); }
    finally { setSaving(false); }
  }

  function handleDelete(item) {
    Alert.alert('Hapus perangkat', `Hapus ${item.device_name}?`, [
      {text: 'Batal', style: 'cancel'},
      {text: 'Hapus', style: 'destructive', onPress: async () => {
        try { await deleteDevice(item.id, token); load(false); }
        catch (e) { Alert.alert('Gagal', e.message); }
      }},
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        contentContainerStyle={styles.content}
        data={list}
        keyExtractor={item => String(item.id)}
        ListEmptyComponent={!loading ? (
          <View style={styles.empty}><Ionicons name="hardware-chip-outline" size={56} color={colors.border} /><Text style={styles.emptyTitle}>Belum ada perangkat IoT</Text></View>
        ) : <View style={styles.empty}><Text style={styles.loadingText}>Memuat...</Text></View>}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Perangkat IoT</Text>
            </View>
            {user?.role === 'admin' ? (
              <Pressable onPress={openCreate} style={styles.addBtn}>
                <Ionicons name="add" size={20} color={colors.white} />
                <Text style={styles.addText}>Tambah Perangkat</Text>
              </Pressable>
            ) : null}
            {showForm ? (
              <Card padding="lg" style={styles.formCard}>
                <Text style={styles.formTitle}>{editItem ? 'Edit Perangkat' : 'Tambah Perangkat'}</Text>
                <TextInput onChangeText={setFormName} placeholder="Nama perangkat" placeholderTextColor={colors.placeholder} style={styles.input} value={formName} />
                <TextInput autoCapitalize="none" onChangeText={setFormToken} placeholder="Device token (opsional)" placeholderTextColor={colors.placeholder} style={[styles.input, {marginTop: spacing.sm}]} value={formToken} />
                <View style={styles.statusPicker}>
                  <Pressable onPress={() => setFormStatus('active')} style={[styles.statusBtn, formStatus === 'active' && styles.statusActive]}><Text style={[styles.statusBtnText, formStatus === 'active' && styles.statusBtnTextActive]}>Aktif</Text></Pressable>
                  <Pressable onPress={() => setFormStatus('inactive')} style={[styles.statusBtn, formStatus === 'inactive' && styles.statusInactive]}><Text style={[styles.statusBtnText, formStatus === 'inactive' && styles.statusBtnTextInactive]}>Nonaktif</Text></Pressable>
                </View>
                <View style={styles.formActions}>
                  <Pressable onPress={() => setShowForm(false)} style={styles.cancelBtn}><Text style={styles.cancelText}>Batal</Text></Pressable>
                  <PrimaryButton loading={saving} onPress={handleSave} style={styles.flexBtn}>{editItem ? 'Simpan' : 'Tambah'}</PrimaryButton>
                </View>
              </Card>
            ) : null}
          </View>
        }
        refreshControl={<RefreshControl colors={[colors.primary]} onRefresh={() => load(true)} refreshing={refreshing} />}
        renderItem={({item}) => (
          <Card padding="lg" style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.deviceIcon}><Ionicons name="hardware-chip" size={24} color={colors.white} /></View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.device_name || '-'}</Text>
                <Text style={styles.cardSub}>{item.device_token ? `Token: ${item.device_token.substring(0, 16)}...` : 'Token: -'}</Text>
              </View>
              <StatusBadge label={item.status === 'active' ? 'Aktif' : 'Nonaktif'} variant={item.status === 'active' ? 'success' : 'danger'} />
              {user?.role === 'admin' ? (
                <View style={styles.cardActions}>
                  <Pressable onPress={() => openEdit(item)} style={styles.actionBtn}><Ionicons name="create-outline" size={18} color={colors.primary} /></Pressable>
                  <Pressable onPress={() => handleDelete(item)} style={styles.actionBtn}><Ionicons name="trash-outline" size={18} color={colors.danger} /></Pressable>
                </View>
              ) : null}
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.xl, paddingBottom: spacing.xxl},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md},
  headerTitle: {fontSize: 20, fontWeight: '800', color: colors.text},
  addBtn: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, alignSelf: 'flex-start', marginBottom: spacing.md, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: 12, backgroundColor: colors.primary, shadowColor: colors.primary, shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3},
  addText: {color: colors.white, fontSize: 14, fontWeight: '800'},
  formCard: {marginBottom: spacing.lg},
  formTitle: {fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: spacing.md},
  input: {borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, paddingHorizontal: spacing.lg, paddingVertical: 14, fontSize: 15, color: colors.text, backgroundColor: colors.graySoft},
  statusPicker: {flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md},
  statusBtn: {flex: 1, borderRadius: borderRadius.lg, paddingVertical: 13, alignItems: 'center', justifyContent: 'center', minHeight: 48, backgroundColor: colors.graySoft},
  statusActive: {backgroundColor: colors.successSoft},
  statusInactive: {backgroundColor: colors.dangerSoft},
  statusBtnText: {fontSize: 14, fontWeight: '700', color: colors.textMuted},
  statusBtnTextActive: {color: colors.success},
  statusBtnTextInactive: {color: colors.danger},
  formActions: {flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg},
  cancelBtn: {flex: 1, borderRadius: borderRadius.lg, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', minHeight: 50, backgroundColor: colors.graySoft},
  cancelText: {fontSize: 15, fontWeight: '800', color: colors.textMuted},
  empty: {alignItems: 'center', paddingVertical: spacing.xxl * 2, gap: spacing.md},
  emptyTitle: {fontSize: 16, fontWeight: '800', color: colors.textMuted},
  loadingText: {color: colors.textMuted, fontSize: 14, fontWeight: '600'},
  card: {marginBottom: spacing.sm},
  cardTop: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  deviceIcon: {width: 44, height: 44, borderRadius: 14, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center'},
  cardBody: {flex: 1},
  cardTitle: {fontSize: 15, fontWeight: '700', color: colors.text},
  cardSub: {fontSize: 12, color: colors.textMuted, marginTop: 2},
  cardActions: {flexDirection: 'row', gap: spacing.sm},
  actionBtn: {width: 40, height: 40, borderRadius: borderRadius.sm, backgroundColor: colors.graySoft, justifyContent: 'center', alignItems: 'center'},
  flexBtn: {flex: 1},
});

export default IoTDevicesScreen;
