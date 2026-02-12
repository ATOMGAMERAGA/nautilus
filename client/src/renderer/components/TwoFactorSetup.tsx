import { useState } from 'react';
import { api } from '../services/api';
import { Lock, ShieldCheck, X } from 'lucide-react';

export function TwoFactorSetup({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'generate' | 'verify' | 'success'>('generate');
  const [secretData, setSecretData] = useState<{ secret: string, qrImageUrl: string } | null>(null);
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      const res = await api.post('/2fa/generate');
      setSecretData(res.data);
      setStep('verify');
    } catch (err) {
      setError('Failed to generate 2FA secret');
    }
  };

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/2fa/enable', { token });
      setStep('success');
    } catch (err) {
      setError('Invalid token. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
      <div className="bg-background-primary w-full max-w-md rounded-lg shadow-2xl p-6 border border-background-tertiary relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-header-secondary hover:text-white">
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <ShieldCheck className="mr-2 text-nautilus" /> Two-Factor Authentication
        </h2>

        {step === 'generate' && (
          <div className="text-center space-y-6">
            <div className="bg-background-secondary p-4 rounded-lg flex flex-col items-center">
              <Lock size={48} className="text-nautilus mb-2" />
              <p className="text-header-secondary text-sm">
                Protect your account with an extra layer of security. Once enabled, you'll need to enter a code from your authenticator app to log in.
              </p>
            </div>
            <button 
              onClick={handleGenerate}
              className="w-full bg-nautilus text-white py-2 rounded font-bold hover:bg-nautilus/80 transition-colors"
            >
              Get Started
            </button>
          </div>
        )}

        {step === 'verify' && secretData && (
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <p className="text-header-secondary text-sm text-center">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.).
              </p>
              <img src={secretData.qrImageUrl} alt="2FA QR Code" className="w-48 h-48 rounded bg-white p-2" />
              <div className="text-xs text-header-secondary font-mono bg-background-tertiary px-2 py-1 rounded">
                Secret: {secretData.secret}
              </div>
            </div>

            <form onSubmit={handleEnable} className="space-y-2">
              <label className="text-xs font-bold text-header-secondary uppercase">Enter Code</label>
              <input 
                type="text" 
                maxLength={6}
                placeholder="000000"
                className="w-full bg-background-tertiary rounded p-3 text-center text-white text-xl tracking-widest outline-none focus:ring-2 focus:ring-nautilus"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
              />
              {error && <div className="text-red-500 text-xs text-center">{error}</div>}
              <button 
                type="submit"
                disabled={token.length !== 6}
                className="w-full bg-nautilus text-white py-2 rounded font-bold hover:bg-nautilus/80 transition-colors disabled:opacity-50 mt-2"
              >
                Enable 2FA
              </button>
            </form>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-6 py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500">
              <Check size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">2FA Enabled!</h3>
              <p className="text-header-secondary text-sm mt-2">
                Your account is now more secure. Next time you log in, you'll be asked for a verification code.
              </p>
            </div>
            <button 
              onClick={onClose}
              className="w-full bg-background-tertiary text-white py-2 rounded font-bold hover:bg-background-secondary transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import { Check } from 'lucide-react';
