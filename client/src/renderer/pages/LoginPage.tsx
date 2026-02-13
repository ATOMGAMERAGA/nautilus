import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { User, KeyRound, Eye, EyeOff, AlertCircle, Shell } from 'lucide-react';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0c0d10] via-[#1a1147] to-[#0c0d10] animate-gradient" />

      {/* Floating orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-[#5865f2]/10 rounded-full blur-[128px] animate-float" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[128px] animate-float" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 w-full max-w-[440px] animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#5865f2] mb-4 animate-pulse-glow shadow-lg shadow-[#5865f2]/20">
            <Shell size={32} className="text-white" />
          </div>
          <h1 className="text-[28px] font-bold text-white tracking-tight">Welcome back!</h1>
          <p className="text-[#b5bac1] mt-1 text-[15px]">We're so excited to see you again!</p>
        </div>

        {/* Card */}
        <div className="glass-heavy rounded-2xl p-8 shadow-2xl shadow-black/40">
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-5 text-sm animate-fade-in">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#b5bac1] uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6d6f78] pointer-events-none" />
                <input
                  type="text"
                  className="input-modern pl-11"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); clearError(); }}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#b5bac1] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6d6f78] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-modern pl-11 pr-11"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6d6f78] hover:text-[#b5bac1] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-[11px] text-[#6d6f78] mt-2">
                Password recovery is not available. Don't lose it!
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 text-[15px] py-3"
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  <span>Logging in...</span>
                </>
              ) : (
                'Log In'
              )}
            </button>

            <p className="text-sm text-[#b5bac1] text-center pt-1">
              Need an account?{' '}
              <Link to="/register" className="text-[#5865f2] hover:text-[#7983f5] font-medium transition-colors hover:underline">
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
