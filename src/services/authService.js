import api from './apiClient';


const LOGIN_PATH = '/auth/login';
const SIGNUP_PATH = '/auth/signup';

export async function login({ email, password }) {
  return api.request(LOGIN_PATH, {
    method: 'POST',
    body: { email, password },
  });
}

export async function signup({ name, email, password }) {
  return api.request(SIGNUP_PATH, {
    method: 'POST',
    body: { name, email, password },
  });
}

