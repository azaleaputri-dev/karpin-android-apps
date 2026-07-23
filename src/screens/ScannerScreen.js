import React from 'react';
import {Alert, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Camera, useCameraDevice, useCameraPermission, useCodeScanner} from 'react-native-vision-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';

import ChildCard from '../components/ChildCard';
import EmptyState from '../components/EmptyState';
import LoadingView from '../components/LoadingView';
import PrimaryButton from '../components/PrimaryButton';
import {useAuth} from '../context/AuthContext';
import {fetchChildren} from '../services/mobileData';
import {readNfcTag} from '../services/nfc';
import colors from '../theme/colors';
import {borderRadius, spacing} from '../theme/design';
import {canManageMeasurements} from '../utils/permissions';

const MODES = {NFC: 'NFC', QR: 'QR'};

function ScannerScreen({navigation}) {
  const {token, user} = useAuth();
  const [mode, setMode] = React.useState(MODES.NFC);
  const [scanning, setScanning] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [serial, setSerial] = React.useState('');
  const [qrData, setQrData] = React.useState('');
  const [children, setChildren] = React.useState([]);
  const [errorMessage, setErrorMessage] = React.useState('');

  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');
  const canInputMeasurement = canManageMeasurements(user);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {if (codes.length > 0) handleQrScanned(codes[0].value);},
  });

  React.useEffect(() => {if (mode === MODES.QR && !hasPermission) requestPermission().catch(() => {});}, [mode, hasPermission, requestPermission]);

  async function fetchChildrenByQuery(query) {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await fetchChildren(token, {search: query});
      setChildren(response.data || []);
      if (!response.data || response.data.length === 0) setErrorMessage('Data tidak ditemukan');
    } catch (error) { setErrorMessage(error.message); setChildren([]); }
    finally { setLoading(false); }
  }

  async function handleScan() {
    try { setScanning(true); setErrorMessage(''); const result = await readNfcTag(); setSerial(result.uid); await fetchChildrenByQuery(result.uid); }
    catch (error) { setErrorMessage(error.message); Alert.alert('NFC belum terbaca', error.message); }
    finally { setScanning(false); }
  }

  function handleQrScanned(value) {
    if (!value) return;
    setQrData(value);
    fetchChildrenByQuery(value);
  }

  function handleRegister() {
    if (!serial) { Alert.alert('Scan dulu', 'Scan kartu NFC terlebih dahulu.'); return; }
    navigation.navigate('DataAnak', {screen: 'CreateChild', params: {scannedRfidSerial: serial}});
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="scan-circle-outline" size={26} color={colors.primary} />
            <Text style={styles.headerTitle}>Scanner</Text>
          </View>
        </View>

        <View style={styles.toggleWrap}>
          <Pressable style={[styles.toggleBtn, mode === MODES.NFC && styles.toggleActive]} onPress={() => setMode(MODES.NFC)}>
            <Ionicons name="phone-portrait-outline" size={20} color={mode === MODES.NFC ? colors.white : colors.textMuted} />
            <Text style={[styles.toggleText, mode === MODES.NFC && styles.toggleTextActive]}>NFC</Text>
          </Pressable>
          <Pressable style={[styles.toggleBtn, mode === MODES.QR && styles.toggleActive]} onPress={() => setMode(MODES.QR)}>
            <Ionicons name="qr-code-outline" size={20} color={mode === MODES.QR ? colors.white : colors.textMuted} />
            <Text style={[styles.toggleText, mode === MODES.QR && styles.toggleTextActive]}>QR</Text>
          </Pressable>
        </View>

        {mode === MODES.NFC ? (
          <View style={styles.nfcCard}>
            <View style={styles.nfcRing}>
              <View style={styles.nfcInner}>
                <Ionicons name="phone-portrait-outline" size={44} color={colors.primary} />
              </View>
            </View>
            <Text style={styles.nfcLabel}>Tempelkan kartu NFC ke belakang perangkat</Text>
            <View style={styles.uidBox}>
              <Text style={styles.uidLabel}>Serial Number</Text>
              <Text style={styles.uidValue}>{serial || '—'}</Text>
            </View>
            <Pressable disabled={scanning} onPress={handleScan} style={[styles.nfcScanBtn, scanning && styles.nfcScanBtnDisabled]}>
              <Ionicons name="scan-outline" size={22} color={colors.white} />
              <Text style={styles.nfcScanText}>{scanning ? 'Memindai...' : 'Scan Kartu NFC'}</Text>
            </Pressable>
            {serial ? (
              <Pressable onPress={handleRegister} style={styles.registerBtn}>
                <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                <Text style={styles.registerText}>Daftarkan Serial ke Data Anak</Text>
              </Pressable>
            ) : null}
          </View>
        ) : hasPermission && device ? (
          <View style={styles.qrCard}>
            <View style={styles.cameraBox}>
              <Camera style={styles.cameraFeed} device={device} isActive={mode === MODES.QR} codeScanner={codeScanner} />
              <View style={styles.qrOverlay}>
                <View style={styles.qrCorners}>
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />
                </View>
              </View>
            </View>
            <View style={styles.qrFoot}>
              <Ionicons name="qr-code" size={18} color={colors.primary} />
              <Text style={styles.qrHint}>Arahkan kamera ke QR code</Text>
            </View>
            {qrData ? (
              <View style={styles.qrResult}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={styles.qrResultText}>Data: {qrData.substring(0, 40)}{qrData.length > 40 ? '...' : ''}</Text>
              </View>
            ) : null}
          </View>
        ) : !hasPermission ? (
          <View style={styles.permissionCard}>
            <Ionicons name="camera-outline" size={56} color={colors.textMuted} />
            <Text style={styles.permissionTitle}>Izin Kamera</Text>
            <Text style={styles.permissionDesc}>Izin kamera diperlukan untuk memindai QR code.</Text>
            <PrimaryButton onPress={() => requestPermission().catch(() => {})} style={styles.permitBtn}>Berikan Izin</PrimaryButton>
          </View>
        ) : (
          <View style={styles.permissionCard}>
            <EmptyState title="Kamera tidak tersedia" description="Perangkat ini tidak memiliki kamera yang kompatibel." />
          </View>
        )}

        <View style={styles.resultHead}>
          <Ionicons name="search-outline" size={18} color={colors.text} />
          <Text style={styles.resultTitle}>Hasil Pencarian</Text>
        </View>

        {loading ? <LoadingView /> : null}
        {!loading && errorMessage && children.length === 0 ? (
          <View style={styles.emptyResult}>
            <Ionicons name="search-outline" size={48} color={colors.border} />
            <Text style={styles.emptyResultTitle}>Tidak ditemukan</Text>
            <Text style={styles.emptyResultDesc}>{errorMessage}</Text>
          </View>
        ) : null}
        {!loading && !errorMessage && ((mode === MODES.NFC && serial) || (mode === MODES.QR && qrData))
          ? children.map(child => (
              <View key={child.id}>
                <ChildCard
                  child={child}
                  linkText="Buka detail"
                  onPress={() => navigation.navigate('DataAnak', {screen: 'ChildDetail', params: {childId: child.id, title: child.child_name}})}
                />
                {canInputMeasurement ? (
                  <Pressable
                    onPress={() => navigation.navigate('DataAnak', {screen: 'CreateMeasurement', params: {child: {id: child.id, child_name: child.child_name}}})}
                    style={styles.measBtn}>
                    <Ionicons name="analytics-outline" size={16} color={colors.white} />
                    <Text style={styles.measBtnText}>Input Pengukuran</Text>
                  </Pressable>
                ) : null}
              </View>
            ))
          : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  scroll: {paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md},
  headerLeft: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  headerTitle: {fontSize: 20, fontWeight: '800', color: colors.text},

  toggleWrap: {flexDirection: 'row', backgroundColor: colors.graySoft, borderRadius: borderRadius.md, padding: 4, marginBottom: spacing.xl},
  toggleBtn: {flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: 12, borderRadius: borderRadius.sm},
  toggleActive: {backgroundColor: colors.primary, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2},
  toggleText: {fontSize: 15, fontWeight: '700', color: colors.textMuted},
  toggleTextActive: {color: colors.white},

  nfcCard: {backgroundColor: colors.white, borderRadius: 24, paddingHorizontal: spacing.xxl, paddingVertical: spacing.xxl, alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.04, shadowRadius: 12, elevation: 1},
  nfcRing: {width: 104, height: 104, borderRadius: 52, borderWidth: 3, borderColor: colors.primary + '30', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg},
  nfcInner: {width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primarySoft, justifyContent: 'center', alignItems: 'center'},
  nfcLabel: {fontSize: 14, fontWeight: '600', color: colors.textMuted, textAlign: 'center', marginBottom: spacing.lg},
  uidBox: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.graySoft, borderRadius: 12, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, marginBottom: spacing.lg},
  uidLabel: {fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1},
  uidValue: {fontSize: 18, fontWeight: '800', color: colors.primary, letterSpacing: 1.5},
  nfcScanBtn: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, minWidth: 220, borderRadius: borderRadius.lg, paddingVertical: 15, backgroundColor: colors.primary, shadowColor: colors.primary, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4},
  nfcScanText: {color: colors.white, fontSize: 15, fontWeight: '800'},
  nfcScanBtnDisabled: {opacity: 0.6},
  registerBtn: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.lg, borderRadius: borderRadius.lg, paddingVertical: 12, paddingHorizontal: spacing.xxl, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.primary},
  registerText: {color: colors.primary, fontSize: 14, fontWeight: '800'},

  qrCard: {backgroundColor: colors.white, borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.04, shadowRadius: 12, elevation: 1},
  cameraBox: {position: 'relative', width: '100%', aspectRatio: 1, backgroundColor: colors.graySoft},
  cameraFeed: {width: '100%', height: '100%'},
  qrOverlay: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'},
  qrCorners: {width: 220, height: 220},
  corner: {position: 'absolute', width: 44, height: 44, borderColor: colors.white},
  cornerTL: {top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 12},
  cornerTR: {top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 12},
  cornerBL: {bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 12},
  cornerBR: {bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 12},
  qrFoot: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.lg},
  qrHint: {fontSize: 14, fontWeight: '600', color: colors.textMuted},
  qrResult: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingBottom: spacing.lg, paddingHorizontal: spacing.xl},
  qrResultText: {fontSize: 13, color: colors.success, fontWeight: '700'},

  permissionCard: {backgroundColor: colors.white, borderRadius: 24, padding: spacing.xxl, alignItems: 'center', gap: spacing.md},
  permissionTitle: {fontSize: 18, fontWeight: '800', color: colors.text},
  permissionDesc: {fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20},
  permitBtn: {minWidth: 200, marginTop: spacing.md},

  resultHead: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xxl, marginBottom: spacing.lg},
  resultTitle: {fontSize: 18, fontWeight: '800', color: colors.text},

  measBtn: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderRadius: borderRadius.lg, paddingVertical: 13, backgroundColor: colors.secondary, marginBottom: spacing.sm, shadowColor: colors.secondary, shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3},
  measBtnText: {color: colors.white, fontSize: 14, fontWeight: '800'},
  emptyResult: {alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm},
  emptyResultTitle: {fontSize: 16, fontWeight: '800', color: colors.textMuted, marginTop: spacing.sm},
  emptyResultDesc: {fontSize: 13, color: colors.border, textAlign: 'center'},
});

export default ScannerScreen;
