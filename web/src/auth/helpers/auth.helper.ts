function getToken() {
  console.log(localStorage.getItem('token'));
  return localStorage.getItem('token');
}

export function isLoggedIn() {
  return !!getToken();
}
