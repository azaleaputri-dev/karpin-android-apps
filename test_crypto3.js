const CryptoJS = require('crypto-js');

// Simple test: encrypt and decrypt
const key = CryptoJS.enc.Hex.parse('f655ba9d09a112d4968c63579db590b4');
const iv = CryptoJS.enc.Hex.parse('98344c2eee86c3994890592585b49f80');
const plaintext = 'Hello World!';

// Encrypt
const encrypted = CryptoJS.AES.encrypt(plaintext, key, {iv: iv, mode: CryptoJS.mode.CBC});
console.log('Encrypted str:', encrypted.toString());
console.log('Encrypted ct:', encrypted.ciphertext.toString(CryptoJS.enc.Hex));

// Decrypt from encrypted object
const decrypted = CryptoJS.AES.decrypt(encrypted, key, {iv: iv, mode: CryptoJS.mode.CBC});
console.log('Decrypted:', decrypted.toString(CryptoJS.enc.Utf8));

// Now try with raw hex
const ct = encrypted.ciphertext;
console.log('CT hex:', ct.toString(CryptoJS.enc.Hex));

// Decrypt with raw ciphertext
const decrypted2 = CryptoJS.AES.decrypt({ciphertext: ct}, key, {iv: iv, mode: CryptoJS.mode.CBC});
console.log('Decrypted2:', decrypted2.toString(CryptoJS.enc.Utf8));

// What about the original challenge values?
const challengeKey = CryptoJS.enc.Hex.parse('f655ba9d09a112d4968c63579db590b4');
const challengeIv = CryptoJS.enc.Hex.parse('98344c2eee86c3994890592585b49f80');
const challengeCt = CryptoJS.enc.Hex.parse('bbc4a39f44f6b96eb62f44f1f6149ba6');

const result = CryptoJS.AES.decrypt({ciphertext: challengeCt}, challengeKey, {iv: challengeIv, mode: CryptoJS.mode.CBC});
console.log('Challenge result hex:', result.toString(CryptoJS.enc.Hex));
console.log('Challenge result utf8:', result.toString(CryptoJS.enc.Utf8));
console.log('Result words:', result.words);
console.log('Result sigBytes:', result.sigBytes);