import { Capacitor } from '@capacitor/core';

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'

export function getApiBaseUrl(): string {
  if (isNative) {
    // In native app, API calls go to production server
    return import.meta.env.VITE_API_URL || 'https://api.pawmatch.ae';
  }
  // In web, use relative URLs (Vite proxy handles /api)
  return '';
}
