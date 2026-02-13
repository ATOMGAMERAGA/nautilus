import { isNative } from './platform';

let statusBarModule: typeof import('@capacitor/status-bar') | null = null;
let keyboardModule: typeof import('@capacitor/keyboard') | null = null;
let splashScreenModule: typeof import('@capacitor/splash-screen') | null = null;

export async function initMobilePlugins() {
  if (!isNative) return;

  [statusBarModule, keyboardModule, splashScreenModule] = await Promise.all([
    import('@capacitor/status-bar'),
    import('@capacitor/keyboard'),
    import('@capacitor/splash-screen'),
  ]);

  const { StatusBar, Style } = statusBarModule;
  await StatusBar.setOverlaysWebView({ overlay: true });
  await StatusBar.setStyle({ style: Style.Dark });
  await StatusBar.setBackgroundColor({ color: '#1e1f22' });

  const { Keyboard } = keyboardModule;
  Keyboard.addListener('keyboardWillShow', (info) => {
    document.documentElement.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
  });
  Keyboard.addListener('keyboardWillHide', () => {
    document.documentElement.style.setProperty('--keyboard-height', '0px');
  });

  const { SplashScreen } = splashScreenModule;
  await SplashScreen.hide();
}

export async function updateStatusBarForTheme(theme: 'dark' | 'light' | 'contrast') {
  if (!isNative || !statusBarModule) return;

  const { StatusBar, Style } = statusBarModule;

  if (theme === 'light') {
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#ffffff' });
  } else if (theme === 'contrast') {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#000000' });
  } else {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#1e1f22' });
  }
}
