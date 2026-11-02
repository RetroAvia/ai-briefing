'use client';

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export async function subscribeToNotifications(): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined') return { success: false, error: 'Ambiente non supportato' };

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { success: false, error: 'Web Push non supportato su questo browser/dispositivo' };
  }

  try {
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      return {
        success: false,
        error: 'NEXT_PUBLIC_VAPID_PUBLIC_KEY non configurata nelle variabili d\'ambiente',
      };
    }

    // Timeout di 3 secondi per evitare blocchi infiniti su mobile
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Timeout Service Worker')), 3000)),
    ]);

    if (!registration) {
      return { success: false, error: 'Service Worker non pronto' };
    }

    let subscription = await registration.pushManager.getSubscription();

    // Se non ancora sottoscritto, crea la nuova subscription
    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(vapidKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as unknown as ArrayBuffer,
      });
    }

    const subJson = subscription.toJSON();
    const endpoint = subJson.endpoint;
    const p256dh = subJson.keys?.p256dh;
    const auth = subJson.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      return { success: false, error: 'Dati di sottoscrizione push incompleti' };
    }

    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint, p256dh, auth }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { success: false, error: data.error || 'Errore salvataggio sottoscrizione su server' };
    }

    return { success: true };
  } catch (err: unknown) {
    console.warn('[PUSH] Errore di sottoscrizione:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Impossibile completare la registrazione push',
    };
  }
}

export async function unsubscribeFromNotifications(): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return { success: true };
  }

  try {
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
    ]);
    if (!registration) return { success: true };

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return { success: true };

    // Rimuove dal server
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    }).catch(() => {});

    // Rimuove dal browser
    const unsubscribed = await subscription.unsubscribe();
    return { success: unsubscribed };
  } catch (err: unknown) {
    console.warn('[PUSH] Errore disiscrizione:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore disattivazione notifiche',
    };
  }
}

export async function getNotificationStatus(): Promise<{
  supported: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
}> {
  if (
    typeof window === 'undefined' ||
    !('Notification' in window) ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window)
  ) {
    return { supported: false, permission: 'denied', subscribed: false };
  }

  let permission: NotificationPermission = 'denied';
  try {
    permission = Notification.permission;
  } catch {
    return { supported: false, permission: 'denied', subscribed: false };
  }

  let subscribed = false;

  try {
    // Timeout di 1.5s per evitare che rimanga bloccato indefinitamente su smartphone o iOS Safari
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
    ]);

    if (registration && registration.pushManager) {
      const sub = await registration.pushManager.getSubscription();
      subscribed = sub !== null;
    }
  } catch {
    // Silently continue
  }

  return { supported: true, permission, subscribed };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
