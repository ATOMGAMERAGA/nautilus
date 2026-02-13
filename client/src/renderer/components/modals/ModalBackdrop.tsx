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
      <div className="relative w-full max-w-md bg-surface-container-high rounded-[28px] shadow-elevation-4 overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
        {title && (
          <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between">
            <h2 className="text-title-large font-bold text-on-surface">{title}</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-variant transition-colors">
               <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}
        <div className="overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
