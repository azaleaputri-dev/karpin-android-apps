import React, {useCallback, useEffect, useState} from 'react';
import {Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import {useAuth} from '../context/AuthContext';
import {createUser, deleteUser, fetchChildren, fetchPosyandus, fetchUsers, updateUser} from '../services/mobileData';
import colors from '../theme/colors';
import {borderRadius, spacing} from '../theme/design';

function UserManagementScreen() {
  const {token, user} = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('petugas');
  const [formPosyanduId, setFormPosyanduId] = useState('');
  const [formChildIds, setFormChildIds] = useState([]);
  const [childOptions, setChildOptions] = useState([]);
  const [posyanduOptions, setPosyanduOptions] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async isRefresh => {
    try { if (isRefresh) setRefreshing(true); else setLoading(true); const r = await fetchUsers(token); setList(r.data || []); }
    catch { setList([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, [token]);

  const loadChildOptions = useCallback(async () => {
    try { const r = await fetchChildren(token); setChildOptions(r.data || []); }
    catch { setChildOptions([]); }
  }, [token]);

  const loadPosyanduOptions = useCallback(async () => {
    try { const r = await fetchPosyandus(token); setPosyanduOptions(r.data || []); }
    catch { setPosyanduOptions([]); }
  }, [token]);

  useEffect(() => {load(false); loadChildOptions(); loadPosyanduOptions();}, [load, loadChildOptions, loadPosyanduOptions]);

  function openCreate() { setEditItem(null); setFormName(''); setFormEmail(''); setFormPassword(''); setFormRole('petugas'); setFormPosyanduId(''); setFormChildIds([]); setShowForm(true); }

  function openEdit(item) {
    setEditItem(item);
    setFormName(item.name || '');
    setFormEmail(item.email || '');
    setFormPassword('');
    setFormRole(item.role || 'petugas');
    setFormPosyanduId(item.posyandu?.id ? String(item.posyandu.id) : '');
    setFormChildIds((item.children || []).map(child => Number(child.id)));
    setShowForm(true);
  }

  function toggleChild(childId) {
    setFormChildIds(current => current.includes(childId) ? current.filter(id => id !== childId) : [...current, childId]);
  }

  async function handleSave() {
    if (!formName.trim() || !formEmail.trim()) { Alert.alert('Lengkapi data', 'Nama dan email wajib diisi.'); return; }
    if (formRole === 'petugas' && !formPosyanduId) { Alert.alert('Pilih posyandu', 'Akun petugas harus dihubungkan ke satu posyandu.'); return; }
    if (formRole === 'orangtua' && formChildIds.length === 0) { Alert.alert('Pilih anak', 'Akun orang tua harus ditautkan minimal ke satu anak.'); return; }
    try {
      setSaving(true);
      const payload = {
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
        posyandu_id: formRole === 'petugas' ? formPosyanduId : null,
        child_ids: formRole === 'orangtua' ? formChildIds : [],
      };
      if (!editItem) payload.password = formPassword || 'password';
      if (editItem) await updateUser(editItem.id, payload, token);
      else await createUser(payload, token);
      setShowForm(false); setEditItem(null); load(false);
    } catch (e) { Alert.alert('Gagal', e.message); }
    finally { setSaving(false); }
  }

  function handleDelete(item) {
    Alert.alert('Hapus user', `Hapus ${item.name}?`, [
      {text: 'Batal', style: 'cancel'},
      {text: 'Hapus', style: 'destructive', onPress: async () => {
        try { await deleteUser(item.id, token); load(false); }
        catch (e) { Alert.alert('Gagal', e.message); }
      }},
    ]);
  }

  const roleIcon = r => r === 'admin' ? 'shield-checkmark' : r === 'orangtua' ? 'people-circle' : 'person';
  const roleColor = r => r === 'admin' ? colors.primary : r === 'orangtua' ? colors.purple : colors.info;
  const roleBg = r => r === 'admin' ? colors.primarySoft : r === 'orangtua' ? colors.purpleSoft : colors.infoSoft;

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        contentContainerStyle={styles.content}
        data={list}
        keyExtractor={item => String(item.id)}
        ListEmptyComponent={!loading ? (
          <View style={styles.empty}><Ionicons name="people-outline" size={56} color={colors.border} /><Text style={styles.emptyTitle}>Belum ada user</Text></View>
        ) : <View style={styles.empty}><Text style={styles.loadingText}>Memuat...</Text></View>}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Manajemen User</Text>
            </View>
            {user?.role === 'admin' ? (
              <Pressable onPress={openCreate} style={styles.addBtn}>
                <Ionicons name="add" size={20} color={colors.white} />
                <Text style={styles.addText}>Tambah User</Text>
              </Pressable>
            ) : null}
            {showForm ? (
              <Card padding="lg" style={styles.formCard}>
                <Text style={styles.formTitle}>{editItem ? 'Edit User' : 'Tambah User'}</Text>
                <TextInput onChangeText={setFormName} placeholder="Nama" placeholderTextColor={colors.placeholder} style={styles.input} value={formName} />
                <TextInput autoCapitalize="none" keyboardType="email-address" onChangeText={setFormEmail} placeholder="Email" placeholderTextColor={colors.placeholder} style={[styles.input, {marginTop: spacing.sm}]} value={formEmail} />
                {!editItem ? <TextInput autoCapitalize="none" onChangeText={setFormPassword} placeholder="Password" placeholderTextColor={colors.placeholder} secureTextEntry style={[styles.input, {marginTop: spacing.sm}]} value={formPassword} /> : null}
                <View style={styles.rolePicker}>
                  <Pressable onPress={() => setFormRole('admin')} style={[styles.roleBtn, formRole === 'admin' && styles.roleActive]}><Text style={[styles.roleText, formRole === 'admin' && styles.roleTextActive]}>Admin</Text></Pressable>
                  <Pressable onPress={() => setFormRole('petugas')} style={[styles.roleBtn, formRole === 'petugas' && styles.roleActive]}><Text style={[styles.roleText, formRole === 'petugas' && styles.roleTextActive]}>Petugas</Text></Pressable>
                  <Pressable onPress={() => setFormRole('orangtua')} style={[styles.roleBtn, formRole === 'orangtua' && styles.roleActive]}><Text style={[styles.roleText, formRole === 'orangtua' && styles.roleTextActive]}>Orangtua</Text></Pressable>
                </View>
                {formRole === 'petugas' ? (
                  <View style={styles.childPicker}>
                    <Text style={styles.childPickerTitle}>Posyandu petugas</Text>
                    {posyanduOptions.map(posyandu => {
                      const active = String(formPosyanduId) === String(posyandu.id);
                      return (
                        <Pressable key={posyandu.id} onPress={() => setFormPosyanduId(String(posyandu.id))} style={[styles.childOption, active && styles.childOptionActive]}>
                          <Ionicons name={active ? 'radio-button-on' : 'radio-button-off'} size={18} color={active ? colors.primary : colors.textMuted} />
                          <View style={styles.childOptionBody}>
                            <Text style={styles.childOptionName}>{posyandu.name}</Text>
                            <Text style={styles.childOptionMeta}>{posyandu.address || '-'}</Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
                {formRole === 'orangtua' ? (
                  <View style={styles.childPicker}>
                    <Text style={styles.childPickerTitle}>Anak yang bisa dilihat</Text>
                    {childOptions.length === 0 ? (
                      <Text style={styles.childEmpty}>Belum ada data anak.</Text>
                    ) : childOptions.map(child => {
                      const active = formChildIds.includes(Number(child.id));
                      return (
                        <Pressable key={child.id} onPress={() => toggleChild(Number(child.id))} style={[styles.childOption, active && styles.childOptionActive]}>
                          <Ionicons name={active ? 'checkbox' : 'square-outline'} size={18} color={active ? colors.primary : colors.textMuted} />
                          <View style={styles.childOptionBody}>
                            <Text style={styles.childOptionName}>{child.child_name}</Text>
                            <Text style={styles.childOptionMeta}>{child.posyandu?.name || child.posyandu_name || '-'}</Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
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
              <View style={[styles.avatar, {backgroundColor: roleBg(item.role)}]}>
                <Ionicons name={roleIcon(item.role)} size={22} color={roleColor(item.role)} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.name || '-'}</Text>
                <Text style={styles.cardSub}>{item.email || '-'}</Text>
              </View>
              <View style={[styles.roleTag, {backgroundColor: roleBg(item.role)}]}>
                <Text style={[styles.roleTagText, {color: roleColor(item.role)}]}>{item.role || '-'}</Text>
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
  rolePicker: {flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md},
  roleBtn: {flex: 1, borderRadius: borderRadius.lg, paddingVertical: 13, alignItems: 'center', justifyContent: 'center', minHeight: 48, backgroundColor: colors.graySoft},
  roleActive: {backgroundColor: colors.primarySoft},
  roleText: {fontSize: 14, fontWeight: '700', color: colors.textMuted},
  roleTextActive: {color: colors.primary},
  childPicker: {marginTop: spacing.md, gap: spacing.sm},
  childPickerTitle: {fontSize: 13, fontWeight: '800', color: colors.text},
  childEmpty: {fontSize: 13, color: colors.textMuted},
  childOption: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: borderRadius.md, padding: spacing.md, backgroundColor: colors.graySoft},
  childOptionActive: {backgroundColor: colors.primarySoft},
  childOptionBody: {flex: 1},
  childOptionName: {fontSize: 14, fontWeight: '700', color: colors.text},
  childOptionMeta: {fontSize: 11, color: colors.textMuted, marginTop: 1},
  formActions: {flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg},
  cancelBtn: {flex: 1, borderRadius: borderRadius.lg, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', minHeight: 50, backgroundColor: colors.graySoft},
  cancelText: {fontSize: 15, fontWeight: '800', color: colors.textMuted},
  empty: {alignItems: 'center', paddingVertical: spacing.xxl * 2, gap: spacing.md},
  emptyTitle: {fontSize: 16, fontWeight: '800', color: colors.textMuted},
  loadingText: {color: colors.textMuted, fontSize: 14, fontWeight: '600'},
  card: {marginBottom: spacing.sm},
  cardRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  avatar: {width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center'},
  cardBody: {flex: 1},
  cardTitle: {fontSize: 15, fontWeight: '700', color: colors.text},
  cardSub: {fontSize: 12, color: colors.textMuted, marginTop: 2},
  roleTag: {borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4},
  roleTagText: {fontSize: 11, fontWeight: '800'},
  cardActions: {flexDirection: 'row', gap: spacing.sm},
  actionBtn: {width: 40, height: 40, borderRadius: borderRadius.sm, backgroundColor: colors.graySoft, justifyContent: 'center', alignItems: 'center'},
  flexBtn: {flex: 1},
});

export default UserManagementScreen;
