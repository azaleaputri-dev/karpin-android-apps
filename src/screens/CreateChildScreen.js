import React from 'react';
import {Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Card from '../components/Card';
import ChoiceChip from '../components/ChoiceChip';
import PrimaryButton from '../components/PrimaryButton';
import {useAuth} from '../context/AuthContext';
import {createChild, updateChild} from '../services/mobileData';
import {readNfcTag} from '../services/nfc';
import colors from '../theme/colors';
import {borderRadius, spacing} from '../theme/design';

function CreateChildScreen({navigation, route}) {
  const {token, user} = useAuth();
  const existingChild = route.params?.child || null;
  const isEditMode = Boolean(existingChild);
  const scannedRfid = route.params?.scannedRfidSerial || '';
  const [rfidSerial, setRfidSerial] = React.useState(scannedRfid || existingChild?.rfid_serial || '');
  const [rfidUid, setRfidUid] = React.useState(scannedRfid || existingChild?.rfid_uid || '');
  const [nik, setNik] = React.useState(existingChild?.nik || '');
  const [childName, setChildName] = React.useState(existingChild?.child_name || '');
  const [gender, setGender] = React.useState(existingChild?.gender || 'P');
  const [birthDate, setBirthDate] = React.useState(existingChild?.birth_date || '');
  const [bloodType, setBloodType] = React.useState(existingChild?.blood_type || '');
  const [motherName, setMotherName] = React.useState(existingChild?.mother_name || '');
  const [fatherName, setFatherName] = React.useState(existingChild?.father_name || '');
  const [guardianPhone, setGuardianPhone] = React.useState(existingChild?.guardian_phone || '');
  const [address, setAddress] = React.useState(existingChild?.address || '');
  const [notes, setNotes] = React.useState(existingChild?.notes || '');
  const [loading, setLoading] = React.useState(false);
  const [scanningNfc, setScanningNfc] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  React.useEffect(() => {
    if (route.params?.scannedRfidSerial) { setRfidSerial(route.params.scannedRfidSerial); setRfidUid(route.params.scannedRfidSerial); }
  }, [route.params?.scannedRfidSerial]);

  async function handleScanNfc() {
    try { setScanningNfc(true); setErrorMessage(''); const result = await readNfcTag(); setRfidSerial(result.uid); setRfidUid(result.uid); }
    catch (error) { setErrorMessage(error.message); Alert.alert('NFC belum terbaca', error.message); }
    finally { setScanningNfc(false); }
  }

  async function handleSubmit() {
    try {
      setLoading(true);
      setErrorMessage('');
      const payload = {
        posyandu_id: user?.posyandu?.id, nik: nik.trim() || null, rfid_uid: rfidUid.trim() || null,
        rfid_serial: rfidSerial.trim() || null,
        child_name: childName.trim(), gender, birth_date: birthDate.trim(),
        blood_type: bloodType.trim() || null, mother_name: motherName.trim(),
        father_name: fatherName.trim() || null, guardian_phone: guardianPhone.trim() || null,
        address: address.trim() || null, notes: notes.trim() || null,
      };
      if (isEditMode) await updateChild(existingChild.id, payload, token);
      else await createChild(payload, token);
      const next = isEditMode ? {childId: existingChild.id, title: childName.trim() || existingChild.child_name, refreshAt: Date.now()} : {refreshAt: Date.now()};
      const target = isEditMode ? 'ChildDetail' : 'ChildrenList';
      Alert.alert('Berhasil', isEditMode ? 'Data anak berhasil diperbarui.' : 'Data anak berhasil ditambahkan.', [{text: 'OK', onPress: () => navigation.replace(target, next)}]);
    } catch (error) { setErrorMessage(error.message); }
    finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formHero}>
          <View style={styles.formHeroDecor}>
            <Ionicons name="people" size={60} color="rgba(255,255,255,0.08)" />
          </View>
          <View style={styles.formHeroIcon}>
            <Ionicons name="person-add" size={28} color={colors.white} />
          </View>
          <Text style={styles.formHeroTitle}>{isEditMode ? 'Edit Data Anak' : 'Tambah Data Anak'}</Text>
          <Text style={styles.formHeroDesc}>Data akan langsung masuk ke backend untuk posyandu yang kamu tangani.</Text>
        </View>
        <Card padding="xl" style={styles.formCard}>
          <View style={styles.field}>
            <Ionicons name="business-outline" size={16} color={colors.primary} />
            <Text style={styles.label}>Posyandu</Text>
          </View>
          <View style={styles.readonlyBox}><Text style={styles.readonlyText}>{user?.posyandu?.name || '-'}</Text></View>

          <View style={styles.field}><Ionicons name="person-outline" size={16} color={colors.primary} /><Text style={styles.label}>Nama Anak *</Text></View>
          <TextInput onChangeText={setChildName} placeholder="Masukkan nama anak" placeholderTextColor={colors.placeholder} style={styles.input} value={childName} />

          <View style={styles.field}><Ionicons name="card-outline" size={16} color={colors.primary} /><Text style={styles.label}>NIK</Text></View>
          <TextInput onChangeText={setNik} placeholder="Nomor Induk Kependudukan" placeholderTextColor={colors.placeholder} style={styles.input} value={nik} />

          <View style={styles.field}><Ionicons name="key-outline" size={16} color={colors.primary} /><Text style={styles.label}>Serial Number NFC (dari scan)</Text></View>
          <View style={styles.nfcRow}>
            <TextInput autoCapitalize="characters" onChangeText={setRfidSerial} placeholder="Scan NFC untuk mengisi otomatis" placeholderTextColor={colors.placeholder} style={[styles.input, styles.nfcInput]} value={rfidSerial} />
            <Pressable disabled={scanningNfc} onPress={handleScanNfc} style={[styles.nfcButton, scanningNfc && styles.nfcButtonDisabled]}>
              <Ionicons name="scan-outline" size={18} color={colors.white} />
            </Pressable>
          </View>

          <View style={styles.field}><Ionicons name="id-card-outline" size={16} color={colors.primary} /><Text style={styles.label}>UID (isi manual)</Text></View>
          <TextInput autoCapitalize="characters" onChangeText={setRfidUid} placeholder="Isi UID kartu secara manual" placeholderTextColor={colors.placeholder} style={styles.input} value={rfidUid} />

          <View style={styles.field}><Ionicons name="male-female-outline" size={16} color={colors.primary} /><Text style={styles.label}>Jenis Kelamin *</Text></View>
          <View style={styles.choiceRow}>
            <ChoiceChip active={gender === 'L'} icon="man-outline" label="Laki-laki" onPress={() => setGender('L')} />
            <ChoiceChip active={gender === 'P'} icon="woman-outline" label="Perempuan" onPress={() => setGender('P')} />
          </View>

          <View style={styles.field}><Ionicons name="calendar-outline" size={16} color={colors.primary} /><Text style={styles.label}>Tanggal Lahir *</Text></View>
          <TextInput onChangeText={setBirthDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.placeholder} style={styles.input} value={birthDate} />

          <View style={styles.field}><Ionicons name="people-outline" size={16} color={colors.primary} /><Text style={styles.label}>Nama Ibu</Text></View>
          <TextInput onChangeText={setMotherName} placeholder="Masukkan nama ibu" placeholderTextColor={colors.placeholder} style={styles.input} value={motherName} />

          <View style={styles.field}><Ionicons name="people-outline" size={16} color={colors.primary} /><Text style={styles.label}>Nama Ayah</Text></View>
          <TextInput onChangeText={setFatherName} placeholder="Opsional" placeholderTextColor={colors.placeholder} style={styles.input} value={fatherName} />

          <View style={styles.field}><Ionicons name="water-outline" size={16} color={colors.primary} /><Text style={styles.label}>Gol. Darah</Text></View>
          <TextInput onChangeText={setBloodType} placeholder="Opsional" placeholderTextColor={colors.placeholder} style={styles.input} value={bloodType} />

          <View style={styles.field}><Ionicons name="call-outline" size={16} color={colors.primary} /><Text style={styles.label}>No. HP Wali</Text></View>
          <TextInput keyboardType="phone-pad" onChangeText={setGuardianPhone} placeholder="Opsional" placeholderTextColor={colors.placeholder} style={styles.input} value={guardianPhone} />

          <View style={styles.field}><Ionicons name="location-outline" size={16} color={colors.primary} /><Text style={styles.label}>Alamat</Text></View>
          <TextInput multiline onChangeText={setAddress} placeholder="Alamat anak" placeholderTextColor={colors.placeholder} style={[styles.input, styles.textarea]} textAlignVertical="top" value={address} />

          <View style={styles.field}><Ionicons name="document-text-outline" size={16} color={colors.primary} /><Text style={styles.label}>Catatan</Text></View>
          <TextInput multiline onChangeText={setNotes} placeholder="Catatan tambahan" placeholderTextColor={colors.placeholder} style={[styles.input, styles.textarea]} textAlignVertical="top" value={notes} />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          <PrimaryButton loading={loading} onPress={handleSubmit} style={styles.submitButton}>
            <Ionicons name={isEditMode ? 'checkmark-done' : 'checkmark-circle'} size={20} color={colors.white} />
            {isEditMode ? 'Simpan Perubahan' : 'Simpan Data Anak'}
          </PrimaryButton>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.xl, paddingBottom: spacing.xxl},
  formHero: {backgroundColor: colors.primary, borderRadius: 24, padding: spacing.xl, marginBottom: spacing.xl, alignItems: 'center', overflow: 'hidden'},
  formHeroDecor: {position: 'absolute', top: -10, right: -10},
  formHeroIcon: {width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md},
  formHeroTitle: {fontSize: 18, fontWeight: '800', color: colors.white},
  formHeroDesc: {fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: spacing.xs, lineHeight: 18},
  formCard: {},
  field: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.sm},
  label: {fontSize: 14, fontWeight: '700', color: colors.text},
  readonlyBox: {borderRadius: borderRadius.lg, paddingHorizontal: spacing.lg, paddingVertical: 14, backgroundColor: colors.graySoft},
  readonlyText: {fontSize: 15, color: colors.text, fontWeight: '700'},
  input: {borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, paddingHorizontal: spacing.lg, paddingVertical: 14, fontSize: 15, color: colors.text, backgroundColor: colors.graySoft},
  nfcRow: {flexDirection: 'row', gap: spacing.sm, alignItems: 'center'},
  nfcInput: {flex: 1},
  nfcButton: {width: 50, height: 50, borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.secondary, shadowColor: colors.secondary, shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3},
  nfcButtonDisabled: {opacity: 0.8},
  choiceRow: {flexDirection: 'row', gap: spacing.sm},
  textarea: {minHeight: 96, textAlignVertical: 'top'},
  errorText: {marginTop: spacing.md, fontSize: 13, fontWeight: '600', color: colors.danger},
  submitButton: {marginTop: spacing.xl, flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
});

export default CreateChildScreen;
