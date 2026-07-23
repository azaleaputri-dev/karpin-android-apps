import React from 'react';
import {Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import {useAuth} from '../context/AuthContext';
import {createMeasurement, fetchChildren, updateMeasurement} from '../services/mobileData';
import colors from '../theme/colors';
import {borderRadius, spacing} from '../theme/design';

function CreateMeasurementScreen({navigation, route}) {
  const {token} = useAuth();
  const initialChild = route.params?.child;
  const existingMeasurement = route.params?.measurement || null;
  const isEditMode = Boolean(existingMeasurement);

  const [childList, setChildList] = React.useState([]);
  const [selectedChild, setSelectedChild] = React.useState(initialChild || null);
  const [weight, setWeight] = React.useState(existingMeasurement?.weight_kg !== undefined ? String(existingMeasurement.weight_kg) : '');
  const [height, setHeight] = React.useState(existingMeasurement?.height_cm !== undefined ? String(existingMeasurement.height_cm) : '');
  const [temperature, setTemperature] = React.useState(existingMeasurement?.temperature_c != null ? String(existingMeasurement.temperature_c) : '');
  const [notes, setNotes] = React.useState(existingMeasurement?.notes || '');
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  React.useEffect(() => {
    if (!initialChild) {
      fetchChildren(token).then(r => setChildList(r.data || [])).catch(() => setErrorMessage('Gagal memuat data anak.'));
    }
  }, [token, initialChild]);

  async function handleSubmit() {
    try {
      if (!selectedChild?.id) { Alert.alert('Pilih anak', 'Pilih anak terlebih dahulu.'); return; }
      setLoading(true);
      setErrorMessage('');
      const payload = {
        child_id: selectedChild.id,
        measured_at: existingMeasurement?.measured_at_raw || new Date().toISOString(),
        weight_kg: Number(weight),
        height_cm: Number(height),
        temperature_c: temperature ? Number(temperature) : null,
        source: 'manual',
        notes: notes.trim() || null,
      };
      if (isEditMode) await updateMeasurement(existingMeasurement.id, payload, token);
      else await createMeasurement(payload, token);
      Alert.alert('Berhasil', 'Data pengukuran berhasil disimpan.', [{text: 'OK', onPress: () => navigation.navigate('Pengukuran')}]);
    } catch (error) { setErrorMessage(error.message); }
    finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.formHero}>
          <View style={styles.formHeroDecor}>
            <Ionicons name="analytics" size={60} color="rgba(255,255,255,0.08)" />
          </View>
          <View style={styles.formHeroIcon}>
            <Ionicons name="add-circle" size={28} color={colors.white} />
          </View>
          <Text style={styles.formHeroTitle}>{isEditMode ? 'Edit Pengukuran' : 'Tambah Pengukuran'}</Text>
          <Text style={styles.formHeroDesc}>{selectedChild ? `Data pengukuran untuk ${selectedChild.child_name}` : 'Pilih anak untuk mencatat pengukuran'}</Text>
        </View>
        <Card padding="xl">
          {!selectedChild ? (
            <>
              <View style={styles.field}><Ionicons name="people-outline" size={16} color={colors.primary} /><Text style={styles.label}>Pilih Anak</Text></View>
              {childList.length === 0 ? (
                <Text style={styles.emptyChildText}>Tidak ada data anak.</Text>
              ) : (
                <View style={styles.childPicker}>
                  {childList.map(c => (
                    <Pressable key={c.id} onPress={() => setSelectedChild(c)} style={styles.childOption}>
                      <View style={[styles.childAvatar, {backgroundColor: c.gender === 'L' ? colors.info : colors.purple}]}>
                        <Ionicons name={c.gender === 'L' ? 'man' : 'woman'} size={20} color={colors.white} />
                      </View>
                      <View style={styles.childOptionBody}>
                        <Text style={styles.childOptionName}>{c.child_name}</Text>
                        <Text style={styles.childOptionPosyandu}>{c.posyandu_name || '-'}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={colors.border} />
                    </Pressable>
                  ))}
                </View>
              )}
            </>
          ) : (
            <>
              <View style={styles.field}><Ionicons name="person-outline" size={16} color={colors.primary} /><Text style={styles.label}>Anak</Text></View>
              <Pressable onPress={() => !isEditMode && setSelectedChild(null)} style={styles.readonlyBox}>
                <Text style={styles.readonlyText}>{selectedChild.child_name}</Text>
                {!isEditMode ? <Ionicons name="create-outline" size={16} color={colors.textMuted} /> : null}
              </Pressable>

              <View style={styles.field}><Ionicons name="scale-outline" size={16} color={colors.primary} /><Text style={styles.label}>Berat (kg) *</Text></View>
              <TextInput keyboardType="decimal-pad" onChangeText={setWeight} placeholder="Contoh 13.40" placeholderTextColor={colors.placeholder} style={styles.input} value={weight} />

              <View style={styles.field}><Ionicons name="resize-outline" size={16} color={colors.primary} /><Text style={styles.label}>Tinggi (cm) *</Text></View>
              <TextInput keyboardType="decimal-pad" onChangeText={setHeight} placeholder="Contoh 92.5" placeholderTextColor={colors.placeholder} style={styles.input} value={height} />

              <View style={styles.field}><Ionicons name="thermometer-outline" size={16} color={colors.primary} /><Text style={styles.label}>Suhu (°C)</Text></View>
              <TextInput keyboardType="decimal-pad" onChangeText={setTemperature} placeholder="Opsional" placeholderTextColor={colors.placeholder} style={styles.input} value={temperature} />

              <View style={styles.field}><Ionicons name="document-text-outline" size={16} color={colors.primary} /><Text style={styles.label}>Catatan</Text></View>
              <TextInput multiline onChangeText={setNotes} placeholder="Catatan tambahan bila perlu" placeholderTextColor={colors.placeholder} style={[styles.input, styles.textarea]} textAlignVertical="top" value={notes} />

              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
              <PrimaryButton loading={loading} onPress={handleSubmit}>Simpan Pengukuran</PrimaryButton>
            </>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  scroll: {padding: spacing.xl, paddingBottom: spacing.xxl},
  formHero: {backgroundColor: colors.primary, borderRadius: 24, padding: spacing.xl, marginBottom: spacing.xl, alignItems: 'center', overflow: 'hidden'},
  formHeroDecor: {position: 'absolute', top: -10, right: -10},
  formHeroIcon: {width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md},
  formHeroTitle: {fontSize: 18, fontWeight: '800', color: colors.white},
  formHeroDesc: {fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: spacing.xs, lineHeight: 18},
  field: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.sm},
  label: {fontSize: 14, fontWeight: '700', color: colors.text},
  readonlyBox: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: borderRadius.lg, paddingHorizontal: spacing.lg, paddingVertical: 14, backgroundColor: colors.graySoft},
  readonlyText: {fontSize: 15, color: colors.text, fontWeight: '700'},
  input: {borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, paddingHorizontal: spacing.lg, paddingVertical: 14, fontSize: 15, color: colors.text, backgroundColor: colors.graySoft},
  textarea: {minHeight: 110, textAlignVertical: 'top'},
  errorText: {marginTop: spacing.md, fontSize: 13, fontWeight: '600', color: colors.danger},
  emptyChildText: {fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xl},
  childPicker: {gap: spacing.sm},
  childOption: {flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderRadius: borderRadius.lg, backgroundColor: colors.graySoft},
  childAvatar: {width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center'},
  childOptionBody: {flex: 1},
  childOptionName: {fontSize: 15, fontWeight: '700', color: colors.text},
  childOptionPosyandu: {fontSize: 11, color: colors.textMuted, marginTop: 1},
});

export default CreateMeasurementScreen;
