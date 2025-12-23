import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  noContentPadding?: boolean;
}

const GlassModal: React.FC<GlassModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  noContentPadding = false,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Use portal if document is available (client-side)
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md"
          />

          {/* Modal */}
          <div className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="pointer-events-auto flex h-[90vh] w-full max-w-7xl flex-col"
            >
              {/* Glass Card Container */}
              <div className="bg-forest-900/95 relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
                {/* Header */}
                <div className="flex flex-shrink-0 items-center justify-between border-b border-white/5 px-8 py-6">
                  <h2 className="text-neon-400 font-mono text-2xl font-bold">{title}</h2>
                  <button
                    onClick={onClose}
                    className="text-text-muted hover:text-text-light rounded-full p-2 transition-colors hover:bg-white/5"
                    aria-label="Close modal"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Content Area */}
                {noContentPadding ? (
                  <div className="text-text-light flex-1 overflow-hidden">{children}</div>
                ) : (
                  <div className="text-text-light custom-scrollbar flex-1 overflow-y-auto px-8 py-6">
                    <div className="prose prose-invert prose-lg max-w-none">{children}</div>
                  </div>
                )}

                {/* Footer removed for immersive view - control moved to header close button */}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default GlassModal;
