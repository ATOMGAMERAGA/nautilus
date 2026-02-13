import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

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
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-start sm:justify-center p-4 sm:p-6 relative overflow-y-auto overflow-x-hidden bg-background">
      <div className="relative z-10 w-full max-w-[400px] animate-fade-in flex flex-col py-8 sm:py-0">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[24px] bg-primary-container mb-6 shadow-elevation-1 overflow-hidden">
            <img src="/icon.png" alt="Nautilus" className="w-10 h-10 object-contain" onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = '<span class="material-symbols-outlined text-primary text-[32px]">anchor</span>';
            }} />
          </div>
          <h1 className="text-headline-medium font-bold text-on-background tracking-tight">Sign in</h1>
          <p className="text-body-medium text-on-surface-variant mt-2">to continue to Nautilus</p>
        </div>

        {/* M3 Card */}
        <div className="m3-card w-full">
          {error && (
            <div className="flex items-center gap-3 bg-error-container text-on-error-container p-4 rounded-[12px] mb-6 text-body-small animate-fade-in">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span className="flex-1 leading-tight">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="m3-text-field">
              <input
                type="text"
                className="m3-input"
                placeholder=" "
                value={username}
                onChange={(e) => { setUsername(e.target.value); clearError(); }}
                required
                id="username"
              />
              <label htmlFor="username" className="m3-input-label">Username</label>
            </div>

            <div className="m3-text-field">
              <input
                type={showPassword ? 'text' : 'password'}
                className="m3-input pr-12"
                placeholder=" "
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                required
                id="password"
              />
              <label htmlFor="password" className="m3-input-label">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-4 text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-full hover:bg-on-surface/[0.08]"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="m3-button-filled w-full !h-12"
              >
                {isLoading ? (
                  <>
                    <div className="spinner" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>

            <div className="text-center pt-2">
              <Link to="/register" className="m3-button-text w-full">
                Create account
              </Link>
            </div>
          </form>
        </div>
        
        {/* Footer spacer */}
        <div className="h-8 sm:hidden" />
      </div>
    </div>
  );
}
