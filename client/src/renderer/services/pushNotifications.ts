import { isNative } from './platform';
import { api } from './api';

export async function initPushNotifications() {
  if (!isNative) return;

  const { PushNotifications } = await import('@capacitor/push-notifications');

  const permResult = await PushNotifications.requestPermissions();
  if (permResult.receive !== 'granted') {
    console.warn('Push notification permission not granted');
    return;
  }

  await PushNotifications.register();

  PushNotifications.addListener('registration', async (token) => {
    try {
      await api.post('/users/@me/fcm-token', { token: token.value });
    } catch (err) {
      console.error('Failed to register FCM token:', err);
    }
  });

  PushNotifications.addListener('registrationError', (err) => {
    console.error('Push registration error:', err);
  });

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push notification received:', notification);
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Push notification action:', notification);
  });
}
