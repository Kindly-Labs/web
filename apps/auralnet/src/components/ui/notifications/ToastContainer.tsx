import React from 'react';
import { useStore } from '@nanostores/react';
import { AnimatePresence, motion } from 'framer-motion';
import { notifications, removeNotification } from '../../../stores/notificationStore';

const ToastContainer: React.FC = () => {
  const $notifications = useStore(notifications);

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {$notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            layout
            className="glass-card pointer-events-auto flex max-w-md min-w-[300px] items-start gap-3 p-4 shadow-lg backdrop-blur-xl"
          >
            {/* Icon based on type */}
            <div className="mt-1 shrink-0">
              {notification.type === 'success' && (
                <svg
                  className="text-neon-400 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {notification.type === 'error' && (
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
              {notification.type === 'info' && (
                <svg
                  className="h-5 w-5 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>

            <div className="flex-1">
              <p className="text-text-light text-sm font-medium">{notification.message}</p>
            </div>

            <button
              onClick={() => removeNotification(notification.id)}
              className="text-text-muted hover:text-text-light shrink-0 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
