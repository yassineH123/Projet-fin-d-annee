import api from '../services/api';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function pushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function pushPermission() {
  return typeof Notification !== 'undefined' ? Notification.permission : 'default';
}

/** Demande la permission, s'abonne au push et enregistre l'abonnement côté serveur. */
export async function enablePush() {
  if (!pushSupported()) throw new Error('Notifications non supportées par ce navigateur.');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Permission refusée.');

  const { data } = await api.get('/notifications/vapid-public-key');
  if (!data.key) throw new Error('Notifications push non configurées sur le serveur.');

  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.key),
    });
  }
  const json = sub.toJSON();
  await api.post('/notifications/subscribe', { endpoint: json.endpoint, keys: json.keys });
  return true;
}

/** Désabonne ce navigateur des notifications push. */
export async function disablePush() {
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    await api.post('/notifications/unsubscribe', { endpoint: sub.endpoint }).catch(() => {});
    await sub.unsubscribe().catch(() => {});
  }
}
