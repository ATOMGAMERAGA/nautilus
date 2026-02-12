import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    display_name: '',
  });
  const [ack, setAck] = useState(false);
  const { register, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ack) return;
    try {
      await register(formData);
    } catch (err) {
      // Error handled by store
    }
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[a-z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 25;
    return strength;
  };

  const strength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-background-tertiary flex items-center justify-center p-4">
      <div className="bg-background-primary p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-header-primary">Create an account</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="bg-red-500/20 border-l-4 border-red-500 p-4 mb-6">
          <h3 className="text-red-500 font-bold text-sm uppercase flex items-center">
            ⚠️ NEVER FORGET YOUR PASSWORD!
          </h3>
          <p className="text-header-primary text-xs mt-1">
            Nautilus does not have a password reset system. If you lose your password, you will lose access to your account forever.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-header-secondary uppercase mb-2">
              Username
            </label>
            <input
              type="text"
              className="w-full bg-background-tertiary border-none rounded p-3 text-header-primary focus:ring-2 focus:ring-nautilus outline-none"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-header-secondary uppercase mb-2">
              Password
            </label>
            <input
              type="password"
              className="w-full bg-background-tertiary border-none rounded p-3 text-header-primary focus:ring-2 focus:ring-nautilus outline-none"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <div className="mt-2 h-1 w-full bg-background-tertiary rounded overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${strength < 50 ? 'bg-red-500' : strength < 100 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${strength}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-start space-x-2 py-2">
            <input
              type="checkbox"
              id="ack"
              className="mt-1"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
              required
            />
            <label htmlFor="ack" className="text-xs text-header-secondary leading-tight">
              I understand that if I lose my password, I will not be able to recover my account.
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || !ack}
            className="w-full bg-nautilus hover:bg-nautilus/80 text-white font-bold py-3 rounded transition duration-200 disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Continue'}
          </button>

          <p className="text-sm text-header-secondary">
            <Link to="/login" className="text-nautilus hover:underline">Already have an account?</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
