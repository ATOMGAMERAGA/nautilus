import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    display_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [ack, setAck] = useState(false);
  const { register, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ack) return;
    if (formData.password.length < 8) {
      // In a real app we might set a local error state
      return;
    }
    await register(formData);
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[a-z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd)) score += 25;
    if (score <= 25) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 50) return { score, label: 'Fair', color: 'bg-orange-500' };
    if (score <= 75) return { score, label: 'Good', color: 'bg-yellow-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  const strength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-start sm:justify-center p-4 sm:p-6 relative overflow-y-auto overflow-x-hidden bg-background">
      <div className="relative z-10 w-full max-w-[400px] animate-fade-in flex flex-col py-8 sm:py-0">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[24px] bg-primary-container mb-6 shadow-elevation-1 overflow-hidden">
            <img src="/icon.png" alt="Nautilus" className="w-10 h-10 object-contain" onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = '<span class="material-symbols-outlined text-primary text-[32px]">person_add</span>';
            }} />
          </div>
          <h1 className="text-headline-medium font-bold text-on-background tracking-tight">Create account</h1>
          <p className="text-body-medium text-on-surface-variant mt-2">to get started with Nautilus</p>
        </div>

        {/* M3 Card */}
        <div className="m3-card w-full">
          {error && (
            <div className="flex items-center gap-3 bg-error-container text-on-error-container p-4 rounded-[12px] mb-6 text-body-small animate-fade-in">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span className="flex-1 leading-tight">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="m3-text-field">
              <input
                type="text"
                className="m3-input"
                placeholder=" "
                value={formData.display_name}
                onChange={(e) => { setFormData({ ...formData, display_name: e.target.value }); clearError(); }}
                id="display_name"
              />
              <label htmlFor="display_name" className="m3-input-label">Display Name</label>
            </div>

            <div className="m3-text-field">
              <input
                type="text"
                className="m3-input"
                placeholder=" "
                value={formData.username}
                onChange={(e) => { setFormData({ ...formData, username: e.target.value }); clearError(); }}
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
                value={formData.password}
                onChange={(e) => { setFormData({ ...formData, password: e.target.value }); clearError(); }}
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

            {formData.password && (
              <div className="px-1 py-1 space-y-2">
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex-1 h-1 rounded-full bg-surface-variant overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${i < strength.score / 25 ? strength.color : ''}`}
                        style={{ width: i < strength.score / 25 ? '100%' : '0%' }}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-label-small text-on-surface-variant font-medium">
                  Strength: <span className={strength.score === 100 ? 'text-green-500' : strength.score >= 50 ? 'text-yellow-600' : 'text-error'}>{strength.label}</span>
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 py-2">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="ack"
                  className="peer h-5 w-5 appearance-none rounded border-2 border-outline transition-all checked:border-primary checked:bg-primary cursor-pointer"
                  checked={ack}
                  onChange={(e) => setAck(e.target.checked)}
                  required
                />
                <span className="material-symbols-outlined absolute left-0 text-white opacity-0 peer-checked:opacity-100 pointer-events-none text-[18px]">check</span>
              </div>
              <label htmlFor="ack" className="text-body-small text-on-surface-variant leading-tight cursor-pointer select-none">
                I understand that password recovery is not available.
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !ack}
                className="m3-button-filled w-full !h-12"
              >
                {isLoading ? (
                  <>
                    <div className="spinner" />
                    <span>Creating...</span>
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            <div className="text-center pt-2">
              <Link to="/login" className="m3-button-text w-full">
                Already have an account?
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
