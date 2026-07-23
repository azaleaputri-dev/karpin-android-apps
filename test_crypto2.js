const CryptoJS = require('crypto-js');

const keyHex = 'f655ba9d09a112d4968c63579db590b4';
const ivHex = '98344c2eee86c3994890592585b49f80';
const ctHex = 'bbc4a39f44f6b96eb62f44f1f6149ba6';

const key = CryptoJS.enc.Hex.parse(keyHex);
const iv = CryptoJS.enc.Hex.parse(ivHex);
const ct = CryptoJS.enc.Hex.parse(ctHex);

// Method 1: Using CipherParams
const decrypted = CryptoJS.AES.decrypt(
  {ciphertext: ct},
  key,
  {iv: iv, mode: CryptoJS.mode.CBC}
);
console.log('Method 1:', decrypted.toString(CryptoJS.enc.Hex));

// Method 2: Using Base64 encoded string
const ctBase64 = CryptoJS.enc.Base64.stringify(ct);
const decrypted2 = CryptoJS.AES.decrypt(
  ctBase64,
  key,
  {iv: iv, mode: CryptoJS.mode.CBC}
);
console.log('Method 2:', decrypted2.toString(CryptoJS.enc.Hex));

// Method 3: Try without mode (default is CBC)
const decrypted3 = CryptoJS.AES.decrypt(
  ctBase64,
  key,
  {iv: iv}
);
console.log('Method 3:', decrypted3.toString(CryptoJS.enc.Hex));

console.log('\nCryptoJS version:', CryptoJS.version);