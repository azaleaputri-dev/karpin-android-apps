import {
  authorizedDelete,
  authorizedGet,
  authorizedPost,
  authorizedPut,
} from '../utils/api';

function fetchDashboard(token) {
  return authorizedGet('/mobile/dashboard', token);
}

function fetchChildren(token, params) {
  return authorizedGet('/mobile/children', token, params);
}

function fetchChildDetail(id, token) {
  return authorizedGet(`/mobile/children/${id}`, token);
}

function fetchMeasurements(token, params) {
  return authorizedGet('/mobile/measurements', token, params);
}

function createMeasurement(payload, token) {
  return authorizedPost('/mobile/measurements', token, payload);
}

function createChild(payload, token) {
  return authorizedPost('/mobile/children', token, payload);
}

function updateChild(id, payload, token) {
  return authorizedPut(`/mobile/children/${id}`, token, payload);
}

function updateMeasurement(id, payload, token) {
  return authorizedPut(`/mobile/measurements/${id}`, token, payload);
}

function deleteChild(id, token) {
  return authorizedDelete(`/mobile/children/${id}`, token);
}

function deleteMeasurement(id, token) {
  return authorizedDelete(`/mobile/measurements/${id}`, token);
}

function fetchPosyandus(token) {
  return authorizedGet('/mobile/posyandus', token);
}

function createPosyandu(payload, token) {
  return authorizedPost('/mobile/posyandus', token, payload);
}

function updatePosyandu(id, payload, token) {
  return authorizedPut(`/mobile/posyandus/${id}`, token, payload);
}

function deletePosyandu(id, token) {
  return authorizedDelete(`/mobile/posyandus/${id}`, token);
}

function fetchUsers(token) {
  return authorizedGet('/mobile/users', token);
}

function createUser(payload, token) {
  return authorizedPost('/mobile/users', token, payload);
}

function updateUser(id, payload, token) {
  return authorizedPut(`/mobile/users/${id}`, token, payload);
}

function deleteUser(id, token) {
  return authorizedDelete(`/mobile/users/${id}`, token);
}

function fetchDevices(token) {
  return authorizedGet('/mobile/devices', token);
}

function createDevice(payload, token) {
  return authorizedPost('/mobile/devices', token, payload);
}

function updateDevice(id, payload, token) {
  return authorizedPut(`/mobile/devices/${id}`, token, payload);
}

function deleteDevice(id, token) {
  return authorizedDelete(`/mobile/devices/${id}`, token);
}

export {
  createChild,
  createDevice,
  createMeasurement,
  createPosyandu,
  createUser,
  deleteChild,
  deleteDevice,
  deleteMeasurement,
  deletePosyandu,
  deleteUser,
  fetchChildDetail,
  fetchChildren,
  fetchDashboard,
  fetchDevices,
  fetchMeasurements,
  fetchPosyandus,
  fetchUsers,
  updateChild,
  updateDevice,
  updateMeasurement,
  updatePosyandu,
  updateUser,
};
