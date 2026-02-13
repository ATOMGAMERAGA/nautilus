import { isNative } from './platform';

let preferencesModule: typeof import('@capacitor/preferences') | null = null;

async function getPreferences() {
  if (!preferencesModule) {
    preferencesModule = await import('@capacitor/preferences');
  }
  return preferencesModule.Preferences;
}

class Storage {
  async setTokens(access: string, refresh: string) {
    if (isNative) {
      const Preferences = await getPreferences();
      await Preferences.set({ key: 'access_token', value: access });
      await Preferences.set({ key: 'refresh_token', value: refresh });
    } else {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    }
  }

  async getAccessToken(): Promise<string | null> {
    if (isNative) {
      const Preferences = await getPreferences();
      const { value } = await Preferences.get({ key: 'access_token' });
      return value;
    }
    return localStorage.getItem('access_token');
  }

  async getRefreshToken(): Promise<string | null> {
    if (isNative) {
      const Preferences = await getPreferences();
      const { value } = await Preferences.get({ key: 'refresh_token' });
      return value;
    }
    return localStorage.getItem('refresh_token');
  }

  async clearTokens() {
    if (isNative) {
      const Preferences = await getPreferences();
      await Preferences.remove({ key: 'access_token' });
      await Preferences.remove({ key: 'refresh_token' });
    } else {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }
}

export const secureStorage = new Storage();
