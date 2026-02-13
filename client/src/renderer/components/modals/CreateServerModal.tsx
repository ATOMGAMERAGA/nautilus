import React, { useState } from 'react';
import { ModalBackdrop } from './ModalBackdrop';

interface CreateServerModalProps {
  onClose: () => void;
  onCreate: (name: string, iconUrl?: string) => void;
}

export const CreateServerModal: React.FC<CreateServerModalProps> = ({ onClose, onCreate }) => {
  const [serverName, setServerName] = useState('');

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-headline-small font-bold text-on-surface mb-3">Create Your Server</h2>
          <p className="text-body-medium text-on-surface-variant leading-relaxed">
            Your server is where you and your friends hang out. Make yours and start talking.
          </p>
        </div>

        {/* Icon Upload Placeholder */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-[24px] bg-surface-container-highest border-2 border-dashed border-outline-variant flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 hover:border-primary transition-all duration-200 group">
            <span className="material-symbols-outlined text-[32px] text-primary group-hover:scale-110 transition-transform">add_a_photo</span>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant mt-1">Upload</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="m3-text-field">
            <input
              type="text"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              placeholder=" "
              className="m3-input"
              autoFocus
              id="serverName"
            />
            <label htmlFor="serverName" className="m3-input-label">Server Name</label>
          </div>

          <p className="text-body-small text-on-surface-variant text-center px-4 leading-normal italic opacity-80">
            By creating a server, you agree to Nautilus's <a href="#" className="text-primary hover:underline font-bold">Community Guidelines</a>.
          </p>
        </div>
      </div>

      <div className="bg-surface-container-highest p-6 flex justify-between items-center gap-4 border-t border-outline-variant/10">
        <button 
          onClick={onClose}
          className="m3-button-text flex-1"
        >
          Back
        </button>
        <button
          onClick={() => {
            if (serverName.trim()) {
              onCreate(serverName);
              onClose();
            }
          }}
          disabled={!serverName.trim()}
          className="m3-button-filled flex-[2] !h-12"
        >
          Create
        </button>
      </div>
    </ModalBackdrop>
  );
};
