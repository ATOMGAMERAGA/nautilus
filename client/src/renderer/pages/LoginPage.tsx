import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-screen bg-background-tertiary flex items-center justify-center p-4">
      <div className="bg-background-primary p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-header-primary">Welcome back!</h1>
          <p className="text-header-secondary">We're so excited to see you again!</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-header-secondary uppercase mb-2">
              Username
            </label>
            <input
              type="text"
              className="w-full bg-background-tertiary border-none rounded p-3 text-header-primary focus:ring-2 focus:ring-nautilus outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-header-secondary mt-1">
              Note: Password recovery is not available. Don't lose it!
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-nautilus hover:bg-nautilus/80 text-white font-bold py-3 rounded transition duration-200 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>

          <p className="text-sm text-header-secondary">
            Need an account? <Link to="/register" className="text-nautilus hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
