import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { User, KeyRound, Eye, EyeOff, AlertCircle, AtSign, AlertTriangle, Check } from 'lucide-react';

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
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-start sm:justify-center p-4 sm:p-6 relative overflow-y-auto overflow-x-hidden bg-[#0c0d10]">
      {/* Animated gradient background - Fixed */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0c0d10] via-[#1a1147] to-[#0c0d10] animate-gradient pointer-events-none" />

      {/* Floating orbs - Hidden on mobile */}
      <div className="hidden sm:block fixed top-1/3 right-1/4 w-96 h-96 bg-[#5865f2]/10 rounded-full blur-[128px] animate-float pointer-events-none" />
      <div className="hidden sm:block fixed bottom-1/3 left-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[128px] animate-float pointer-events-none" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 w-full max-w-[440px] animate-fade-in flex flex-col py-8 sm:py-0">
        {/* Logo Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#5865f2] mb-4 animate-pulse-glow shadow-lg shadow-[#5865f2]/20 overflow-hidden">
            <img src="/icon.png" alt="Nautilus" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"/><path d="M12 2a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7Z"/></svg>';
            }} />
          </div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-white tracking-tight">Create an account</h1>
        </div>

        {/* Card Section */}
        <div className="glass-heavy rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40 w-full mx-auto border border-white/5">
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-5 text-sm animate-fade-in">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span className="flex-1 leading-tight">{error}</span>
            </div>
          )}

          {/* Warning */}
          <div className="flex gap-3 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3.5 mb-6">
            <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-400 font-semibold text-[10px] sm:text-xs uppercase tracking-wide">Never forget your password!</p>
              <p className="text-[#b5bac1] text-[10px] sm:text-xs mt-1 leading-relaxed">
                Nautilus has no password reset. If lost, your account is gone forever.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] sm:text-xs font-semibold text-[#b5bac1] uppercase tracking-wider ml-1">
                Display Name
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6d6f78] pointer-events-none" />
                <input
                  type="text"
                  className="input-modern pl-11 py-2.5 sm:py-3"
                  placeholder="How others will see you"
                  value={formData.display_name}
                  onChange={(e) => { setFormData({ ...formData, display_name: e.target.value }); clearError(); }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] sm:text-xs font-semibold text-[#b5bac1] uppercase tracking-wider ml-1">
                Username
              </label>
              <div className="relative">
                <AtSign size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6d6f78] pointer-events-none" />
                <input
                  type="text"
                  className="input-modern pl-11 py-2.5 sm:py-3"
                  placeholder="Choose a unique username"
                  value={formData.username}
                  onChange={(e) => { setFormData({ ...formData, username: e.target.value }); clearError(); }}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] sm:text-xs font-semibold text-[#b5bac1] uppercase tracking-wider ml-1">
                Password
              </label>
              <div className="relative">
                <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6d6f78] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-modern pl-11 pr-11 py-2.5 sm:py-3"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => { setFormData({ ...formData, password: e.target.value }); clearError(); }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6d6f78] hover:text-[#b5bac1] transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2 space-y-1.5 animate-fade-in">
                  <div className="flex gap-1.5 px-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex-1 h-1 rounded-full bg-[#1e1f22] overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${i < strength.score / 25 ? strength.color : ''}`}
                          style={{ width: i < strength.score / 25 ? '100%' : '0%' }}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-[#6d6f78] ml-1">
                    Password: <span className={`font-medium ${strength.score === 100 ? 'text-green-400' : strength.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{strength.label}</span>
                  </p>
                </div>
              )}
            </div>

            <label
              htmlFor="ack"
              className="flex items-start gap-3 py-1 cursor-pointer group"
            >
              <div className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition-all duration-200 ${ack ? 'bg-[#5865f2] border-[#5865f2]' : 'border-[#4e5058] group-hover:border-[#b5bac1]'}`}>
                {ack && <Check size={12} className="text-white" />}
              </div>
              <input
                type="checkbox"
                id="ack"
                className="sr-only"
                checked={ack}
                onChange={(e) => setAck(e.target.checked)}
                required
              />
              <span className="text-[10px] sm:text-xs text-[#b5bac1] leading-tight select-none">
                I understand that if I lose my password, I will not be able to recover my account.
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading || !ack}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm sm:text-[15px] py-3 sm:py-3.5 mt-2 shadow-lg shadow-[#5865f2]/20"
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  <span>Creating...</span>
                </>
              ) : (
                'Continue'
              )}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-sm text-[#5865f2] hover:text-[#7983f5] font-medium transition-colors hover:underline">
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
