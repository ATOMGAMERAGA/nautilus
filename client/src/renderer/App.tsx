import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ChatLayout } from './pages/ChatLayout'
import { isNative } from './services/platform'
import { initMobilePlugins } from './services/mobileInit'

function AppRoutes() {
  const { isAuthenticated, loadSession } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadSession();
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

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
      <Route path="/" element={isAuthenticated ? <ChatLayout /> : <Navigate to="/login" />} />
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
