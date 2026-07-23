import {API_BASE_URL} from '../config/api';
import CryptoJS from 'crypto-js';

let challengeCookie = null;

function extractCookieKey(html) {
  const m = html.match(
    /a=toNumbers\("([^"]+)"\),b=toNumbers\("([^"]+)"\),c=toNumbers\("([^"]+)"\)/,
  );
  if (!m) {
    return null;
  }
  const key = CryptoJS.enc.Hex.parse(m[1]);
  const iv = CryptoJS.enc.Hex.parse(m[2]);
  const ct = CryptoJS.enc.Hex.parse(m[3]);
  const decrypted = CryptoJS.AES.decrypt(
    {ciphertext: ct},
    key,
    {iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.NoPadding},
  );
  return decrypted.toString(CryptoJS.enc.Hex);
}

async function ensureCookie() {
  if (challengeCookie) {
    return;
  }
  try {
    const response = await fetch(API_BASE_URL);
    const html = await response.text();
    const cookieVal = extractCookieKey(html);
    if (cookieVal) {
      challengeCookie = `__test=${cookieVal}`;
    }
  } catch {}
}

function cookieHeaders() {
  if (challengeCookie) {
    return {Cookie: challengeCookie};
  }
  return {};
}

async function request(method, url, token, payload, retryCount = 0) {
  if (retryCount > 2) {
    throw new Error('Terjadi kesalahan pada server.');
  }

  await ensureCookie();

  const headers = {
    Accept: 'application/json',
    ...cookieHeaders(),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (payload) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method,
    headers,
    body: payload ? JSON.stringify(payload) : undefined,
  });

  const text = await response.text();

  if (text.includes('slowAES') || text.includes('toNumbers')) {
    challengeCookie = null;
    await ensureCookie();
    return request(method, url, token, payload, retryCount + 1);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = {};
  }

  if (!response.ok) {
    const fieldErrors = data?.errors
      ? Object.values(data.errors).flat().filter(Boolean)
      : [];

    const message =
      fieldErrors.length > 0
        ? fieldErrors.join('. ')
        : data?.message || data?.error || 'Terjadi kesalahan pada server.';

    throw new Error(message);
  }

  return data;
}

async function authorizedGet(path, token, params) {
  return request('GET', `${API_BASE_URL}${path}${buildQueryString(params)}`, token);
}

async function authorizedPost(path, token, payload) {
  return request('POST', `${API_BASE_URL}${path}`, token, payload);
}

async function authorizedPut(path, token, payload) {
  const body = {...payload, _method: 'PUT'};
  return request('POST', `${API_BASE_URL}${path}`, token, body);
}

async function authorizedDelete(path, token, payload) {
  const body = {...(payload || {}), _method: 'DELETE'};
  return request('POST', `${API_BASE_URL}${path}`, token, body);
}

function buildQueryString(params = {}) {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== '',
  );

  if (entries.length === 0) {
    return '';
  }

  const query = entries
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join('&');

  return `?${query}`;
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const fieldErrors = data?.errors
      ? Object.values(data.errors).flat().filter(Boolean)
      : [];
    const message =
      fieldErrors.length > 0
        ? fieldErrors.join('. ')
        : data?.message || data?.error || 'Terjadi kesalahan pada server.';
    throw new Error(message);
  }
  return data;
}

export {authorizedDelete, authorizedGet, authorizedPost, authorizedPut, parseResponse};