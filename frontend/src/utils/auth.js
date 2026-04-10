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

export function getUserId() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id || payload._id || payload.userId || null;
  } catch (e) {
    return null;
  }
}