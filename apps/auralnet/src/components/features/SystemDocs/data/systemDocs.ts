export interface DocSection {
  title?: string;
  content: string; // HTML string allowed
}

export interface SystemDoc {
  id: string;
  title: string;
  lastUpdated?: string;
  category: 'Governance' | 'Operations' | 'Support' | 'Legal';
  intro?: string;
  sections: DocSection[];
}

export const systemDocs: Record<string, SystemDoc> = {
  'terms-of-service': {
    id: 'terms-of-service',
    title: 'Terms of Service',
    category: 'Legal',
    lastUpdated: '2025-12-14',
    intro: `Please read these Terms of Service ("Terms") carefully before using the Owly Labs website (the "Service") operated by Owly Labs ("us", "we", or "our"). Your access to and use of the Service is conditioned upon your acceptance of and compliance with these Terms.`,
    sections: [
      {
        title: '1. Use of Our Service',
        content:
          'You agree to use our Service in compliance with all applicable laws and regulations and not for any purpose that is prohibited by these Terms. You agree not to use the Service to solicit others to perform or participate in any unlawful acts.',
      },
      {
        title: '2. Heritage Preservation Focus',
        content:
          'You acknowledge that Owly Labs is a heritage preservation organization. Any data contributed (including voice recordings) plays a critical role in preserving human culture. We treat this data with the utmost respect and security, as outlined in our Privacy Policy.',
      },
      {
        title: '3. Intellectual Property',
        content:
          'The Service and its original content, features, and functionality are and will remain the exclusive property of Owly Labs and its licensors. However, you retain ownership of your original voice recordings, granting us a license to use them for AI training purposes.',
      },
      {
        title: '4. Links To Other Web Sites',
        content:
          'Our Service may contain links to third-party web sites or services that are not owned or controlled by Owly Labs. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party web sites or services.',
      },
      {
        title: '5. Limitation Of Liability',
        content:
          'In no event shall Owly Labs, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.',
      },
      {
        title: '6. Changes',
        content:
          'We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms of Service on this page.',
      },
      {
        title: '7. Contact Us',
        content:
          'If you have any questions about these Terms, please contact us at <a href="mailto:contact@owlylabs.com" class="text-accent hover:underline">contact@owlylabs.com</a>.',
      },
    ],
  },
  'privacy-policy': {
    id: 'privacy-policy',
    title: 'Privacy Policy',
    category: 'Legal',
    lastUpdated: '2025-12-14',
    intro:
      'Welcome to Owly Labs. We are committed to protecting your privacy and handling your personal information with transparency and care. This Privacy Policy outlines the types of information we collect, how it is used, and the measures we take to safeguard it.',
    sections: [
      {
        title: '1. Information We Collect',
        content:
          "We may collect personal information that you voluntarily provide to us when you use our services, such as when you join our waitlist, apply for services, donate, or contact us. This information may include: <ul class='list-disc pl-5 mt-2 space-y-1'><li>Your name and contact details.</li><li>The dialect or language you speak.</li><li>Voice recordings for the Voice Passport program.</li></ul>",
      },
      {
        title: '2. How We Use Your Information',
        content:
          "Your information is used to: <ul class='list-disc pl-5 mt-2 space-y-1'><li>Train AI models to understand underrepresented dialects.</li><li>Provide, operate, and maintain our services.</li><li>Communicate with you to improve our dataset accuracy.</li><li>Comply with legal obligations.</li></ul>",
      },
      {
        title: '3. Data Sharing and Disclosure',
        content:
          'We do not sell raw voice data to third-party data brokers. We only monetize intelligence derived from aggregated data. We may share anonymized data with academic partners for linguistic research.',
      },
      {
        title: '4. Data Security',
        content:
          'We implement a variety of security measures to maintain the safety of your personal information. Dialect data is stored with encryption at rest and in transit.',
      },
      {
        title: '5. Your Rights',
        content:
          'You have the right to access, correct, or delete your personal information. If you wish to exercise these rights, please contact us at the email address below.',
      },
      {
        title: '6. Contact Us',
        content:
          'If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@owlylabs.com" class="text-accent hover:underline">privacy@owlylabs.com</a>.',
      },
    ],
  },
  'volunteer-policies': {
    id: 'volunteer-policies',
    title: 'Volunteer Policies',
    category: 'Governance',
    lastUpdated: '2025-12-14',
    intro:
      'Thank you for your interest in volunteering with Owly Labs. To ensure a positive and productive environment for everyone, we ask all volunteers to read and agree to the following policies.',
    sections: [
      {
        title: '1. Code of Conduct',
        content:
          'Owly Labs is committed to providing a friendly, safe, and welcoming environment for all, regardless of gender, sexual orientation, ability, ethnicity, socioeconomic status, and religion. We expect all volunteers to treat others with respect and dignity.',
      },
      {
        title: '2. Cultural Sensitivity',
        content:
          'As a heritage preservation organization, we often work with elders and marginalized communities. Volunteers are expected to demonstrate high levels of cultural humility and respect for local customs and languages.',
      },
      {
        title: '3. Intellectual Property & Open Source',
        content:
          'Owly Labs operates on an "Open by Default" philosophy. By contributing code, designs, or documentation, you agree that your contributions will be released under the project\'s open-source license.',
      },
      {
        title: '4. Commitment & Reliability',
        content:
          'We rely on our volunteers to help us achieve our mission. We ask that you communicate any changes in your availability or ability to complete assigned tasks as soon as possible.',
      },
      {
        title: '5. Termination',
        content:
          'Either you or Owly Labs may end the volunteer relationship at any time, with or without cause and with or without notice.',
      },
      {
        title: '6. Contact',
        content:
          'If you have questions about these policies, please contact our volunteer coordinator at <a href="mailto:volunteer@owlylabs.com" class="text-accent hover:underline">volunteer@owlylabs.com</a>.',
      },
    ],
  },
  bylaws: {
    id: 'bylaws',
    title: 'Bylaws',
    category: 'Governance',
    lastUpdated: '2025-12-14',
    intro:
      'Official bylaws governing the operation of Owly Labs as a Public Benefit Corporation dedicated to heritage preservation.',
    sections: [
      {
        title: 'ARTICLE I: NAME',
        content: `<h3>SECTION 1. NAME</h3><p>The name of this corporation is Owly Labs (the "Corporation").</p>`,
      },
      {
        title: 'ARTICLE II: PURPOSES',
        content: `<h3>SECTION 1. PURPOSES</h3><p>The specific purpose of this corporation is to preserve human heritage through technology, specifically by documenting and digitizing endangered dialects and languages, and to provide economic opportunities through Fair Trade AI principles.</p>`,
      },
      {
        title: 'ARTICLE III: DEDICATION OF ASSETS',
        content: `<h3>SECTION 1. DEDICATION OF ASSETS</h3><p>The properties and assets of this corporation are irrevocably dedicated to charitable purposes. No part of the net earnings, properties, or assets of this corporation, on dissolution or otherwise, shall inure to the benefit of any private person or individual.</p>`,
      },
      {
        title: 'ARTICLE IV: GOVERNANCE',
        content: `<h3>SECTION 1. BOARD OF DIRECTORS</h3><p>The Corporation shall have a Board of Directors, which shall supervise and control the business, property, and affairs of the Corporation.</p>`,
      },
    ],
  },
  'how-we-work': {
    id: 'how-we-work',
    title: 'How We Work',
    category: 'Operations',
    intro:
      'We believe that clear communication and transparent processes are the foundation of successful heritage preservation. This page outlines how we work with communities and contributors.',
    sections: [
      {
        title: 'The Pilot Model',
        content: `<p class="mb-4">We launch "Pilots" focused on specific dialects (e.g., Toishanese). Each pilot follows a 3-phase structure:</p>
        <ul class="list-disc pl-5 space-y-2">
          <li><strong>Phase 1: Collection.</strong> We work with community elders to record "Golden Sample" data.</li>
          <li><strong>Phase 2: Validation.</strong> Linguistic experts and community members verify the accuracy of the AI models.</li>
          <li><strong>Phase 3: Utility.</strong> We release free tools (like "Muni for Auntie") back to the community.</li>
        </ul>`,
      },
      {
        title: 'Fair Trade Principles',
        content: `<div class="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg text-center italic">
          <strong>Data as Labor:</strong> We believe that contributing voice data is a form of labor. Contributors receive lifetime access to our tools as compensation.
        </div>`,
      },
    ],
  },
  faq: {
    id: 'faq',
    title: 'FAQ',
    category: 'Support',
    intro: 'Find answers to common questions about Owly Labs, Voice Passport, and our mission.',
    sections: [
      {
        title: 'General',
        content: `
          <div class="space-y-4">
            <div>
              <h4 class="text-lg font-bold text-text-light">What is Owly Labs?</h4>
              <p class="text-text-muted">Owly Labs is a heritage preservation laboratory using AI to document and revitalize endangered dialects. We are building the "Voice OS" for the world's forgotten languages.</p>
            </div>
            <div>
              <h4 class="text-lg font-bold text-text-light">What is "Fair Trade AI"?</h4>
              <p class="text-text-muted">It means we don't exploit data. We treat contributors as partners. If you help teach the AI your language, you get to own the resulting tools forever.</p>
            </div>
          </div>
        `,
      },
      {
        title: 'Voice Passport',
        content: `
          <div class="space-y-4">
            <div>
              <h4 class="text-lg font-bold text-text-light">Is my voice data safe?</h4>
              <p class="text-text-muted">Yes. We encrypt all data and do not sell raw recordings to third parties. We are a Public Benefit Corporation committed to data stewardship.</p>
            </div>
            <div>
              <h4 class="text-lg font-bold text-text-light">How do I contribute?</h4>
              <p class="text-text-muted">Go to the "Contribute" page and start the Voice Passport process. It takes about 15 minutes to record a sample covering your dialect's unique sounds.</p>
            </div>
          </div>
        `,
      },
    ],
  },
};
