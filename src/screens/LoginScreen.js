import React from 'react';
import {KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import PrimaryButton from '../components/PrimaryButton';
import {useAuth} from '../context/AuthContext';
import colors from '../theme/colors';
import {borderRadius, spacing} from '../theme/design';

function LoginScreen() {
  const {login} = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  async function handleLogin() {
    try { setLoading(true); setErrorMessage(''); await login({email: email.trim(), password, device_name: 'react-native-cli'}); }
    catch (error) { setErrorMessage(error.message); }
    finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.heroSection}>
          <View style={styles.heroDecor}>
            <Ionicons name="heart" size={100} color="rgba(255,255,255,0.06)" />
            <Ionicons name="medical" size={60} color="rgba(255,255,255,0.04)" style={styles.heroDecorMed} />
          </View>
          <View style={styles.logoWrap}>
            <Ionicons name="heart-circle" size={64} color={colors.white} />
          </View>
          <Text style={styles.logoText}>Kartu Pintar{'\n'}Posyandu</Text>
          <Text style={styles.tagline}>Akses data pertumbuhan balita dan monitoring posyandu.</Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
            <TextInput autoCapitalize="none" keyboardType="email-address" onChangeText={setEmail} placeholder="admin@gmail.com" placeholderTextColor={colors.placeholder} style={styles.input} value={email} />
          </View>
          <View style={[styles.inputGroup, {marginTop: spacing.md}]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
            <TextInput onChangeText={setPassword} placeholder="Masukkan password" placeholderTextColor={colors.placeholder} secureTextEntry style={styles.input} value={password} />
          </View>
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}
          <PrimaryButton loading={loading} onPress={handleLogin} style={styles.submitBtn}>
            <Ionicons name="log-in-outline" size={20} color={colors.white} />
            Masuk
          </PrimaryButton>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <View style={styles.infoBody}>
            <Text style={styles.infoTitle}>Akun demo</Text>
            <Text style={styles.infoText}>admin@gmail.com / admin12345</Text>
            <Text style={styles.infoText}>petugas@gmail.com / petugas12345</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.white},
  container: {flex: 1, padding: spacing.xxl, justifyContent: 'center'},
  heroSection: {backgroundColor: colors.primary, borderRadius: 28, padding: spacing.xxl, alignItems: 'center', marginBottom: spacing.xxl, overflow: 'hidden'},
  heroDecor: {position: 'absolute', top: -20, right: -20, bottom: 0, left: 0},
  heroDecorMed: {position: 'absolute', bottom: -10, right: -10},
  logoWrap: {width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md},
  logoText: {fontSize: 22, fontWeight: '800', color: colors.white, textAlign: 'center'},
  tagline: {marginTop: spacing.sm, fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 18},
  formSection: {marginBottom: spacing.lg},
  inputGroup: {flexDirection: 'row', alignItems: 'center', backgroundColor: colors.graySoft, borderRadius: borderRadius.lg, paddingHorizontal: spacing.lg, gap: spacing.sm},
  input: {flex: 1, paddingVertical: 14, fontSize: 15, color: colors.text},
  errorBox: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md, padding: spacing.md, borderRadius: 12, backgroundColor: colors.dangerSoft},
  errorText: {fontSize: 13, fontWeight: '600', color: colors.danger, flex: 1},
  submitBtn: {marginTop: spacing.xl},
  infoBox: {flexDirection: 'row', gap: spacing.md, borderRadius: 20, backgroundColor: colors.primarySoft, padding: spacing.lg, alignItems: 'flex-start'},
  infoBody: {flex: 1},
  infoTitle: {fontSize: 14, fontWeight: '800', color: colors.text},
  infoText: {marginTop: spacing.xs, fontSize: 13, color: colors.textMuted},
});

export default LoginScreen;
