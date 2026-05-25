/**
 * Web Push Notifications utility
 * Handles service worker registration, permission request, and subscription management.
 */

import api from './api'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    return reg
  } catch (e) {
    console.error('[Push] SW registration failed:', e)
    return null
  }
}

export async function requestPushPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export async function subscribeToPush(): Promise<boolean> {
  try {
    const reg = await registerServiceWorker()
    if (!reg) return false

    const granted = await requestPushPermission()
    if (!granted) return false

    // Get VAPID public key from backend
    const keyRes = await api.get<{ public_key: string }>('/push/vapid-public-key')
    const vapidKey = keyRes.data.public_key
    if (!vapidKey) return false

    // Subscribe
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    })

    const subJson = subscription.toJSON()
    const keys = subJson.keys as { p256dh: string; auth: string }

    // Send subscription to backend
    await api.post('/push/subscribe', {
      endpoint: subscription.endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    })

    console.log('[Push] Subscribed successfully')
    return true
  } catch (e) {
    console.error('[Push] Subscription failed:', e)
    return false
  }
}

export async function unsubscribeFromPush(): Promise<void> {
  try {
    const reg = await navigator.serviceWorker.getRegistration('/sw.js')
    if (!reg) return
    const sub = await reg.pushManager.getSubscription()
    if (!sub) return

    const subJson = sub.toJSON()
    const keys = subJson.keys as { p256dh: string; auth: string }

    await api.delete('/push/unsubscribe', {
      data: { endpoint: sub.endpoint, p256dh: keys.p256dh, auth: keys.auth }
    })
    await sub.unsubscribe()
    console.log('[Push] Unsubscribed')
  } catch (e) {
    console.error('[Push] Unsubscribe failed:', e)
  }
}

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

export function getPushPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported'
  return Notification.permission
}
