const ROLES = {
  ADMIN: 'admin',
  PETUGAS: 'petugas',
  ORANGTUA: 'orangtua',
};

function getRole(user) {
  return user?.role || '';
}

function canManageChildren(user) {
  return getRole(user) === ROLES.PETUGAS;
}

function canManageMeasurements(user) {
  const role = getRole(user);
  return role === ROLES.ADMIN || role === ROLES.PETUGAS;
}

function canManageAdminData(user) {
  return getRole(user) === ROLES.ADMIN;
}

function isReadOnlyViewer(user) {
  return getRole(user) === ROLES.ORANGTUA;
}

export {
  ROLES,
  canManageAdminData,
  canManageChildren,
  canManageMeasurements,
  getRole,
  isReadOnlyViewer,
};
