import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsletterFormProps {
  placeholder: string;
  buttonText: string;
}

const NewsletterForm: React.FC<NewsletterFormProps> = ({ placeholder, buttonText }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Success simulation
    setIsSuccess(true);
    setEmail('');
    setIsSubmitting(false);

    // Reset after delay (optional, but good for repeated testing)
    // setTimeout(() => setIsSuccess(false), 5000);
  };

  return (
    <div className="relative h-[42px] w-full max-w-md">
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-glass-surface/50 border-neon-400/30 absolute inset-0 flex items-center gap-3 rounded-lg border px-4 py-2 backdrop-blur-md"
          >
            <svg
              className="text-neon-400 h-5 w-5 shrink-0"
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
            <span className="text-neon-400 text-sm font-medium">Subscribed successfully!</span>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="absolute inset-0 flex w-full flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              className="focus:border-neon-400/50 w-full flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/30 transition-colors outline-none focus:bg-white/10 disabled:opacity-50"
              required
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-neon-400/10 text-neon-400 hover:bg-neon-400/20 border-neon-400/20 flex min-w-[100px] items-center justify-center rounded-lg border px-6 py-2 text-sm font-bold whitespace-nowrap transition-all hover:shadow-[0_0_15px_rgba(74,222,128,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <svg
                  className="text-neon-400 h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                buttonText
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewsletterForm;
