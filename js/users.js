export function setUser(name) {
  localStorage.setItem('activeUser', name);
  
  // Store join date for new users
  if (!localStorage.getItem(`${name}_joined`)) {
    localStorage.setItem(`${name}_joined`, new Date().toLocaleDateString());
  }
  
  // Add to users list
  const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
  if (!users.includes(name)) {
    users.push(name);
    localStorage.setItem('allUsers', JSON.stringify(users));
  }
}

export function getUser() {
  return localStorage.getItem('activeUser');
}

export function getAllUsers() {
  try {
    return JSON.parse(localStorage.getItem('allUsers') || '[]');
  } catch {
    return [];
  }
}

export function clearUser() {
  localStorage.removeItem('activeUser');
}