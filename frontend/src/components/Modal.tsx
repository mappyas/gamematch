'use client';

import { ReactNode } from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-[#12121a] to-[#0a0a0f] border border-white/10 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg hover:bg-red-500/20 hover:border-red-500/50 transition-all"
          >
            <span className="text-xl text-gray-400 hover:text-red-400">×</span>
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
