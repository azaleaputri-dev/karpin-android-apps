const CryptoJS = require('crypto-js');

const key = CryptoJS.enc.Hex.parse('f655ba9d09a112d4968c63579db590b4');
const iv = CryptoJS.enc.Hex.parse('98344c2eee86c3994890592585b49f80');
const ct = CryptoJS.enc.Hex.parse('bbc4a39f44f6b96eb62f44f1f6149ba6');

// Try with explicit PKCS7 padding
const result = CryptoJS.AES.decrypt(
  {ciphertext: ct},
  key,
  {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7}
);
console.log('PKCS7:', result.toString(CryptoJS.enc.Hex), 'sigBytes:', result.sigBytes);

// Try with NoPadding
const result2 = CryptoJS.AES.decrypt(
  {ciphertext: ct},
  key,
  {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.NoPadding}
);
console.log('NoPadding:', result2.toString(CryptoJS.enc.Hex), 'sigBytes:', result2.sigBytes);

// Try with ZeroPadding
const result3 = CryptoJS.AES.decrypt(
  {ciphertext: ct},
  key,
  {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.ZeroPadding}
);
console.log('ZeroPadding:', result3.toString(CryptoJS.enc.Hex), 'sigBytes:', result3.sigBytes);

// Try with Iso10126
const result4 = CryptoJS.AES.decrypt(
  {ciphertext: ct},
  key,
  {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Iso10126}
);
console.log('Iso10126:', result4.toString(CryptoJS.enc.Hex), 'sigBytes:', result4.sigBytes);

// Try with ANSI X.923
const result5 = CryptoJS.AES.decrypt(
  {ciphertext: ct},
  key,
  {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.AnsiX923}
);
console.log('AnsiX923:', result5.toString(CryptoJS.enc.Hex), 'sigBytes:', result5.sigBytes);

// Try with Iso97971
const result6 = CryptoJS.AES.decrypt(
  {ciphertext: ct},
  key,
  {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Iso97971}
);
console.log('Iso97971:', result6.toString(CryptoJS.enc.Hex), 'sigBytes:', result6.sigBytes);