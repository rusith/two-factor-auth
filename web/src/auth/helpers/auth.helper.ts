import { tokenKey } from '@app/consts';

function getToken() {
  return localStorage.getItem(tokenKey);
}

export function isLoggedIn() {
  return !!getToken();
}
