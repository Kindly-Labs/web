import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Is this really free?',
    answer:
      "Yes. Owly Labs is a Fair Trade AI organization. Our mission is funded by donations and grants, not by charging small businesses. All 'Tier 0' resources and 'Tier 1' volunteer consultations are 100% free.",
  },
  {
    question: 'Do I own the work you produce?',
    answer:
      'Absolutely. Any website code, graphics, or accounts we set up for you are your property. We provide full administrative credentials upon completion.',
  },
  {
    question: 'What if I need ongoing maintenance?',
    answer:
      "We focus on 'capacity building', meaning we train you to manage your own systems. We do not offer ongoing managed services (like 24/7 IT support), but we provide guides and can refer you to paid local vendors for long-term needs.",
  },
  {
    question: "Do I need to be 'tech-savvy'?",
    answer:
      'No! Our resources are designed for beginners. If you can check email, you can use our tools. Our volunteers are trained to explain things in plain English, not jargon.',
  },
];

const FAQItem: React.FC<{ item: FAQItem }> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg px-4 py-4 text-left transition-colors hover:bg-white/5"
      >
        <span className="text-text-light font-mono font-bold">{item.question}</span>
        <span
          className={`text-neon-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="text-text-muted px-4 pb-4 text-sm leading-relaxed">{item.answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ServiceFAQ: React.FC = () => {
  return (
    <div className="bg-glass-surface/20 overflow-hidden rounded-xl border border-white/10 backdrop-blur-sm">
      {faqs.map((faq, idx) => (
        <FAQItem key={idx} item={faq} />
      ))}
    </div>
  );
};

export default ServiceFAQ;
