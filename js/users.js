export function setUser(name) {
  localStorage.setItem('activeUser', name);
  console.log('User set to:', name);
  return name;
}

export function getUser() {
  const user = localStorage.getItem('activeUser');
  console.log('Got user:', user);
  return user;
}

export function getAllUsers() {
  try {
    const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
    console.log('All users:', users);
    return users;
  } catch (e) {
    console.error('Error getting users:', e);
    return [];
  }
}