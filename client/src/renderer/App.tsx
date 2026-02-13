import { useState, useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ChatLayout } from './pages/ChatLayout'
import { isNative } from './services/platform'
import { initMobilePlugins } from './services/mobileInit'

function LoadingScreen() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-background">
      <img src="/icon.png" alt="Nautilus" className="w-20 h-20 mb-6 animate-pulse-glow" onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
      }} />
      <h1 className="text-title-large font-bold text-on-surface mb-4">Nautilus</h1>
      <div className="w-48 h-1 bg-surface-container-high rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-[shimmer_1.5s_linear_infinite]" style={{ width: '40%' }} />
      </div>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, loadSession, isLoading } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const [appReady, setAppReady] = useState(false);

  // Apply theme class on mount and changes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    if (theme === 'dark') {
      root.classList.add('dark');
    }
  }, [theme]);

  useEffect(() => {
    const init = async () => {
      await loadSession();
      setAppReady(true);
    };
    init();
  }, [loadSession]);

  useEffect(() => {
    if (!isNative) return;

    let cleanup: (() => void) | undefined;

    (async () => {
      await initMobilePlugins();
      const { App: CapApp } = await import('@capacitor/app');
      const listener = await CapApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          navigate(-1);
        } else {
          CapApp.minimizeApp();
        }
      });
      cleanup = () => listener.remove();
    })();

    return () => { cleanup?.(); };
  }, [navigate]);

  // Show loading screen while checking auth
  if (!appReady && isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
      <Route path="/" element={<ChatLayout />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
