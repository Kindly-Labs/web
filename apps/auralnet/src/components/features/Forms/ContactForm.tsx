import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ContactType = 'sales' | 'expert' | 'feedback';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

const ContactForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ContactType>('sales');
  const [isSubmitted, setIsSubmitted] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const type = params.get('type') as ContactType;
      if (type && ['sales', 'expert', 'feedback'].includes(type)) {
        setActiveTab(type);
      }
    }
  }, []);

  const tabs: { id: ContactType; label: string; icon: string; description: string }[] = [
    {
      id: 'sales',
      label: 'Enterprise Sales',
      icon: '🏢',
      description: 'Partner with us to access dialect datasets for your AI products.',
    },
    {
      id: 'expert',
      label: 'Dialect Expert',
      icon: '🎓',
      description: 'Contribute linguistic expertise to help us map dialects accurately.',
    },
    {
      id: 'feedback',
      label: 'Community',
      icon: '💬',
      description: 'Share feedback, report issues, or just say hello.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to backend
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const renderForm = () => {
    if (isSubmitted) {
      return (
        <div className="py-12 text-center">
          <div className="mb-4 text-4xl">✓</div>
          <h3 className="text-foreground mb-2 text-xl font-bold">Message Sent!</h3>
          <p className="text-muted-foreground">We'll get back to you soon.</p>
        </div>
      );
    }

    const commonFields = (
      <>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-muted-foreground mb-2 block text-sm font-medium">Name *</label>
            <input
              type="text"
              name="name"
              required
              className="text-foreground placeholder:text-muted-foreground focus:ring-primary/50 focus:border-primary/50 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-all focus:ring-2 focus:outline-none"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-muted-foreground mb-2 block text-sm font-medium">Email *</label>
            <input
              type="email"
              name="email"
              required
              className="text-foreground placeholder:text-muted-foreground focus:ring-primary/50 focus:border-primary/50 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-all focus:ring-2 focus:outline-none"
              placeholder="you@company.com"
            />
          </div>
        </div>
      </>
    );

    switch (activeTab) {
      case 'sales':
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            {commonFields}
            <div>
              <label className="text-muted-foreground mb-2 block text-sm font-medium">
                Company
              </label>
              <input
                type="text"
                name="company"
                className="text-foreground placeholder:text-muted-foreground focus:ring-primary/50 focus:border-primary/50 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-all focus:ring-2 focus:outline-none"
                placeholder="Your company name"
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block text-sm font-medium">
                What dialects are you interested in?
              </label>
              <input
                type="text"
                name="dialects"
                className="text-foreground placeholder:text-muted-foreground focus:ring-primary/50 focus:border-primary/50 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-all focus:ring-2 focus:outline-none"
                placeholder="e.g., Toishanese, Cantonese, Patois..."
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block text-sm font-medium">
                Tell us about your project *
              </label>
              <textarea
                name="message"
                required
                rows={4}
                className="text-foreground placeholder:text-muted-foreground focus:ring-primary/50 focus:border-primary/50 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-all focus:ring-2 focus:outline-none"
                placeholder="What are you building? How can we help?"
              />
            </div>
            <button type="submit" className="btn-accent w-full py-3 text-base">
              Request Partnership
            </button>
          </form>
        );

      case 'expert':
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            {commonFields}
            <div>
              <label className="text-muted-foreground mb-2 block text-sm font-medium">
                What dialects do you speak? *
              </label>
              <input
                type="text"
                name="dialects"
                required
                className="text-foreground placeholder:text-muted-foreground focus:ring-primary/50 focus:border-primary/50 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-all focus:ring-2 focus:outline-none"
                placeholder="e.g., Native Toishanese speaker, fluent in Hokkien..."
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block text-sm font-medium">
                Background (optional)
              </label>
              <textarea
                name="background"
                rows={3}
                className="text-foreground placeholder:text-muted-foreground focus:ring-primary/50 focus:border-primary/50 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-all focus:ring-2 focus:outline-none"
                placeholder="Linguistics researcher, community elder, language teacher..."
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block text-sm font-medium">
                How would you like to contribute? *
              </label>
              <textarea
                name="contribution"
                required
                rows={3}
                className="text-foreground placeholder:text-muted-foreground focus:ring-primary/50 focus:border-primary/50 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-all focus:ring-2 focus:outline-none"
                placeholder="Voice recordings, validation, phrase curation, translation..."
              />
            </div>
            <button type="submit" className="btn-accent w-full py-3 text-base">
              Apply as Expert
            </button>
          </form>
        );

      case 'feedback':
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-muted-foreground mb-2 block text-sm font-medium">
                Your Feedback *
              </label>
              <textarea
                name="feedback"
                required
                rows={5}
                className="text-foreground placeholder:text-muted-foreground focus:ring-primary/50 focus:border-primary/50 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-all focus:ring-2 focus:outline-none"
                placeholder="Share your thoughts, ideas, bug reports, or just say hello..."
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-muted-foreground mb-2 block text-sm font-medium">
                  Name (optional)
                </label>
                <input
                  type="text"
                  name="name"
                  className="text-foreground placeholder:text-muted-foreground focus:ring-primary/50 focus:border-primary/50 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-all focus:ring-2 focus:outline-none"
                  placeholder="Anonymous"
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-2 block text-sm font-medium">
                  Email (optional)
                </label>
                <input
                  type="email"
                  name="email"
                  className="text-foreground placeholder:text-muted-foreground focus:ring-primary/50 focus:border-primary/50 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-all focus:ring-2 focus:outline-none"
                  placeholder="If you want a response..."
                />
              </div>
            </div>
            <button type="submit" className="btn-accent w-full py-3 text-base">
              Send Feedback
            </button>
          </form>
        );
    }
  };

  return (
    <div className="w-full">
      {/* Tab Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-2xl border p-6 text-left transition-all duration-300 ${
              activeTab === tab.id
                ? 'border-primary/50 shadow-primary/10 bg-white/10 shadow-lg'
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
            } `}
          >
            <div className="mb-3 text-2xl">{tab.icon}</div>
            <h3
              className={`mb-1 font-bold ${activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              {tab.label}
            </h3>
            <p className="text-muted-foreground text-xs">{tab.description}</p>
          </button>
        ))}
      </div>

      {/* Form Area */}
      <div className="glass-panel p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderForm()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ContactForm;
