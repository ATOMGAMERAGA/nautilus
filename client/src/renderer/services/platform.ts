import { Capacitor } from '@capacitor/core';

export const isNative = Capacitor.isNativePlatform();
export const isAndroid = Capacitor.getPlatform() === 'android';
export const isWeb = Capacitor.getPlatform() === 'web';
export const isElectron = !isNative && typeof window !== 'undefined' && !!(window as any).electron;
