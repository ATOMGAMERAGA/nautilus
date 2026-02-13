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
      <div className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-on-surface mb-2">Create Your Server</h2>
          <p className="text-on-surface-variant text-body-medium">
            Your server is where you and your friends hang out. Make yours and start talking.
          </p>
        </div>

        {/* Icon Upload Placeholder */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-outline-variant flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-highest transition-colors">
            <span className="material-symbols-outlined text-[32px] text-primary">add_a_photo</span>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant mt-1">Upload</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-label-large font-bold text-on-surface-variant mb-1 uppercase text-xs">
              Server Name
            </label>
            <input
              type="text"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              placeholder="My Awesome Server"
              className="w-full px-4 py-3 bg-surface-container-high rounded-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
              autoFocus
            />
          </div>

          <div className="text-xs text-on-surface-variant">
            By creating a server, you agree to Nautilus's <a href="#" className="text-primary hover:underline">Community Guidelines</a>.
          </div>
        </div>
      </div>

      <div className="bg-surface-container p-4 flex justify-between items-center">
        <button 
          onClick={onClose}
          className="text-on-surface hover:underline px-4 py-2 text-label-large"
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
          className="bg-primary text-on-primary px-8 py-2.5 rounded-full font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-elevation-1"
        >
          Create
        </button>
      </div>
    </ModalBackdrop>
  );
};
