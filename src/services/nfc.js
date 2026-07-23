import NfcManager, {NfcTech} from 'react-native-nfc-manager';

let started = false;

function bytesToHex(bytes = []) {
  return bytes
    .map(value => value.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

function normalizeTagId(id) {
  if (!id) {
    return '';
  }

  if (Array.isArray(id)) {
    return bytesToHex(id);
  }

  return String(id).replace(/[^0-9A-Za-z]/g, '').toUpperCase();
}

async function ensureNfcReady() {
  const supported = await NfcManager.isSupported();

  if (!supported) {
    throw new Error('Perangkat ini belum mendukung NFC.');
  }

  if (!started) {
    await NfcManager.start();
    started = true;
  }

  const enabled = await NfcManager.isEnabled();

  if (!enabled) {
    throw new Error('NFC belum aktif. Aktifkan NFC di pengaturan perangkat.');
  }
}

async function readNfcTag() {
  await ensureNfcReady();

  try {
    await NfcManager.requestTechnology([NfcTech.NfcA, NfcTech.NfcB, NfcTech.IsoDep, NfcTech.Ndef]);
    const tag = await NfcManager.getTag();
    const uid = normalizeTagId(tag?.id);

    if (!uid) {
      throw new Error('UID kartu tidak terbaca. Coba tempel ulang kartu NFC.');
    }

    return {
      uid,
      tag,
    };
  } finally {
    NfcManager.cancelTechnologyRequest().catch(() => {});
  }
}

export {ensureNfcReady, normalizeTagId, readNfcTag};
