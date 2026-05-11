import { apiFetch } from '../utils/api';

export async function getAllTrips() {
  return apiFetch('/trips', { method: 'GET' });
}

export async function createTrip(payload: any) {
  return apiFetch('/trips', { method: 'POST', body: JSON.stringify(payload) });
}
