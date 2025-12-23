'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>

        <div className="space-y-6 text-sm leading-relaxed text-emerald-100/80">
          <p className="text-xs tracking-wider text-emerald-400/60 uppercase">
            Last Updated: December 2025
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-emerald-300">1. Overview</h2>
            <p>
              Aether is committed to protecting your privacy while advancing language preservation.
              This policy explains how we collect, use, and safeguard your information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-emerald-300">2. Data We Collect</h2>

            <h3 className="mt-4 font-medium text-emerald-200/80">Voice Data</h3>
            <ul className="list-inside list-disc space-y-2 pl-4">
              <li>Audio recordings of your voice interactions</li>
              <li>Transcriptions of spoken content</li>
              <li>AI-generated responses to your queries</li>
            </ul>

            <h3 className="mt-4 font-medium text-emerald-200/80">Technical Data</h3>
            <ul className="list-inside list-disc space-y-2 pl-4">
              <li>IP address (used for rate limiting, not stored long-term)</li>
              <li>Device type and browser information</li>
              <li>Session timestamps and duration</li>
            </ul>

            <h3 className="mt-4 font-medium text-emerald-200/80">What We Do NOT Collect</h3>
            <ul className="list-inside list-disc space-y-2 pl-4">
              <li>Your name or email (unless you join the waitlist)</li>
              <li>Location data beyond IP-derived region</li>
              <li>Biometric voiceprints for identification</li>
              <li>Cross-session tracking identifiers</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-emerald-300">3. How We Use Your Data</h2>
            <ul className="list-inside list-disc space-y-2 pl-4">
              <li>
                <strong>Service Operation:</strong> To provide real-time voice AI interactions
              </li>
              <li>
                <strong>Language Model Training:</strong> Anonymized audio contributes to improving
                AI models for endangered languages
              </li>
              <li>
                <strong>Research:</strong> Aggregated data may be used for linguistic research
              </li>
              <li>
                <strong>Rate Limiting:</strong> IP-based tracking to prevent abuse
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-emerald-300">4. Anonymization Process</h2>
            <p>All voice data undergoes anonymization before being used for training:</p>
            <ul className="list-inside list-disc space-y-2 pl-4">
              <li>IP addresses and session identifiers are stripped</li>
              <li>Audio is processed to remove identifying characteristics</li>
              <li>Data is aggregated with contributions from many users</li>
              <li>No individual can be identified from the training data</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-emerald-300">5. Data Sharing</h2>
            <p>We may share anonymized, aggregated data with:</p>
            <ul className="list-inside list-disc space-y-2 pl-4">
              <li>Research institutions studying endangered languages</li>
              <li>Open-source language model projects</li>
              <li>Academic partners for linguistic research</li>
            </ul>
            <p className="mt-2">
              We never sell personal data or share identifiable information with third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-emerald-300">6. Data Storage and Security</h2>
            <ul className="list-inside list-disc space-y-2 pl-4">
              <li>Data is stored on secure cloud infrastructure</li>
              <li>Encryption in transit and at rest</li>
              <li>Access limited to authorized team members</li>
              <li>Regular security audits and updates</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-emerald-300">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-inside list-disc space-y-2 pl-4">
              <li>Stop using the service at any time</li>
              <li>Request information about data collection practices</li>
              <li>Contact us with privacy concerns</li>
            </ul>
            <p className="mt-2 text-emerald-400/60">
              Note: Due to anonymization, we cannot retrieve or delete specific individual
              contributions once they have been processed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-emerald-300">8. Cookies and Local Storage</h2>
            <p>We use minimal local storage for:</p>
            <ul className="list-inside list-disc space-y-2 pl-4">
              <li>Access code persistence (if you have one)</li>
              <li>UI preferences (debug mode, dismissed prompts)</li>
              <li>Conversation cache for faster loading</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-emerald-300">9. Children&apos;s Privacy</h2>
            <p>
              Aether is not intended for use by children under 13. We do not knowingly collect data
              from children.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-emerald-300">10. Changes to This Policy</h2>
            <p>
              We may update this policy periodically. Continued use of the Service after changes
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-emerald-300">11. Contact</h2>
            <p>
              For privacy-related inquiries, please contact the Aether team through official
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
