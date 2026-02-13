import React, { type ReactNode } from 'react';

interface ModalBackdropProps {
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export const ModalBackdrop: React.FC<ModalBackdropProps> = ({ onClose, children, title }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface rounded-[28px] shadow-elevation-5 overflow-hidden animate-scale-in flex flex-col max-h-[90vh] border border-outline-variant/10">
        {title && (
          <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between bg-surface">
            <h2 className="text-title-large font-bold text-on-surface">{title}</h2>
            <button onClick={onClose} className="m3-icon-button">
               <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}
        <div className="overflow-y-auto thin-scrollbar flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
