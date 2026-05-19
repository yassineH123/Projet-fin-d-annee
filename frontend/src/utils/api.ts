import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';

type ReqOptions = RequestInit & { headers?: Record<string, string> };

export async function apiFetch(path: string, options: ReqOptions = {}) {
  const token = await AsyncStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${path}`;
  console.log('API Call:', url, options);
  
  const res = await fetch(url, {
    ...options,
    headers,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err = data && data.error ? data.error : res.statusText || text;
    console.error('API Error:', err);
    throw new Error(typeof err === 'string' ? err : JSON.stringify(err));
  }

  return data;
}
