import {authorizedGet, authorizedPost} from '../utils/api';

async function login(payload) {
  return authorizedPost('/mobile/login', null, payload);
}

async function fetchCurrentUser(token) {
  return authorizedGet('/mobile/me', token);
}

async function logout(token) {
  return authorizedPost('/mobile/logout', token);
}

export {fetchCurrentUser, login, logout};