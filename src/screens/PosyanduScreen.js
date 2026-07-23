import React, {useCallback, useEffect, useState} from 'react';
import {Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import {useAuth} from '../context/AuthContext';
import {createPosyandu, deletePosyandu, fetchPosyandus, updatePosyandu} from '../services/mobileData';
import colors from '../theme/colors';
import {borderRadius, spacing} from '../theme/design';

function PosyanduScreen() {
  const {token, user} = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async isRefresh => {
    try { if (isRefresh) setRefreshing(true); else setLoading(true); const r = await fetchPosyandus(token); setList(r.data || []); }
    catch { setList([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, [token]);

  useEffect(() => {load(false);}, [load]);

  function openCreate() { setEditItem(null); setFormName(''); setFormAddress(''); setShowForm(true); }

  function openEdit(item) { setEditItem(item); setFormName(item.name || ''); setFormAddress(item.address || ''); setShowForm(true); }

  async function handleSave() {
    if (!formName.trim()) { Alert.alert('Lengkapi data', 'Nama posyandu wajib diisi.'); return; }
    try {
      setSaving(true);
      const payload = {name: formName.trim(), address: formAddress.trim() || null};
      if (editItem) await updatePosyandu(editItem.id, payload, token);
      else await createPosyandu(payload, token);
      setShowForm(false); setEditItem(null); load(false);
    } catch (e) { Alert.alert('Gagal', e.message); }
    finally { setSaving(false); }
  }

  function handleDelete(item) {
    Alert.alert('Hapus posyandu', `Hapus ${item.name}?`, [
      {text: 'Batal', style: 'cancel'},
      {text: 'Hapus', style: 'destructive', onPress: async () => {
        try { await deletePosyandu(item.id, token); load(false); }
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
          <View style={styles.empty}><Ionicons name="business-outline" size={56} color={colors.border} /><Text style={styles.emptyTitle}>Belum ada posyandu</Text></View>
        ) : <View style={styles.empty}><Text style={styles.loadingText}>Memuat...</Text></View>}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Posyandu</Text>
            </View>
            {user?.role === 'admin' ? (
              <Pressable onPress={openCreate} style={styles.addBtn}>
                <Ionicons name="add" size={20} color={colors.white} />
                <Text style={styles.addText}>Tambah Posyandu</Text>
              </Pressable>
            ) : null}
            {showForm ? (
              <Card padding="lg" style={styles.formCard}>
                <Text style={styles.formTitle}>{editItem ? 'Edit Posyandu' : 'Tambah Posyandu'}</Text>
                <TextInput onChangeText={setFormName} placeholder="Nama posyandu" placeholderTextColor={colors.placeholder} style={styles.input} value={formName} />
                <TextInput onChangeText={setFormAddress} placeholder="Alamat (opsional)" placeholderTextColor={colors.placeholder} style={[styles.input, {marginTop: spacing.sm}]} value={formAddress} />
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
            <View style={styles.cardRow}>
              <View style={styles.cardIcon}><Ionicons name="business" size={24} color={colors.white} /></View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.name || '-'}</Text>
                <Text style={styles.cardSub}>{item.address || '-'}</Text>
              </View>
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
  formActions: {flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg},
  cancelBtn: {flex: 1, borderRadius: borderRadius.lg, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', minHeight: 50, backgroundColor: colors.graySoft},
  cancelText: {fontSize: 15, fontWeight: '800', color: colors.textMuted},
  empty: {alignItems: 'center', paddingVertical: spacing.xxl * 2, gap: spacing.md},
  emptyTitle: {fontSize: 16, fontWeight: '800', color: colors.textMuted},
  loadingText: {color: colors.textMuted, fontSize: 14, fontWeight: '600'},
  card: {marginBottom: spacing.sm},
  cardRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  cardIcon: {width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center'},
  cardBody: {flex: 1},
  cardTitle: {fontSize: 15, fontWeight: '700', color: colors.text},
  cardSub: {fontSize: 12, color: colors.textMuted, marginTop: 2},
  cardActions: {flexDirection: 'row', gap: spacing.sm},
  actionBtn: {width: 40, height: 40, borderRadius: borderRadius.sm, backgroundColor: colors.graySoft, justifyContent: 'center', alignItems: 'center'},
  flexBtn: {flex: 1},
});

export default PosyanduScreen;
