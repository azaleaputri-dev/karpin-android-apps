const CryptoJS = require('crypto-js');

const keyHex = 'f655ba9d09a112d4968c63579db590b4';
const ivHex = '98344c2eee86c3994890592585b49f80';
const ctHex = 'bbc4a39f44f6b96eb62f44f1f6149ba6';

const key = CryptoJS.enc.Hex.parse(keyHex);
const iv = CryptoJS.enc.Hex.parse(ivHex);
const ct = CryptoJS.enc.Hex.parse(ctHex);

const decrypted = CryptoJS.AES.decrypt(
  {ciphertext: ct},
  key,
  {iv: iv, mode: CryptoJS.mode.CBC}
);

const result = decrypted.toString(CryptoJS.enc.Hex);
console.log('Result:', result);
console.log('Expected: bd674b7569085d808552cd55fe081d45');
console.log('Match:', result === 'bd674b7569085d808552cd55fe081d45');