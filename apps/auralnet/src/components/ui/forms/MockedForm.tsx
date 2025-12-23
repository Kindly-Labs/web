import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MockedForm Component
 *
 * Reusable form component with mocked backend logic.
 *
 * PRD Requirements (Section 4.5):
 * - Status states: 'idle' | 'submitting' | 'success' | 'error'
 * - Simulation: setTimeout(1500ms) mock delay
 * - Success feedback: Green checkmark with Framer Motion animation
 *
 * Usage:
 * <MockedForm
 *   title="Volunteer Application"
 *   fields={[...]}
 *   onSubmit={(data) => console.log(data)}
 * />
 */

export type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export interface FormField {
  name: string;
  label: string | React.ReactNode;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  options?: string[]; // For select fields
}

interface MockedFormProps {
  title: string;
  description?: string;
  fields: FormField[];
  submitLabel?: string;
  successMessage?: string;
  errorMessage?: string;
  onSubmit?: (data: Record<string, any>) => void;
  simulateError?: boolean; // For testing error state
}

const MockedForm: React.FC<MockedFormProps> = ({
  title,
  description,
  fields,
  submitLabel = 'Submit',
  successMessage = 'Success! Your submission has been received.',
  errorMessage = 'An error occurred. Please try again.',
  onSubmit,
  simulateError = false,
}) => {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Set to submitting state
    setStatus('submitting');

    // Mock backend delay (1500ms as per PRD)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate success or error
    if (simulateError) {
      setStatus('error');
    } else {
      setStatus('success');
      onSubmit?.(formData);
    }

    // Reset to idle after showing success/error for 3 seconds
    if (!simulateError) {
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const renderField = (field: FormField) => {
    const baseClasses =
      'w-full px-4 py-3 rounded-lg bg-forest-700/50 border border-glass-stroke text-text-light placeholder-text-muted focus:outline-none focus:border-neon-400 transition-colors';

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            name={field.name}
            placeholder={field.placeholder}
            required={field.required}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={`${baseClasses} min-h-[120px]`}
            disabled={status === 'submitting'}
          />
        );

      case 'select':
        return (
          <select
            name={field.name}
            required={field.required}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={baseClasses}
            disabled={status === 'submitting'}
          >
            <option value="">Select...</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name={field.name}
              required={field.required}
              checked={formData[field.name] || false}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              className="border-glass-stroke bg-forest-700/50 text-neon-400 focus:ring-neon-400 h-5 w-5 rounded focus:ring-offset-0"
              disabled={status === 'submitting'}
            />
            <span className="text-text-light text-sm">{field.label}</span>
          </label>
        );

      default:
        return (
          <input
            type={field.type}
            name={field.name}
            placeholder={field.placeholder}
            required={field.required}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={baseClasses}
            disabled={status === 'submitting'}
          />
        );
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          // Success State: Green Checkmark
          <motion.div
            key="success"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="glass-card p-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-neon-400 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full"
            >
              <svg
                className="text-forest-900 h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
            <h3 className="text-text-light mb-2 font-mono text-2xl font-bold">Success!</h3>
            <p className="text-text-muted">{successMessage}</p>
          </motion.div>
        ) : (
          // Form State
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-8"
          >
            <h2 className="text-text-light mb-2 font-mono text-3xl font-bold">{title}</h2>
            {description && <p className="text-text-muted mb-6">{description}</p>}

            <form onSubmit={handleSubmit} className="space-y-6">
              {fields.map((field) => (
                <div key={field.name}>
                  {field.type !== 'checkbox' && (
                    <label className="text-text-light mb-2 block text-sm font-medium">
                      {field.label}
                      {field.required && <span className="text-neon-400 ml-1">*</span>}
                    </label>
                  )}
                  {renderField(field)}
                </div>
              ))}

              {/* Error Message */}
              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-400"
                >
                  {errorMessage}
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="tech-button-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === 'submitting' ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⚙</span>
                    Processing...
                  </span>
                ) : (
                  submitLabel
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MockedForm;
