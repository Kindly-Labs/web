'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 to-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Back Button */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-emerald-400 transition-colors hover:text-emerald-300"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Back to Aether</span>
        </Link>

        <h1 className="mb-8 bg-gradient-to-r from-emerald-200 to-teal-200 bg-clip-text text-3xl font-light tracking-wide text-transparent">
          Terms of Service
        </h1>

        <div className="space-y-6 text-sm leading-relaxed text-emerald-100/80">
          <p className="text-xs tracking-wider text-emerald-400/60 uppercase">
            Last Updated: December 2025
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-emerald-300">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Aether (&quot;the Service&quot;), you agree to be bound by
              these Terms of Service. If you do not agree to these terms, please do not use the
              Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-emerald-300">2. Description of Service</h2>
            <p>
              Aether is a voice-first conversational AI platform designed to support endangered
              language preservation, starting with Toishanese (Hoisan-wa). The Service provides
              voice interaction capabilities and language learning support.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-emerald-300">3. Data Collection and Use</h2>
            <p>By using Aether, you understand and agree that:</p>
            <ul className="list-inside list-disc space-y-2 pl-4">
              <li>
                Your voice recordings may be collected and anonymized for language model training
              </li>
              <li>No personally identifiable information is stored with your voice data</li>
              <li>
                Your contributions help preserve endangered languages and improve AI accessibility
              </li>
              <li>You retain no ownership claims over the anonymized data contributions</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-emerald-300">4. Implied Consent</h2>
            <p>
              By recording audio through Aether, you provide implied consent for your voice data to
              be:
            </p>
            <ul className="list-inside list-disc space-y-2 pl-4">
              <li>Anonymized and aggregated with other user data</li>
              <li>Used to train and improve language models</li>
              <li>Contributed to open-source language preservation efforts</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-emerald-300">5. Usage Limitations</h2>
            <p>
              Free users are subject to daily usage limits. Access codes may be provided for
              unlimited usage. The Service reserves the right to modify these limits at any time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-emerald-300">6. Prohibited Uses</h2>
            <p>You agree not to:</p>
            <ul className="list-inside list-disc space-y-2 pl-4">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to circumvent rate limiting or access controls</li>
              <li>Record or share content that violates others&apos; privacy or rights</li>
              <li>Interfere with the proper operation of the Service</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-emerald-300">7. Disclaimer</h2>
            <p>
              The Service is provided &quot;as is&quot; without warranties of any kind. We do not
              guarantee the accuracy of AI responses or translations. The Service is in beta and may
              contain errors.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-emerald-300">8. Contact</h2>
            <p>
              For questions about these terms, please contact the Aether team through the official
              channels.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 border-t border-emerald-500/10 pt-8">
          <p className="text-center text-xs text-emerald-400/40">
            Aether - Preserving Heritage Through Voice
          </p>
        </div>
      </div>
    </div>
  );
}
