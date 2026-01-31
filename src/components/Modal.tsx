import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  icon?: React.ElementType;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, icon: Icon }) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={clsx(
                "bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl pointer-events-auto flex flex-col max-h-[80vh]",
                isAr && "font-arabic text-right"
              )}
            >
              {/* Header */}
              <div className={clsx(
                "p-5 border-b border-slate-800 flex items-center justify-between shrink-0", 
                isAr && "flex-row-reverse"
              )}>
                 <div className={clsx("flex items-center gap-3", isAr && "flex-row-reverse")}>
                    {Icon && <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Icon size={20} /></div>}
                    <h3 className="text-lg font-bold text-slate-100">{title}</h3>
                 </div>
                 <button 
                   onClick={onClose}
                   className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
                 >
                   <X size={20} />
                 </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                 {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
