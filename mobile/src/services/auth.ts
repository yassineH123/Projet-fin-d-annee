import { api } from './api';

export async function register(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  const response = await api.post('/auth/register', data);
  return response.data;
}

export async function login(email: string, password: string) {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
}

export async function loginWithGoogle(idToken: string) {
  const response = await api.post('/auth/google', { idToken });
  return response.data;
}

export async function verifyEmail(email: string, code: string) {
  const response = await api.post('/auth/verify-email', { email, code });
  return response.data;
}

export async function resendCode(email: string) {
  const response = await api.post('/auth/resend-code', { email });
  return response.data;
}
