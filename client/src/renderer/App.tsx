import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ChatLayout } from './pages/ChatLayout'

function App() {
  const { isAuthenticated, loadSession } = useAuthStore();

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
        <Route path="/" element={isAuthenticated ? <ChatLayout /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
