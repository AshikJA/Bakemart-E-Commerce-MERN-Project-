export function logout() {
  // Remove auth data
  localStorage.removeItem('token');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('role');
  window.dispatchEvent(new Event('authChange'));
}

export function getCurrentRole() {
  return localStorage.getItem('role') || 'user';
}

export function isAdminAuthenticated() {
  const token = localStorage.getItem('adminToken');
  const role = localStorage.getItem('role');
  return Boolean(token && role === 'admin');
}

export function isUserAuthenticated() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  return Boolean(token && (!role || role === 'user'));
}