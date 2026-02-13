import { useState } from 'react';
import { api } from '../services/api';

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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface w-full max-w-md rounded-[28px] shadow-elevation-5 p-8 border border-outline-variant/10 animate-scale-in">
        <button onClick={onClose} className="m3-icon-button absolute top-4 right-4">
          <span className="material-symbols-outlined">close</span>
        </button>

        <h2 className="text-headline-small font-bold text-on-surface mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[28px]">shield_lock</span>
          2FA Setup
        </h2>

        {step === 'generate' && (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="bg-surface-container-highest/50 p-6 rounded-[24px] flex flex-col items-center border border-outline-variant/5">
              <span className="material-symbols-outlined text-[64px] text-primary mb-4">lock_reset</span>
              <p className="text-body-medium text-on-surface-variant leading-relaxed">
                Add an extra layer of security. You'll need a code from your authenticator app to sign in.
              </p>
            </div>
            <button 
              onClick={handleGenerate}
              className="m3-button-filled w-full !h-12 shadow-lg shadow-primary/20"
            >
              Get Started
            </button>
          </div>
        )}

        {step === 'verify' && secretData && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col items-center gap-4">
              <p className="text-body-small text-on-surface-variant text-center px-4">
                Scan this QR code with your authenticator app.
              </p>
              <div className="p-4 bg-white rounded-[24px] shadow-elevation-1">
                <img src={secretData.qrImageUrl} alt="2FA QR Code" className="w-44 h-44" />
              </div>
              <div className="text-[10px] font-mono font-bold text-primary bg-primary-container/30 px-3 py-1.5 rounded-full border border-primary/10">
                CODE: {secretData.secret}
              </div>
            </div>

            <form onSubmit={handleEnable} className="space-y-4">
              <div className="m3-text-field">
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder=" "
                  className="m3-input !text-center !text-2xl !tracking-[0.5em] !font-bold"
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value.replace(/\D/g, ''));
                    setError(null);
                  }}
                  id="token"
                  autoFocus
                />
                <label htmlFor="token" className="m3-input-label !left-0 !right-0 !text-center">Verification Code</label>
              </div>
              
              {error && (
                <p className="text-error text-[11px] font-bold text-center animate-shake">{error}</p>
              )}
              
              <button 
                type="submit"
                disabled={token.length !== 6}
                className="m3-button-filled w-full !h-12 mt-2"
              >
                Verify & Enable
              </button>
            </form>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-8 py-4 animate-fade-in">
            <div className="w-20 h-20 bg-primary-container rounded-[24px] flex items-center justify-center mx-auto text-primary shadow-elevation-1">
              <span className="material-symbols-outlined text-[48px]">verified_user</span>
            </div>
            <div>
              <h3 className="text-title-large font-bold text-on-surface">Successfully Enabled!</h3>
              <p className="text-body-medium text-on-surface-variant mt-3 leading-relaxed">
                Your account is now protected. We'll ask for a code on your next login.
              </p>
            </div>
            <button 
              onClick={onClose}
              className="m3-button-tonal w-full !h-12"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
