import React from 'react';
import MockedForm, { type FormField } from '../../ui/forms/MockedForm';
import { openDoc } from '../../../stores/docsStore';

/**
 * BusinessOnboardingForm Component
 *
 * Pre-configured business onboarding form using MockedForm.
 * Includes Tier 0 Gate logic reminder (checkbox acknowledgment).
 *
 * Usage:
 * <BusinessOnboardingForm client:load />
 */

const BusinessOnboardingForm: React.FC = () => {
  const fields: FormField[] = [
    {
      name: 'businessName',
      label: 'Business Name',
      type: 'text',
      placeholder: 'Acme Coffee Shop',
      required: true,
    },
    {
      name: 'ownerName',
      label: 'Owner / Contact Name',
      type: 'text',
      placeholder: 'Jane Smith',
      required: true,
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'jane@acmecoffee.com',
      required: true,
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      placeholder: '(555) 123-4567',
      required: true,
    },
    {
      name: 'businessType',
      label: 'Business Type',
      type: 'select',
      required: true,
      options: [
        'Restaurant / Cafe',
        'Retail Shop',
        'Service Provider',
        'Professional Services',
        'Healthcare',
        'Fair Trade AI',
        'Other',
      ],
    },
    {
      name: 'serviceNeeded',
      label: 'What service do you need help with?',
      type: 'select',
      required: true,
      options: [
        'Google Maps Verification',
        'One-Page Website',
        'Modern Point-of-Sale',
        'Social Media Launch',
        'Customer Newsletter',
        'Cybersecurity Basics',
        'Time-Saving Automation',
        'Software Tool Audit',
        'Other / Not Sure',
      ],
    },
    {
      name: 'challengeDescription',
      label: 'Describe your current challenge',
      type: 'textarea',
      placeholder:
        "Tell us about the specific challenge you're facing and what you hope to achieve...",
      required: true,
    },
    {
      name: 'termsAgreement',
      label: (
        <span>
          I agree to the{' '}
          <button
            type="button"
            onClick={() => openDoc('terms-of-service')}
            className="text-neon-400 hover:underline focus:outline-none"
          >
            terms of service
          </button>{' '}
          and understand that this is educational support
        </span>
      ),
      type: 'checkbox',
      required: true,
    },
  ];

  const handleSubmit = (data: Record<string, any>) => {
    console.log('Business onboarding submitted:', data);
    // In production, this would:
    // 1. Validate Tier 0 acknowledgment
    // 2. Send to CRM/backend
    // 3. Trigger automated welcome email
    // 4. Schedule initial consultation
  };

  return (
    <MockedForm
      title="Business Onboarding"
      description="Let's get started! Fill out this quick form and a tech volunteer will reach out to schedule your free setup session."
      fields={fields}
      submitLabel="Request Consultation"
      successMessage="Success! We've received your request. A team member will reach out within 1-2 business days to schedule your free consultation."
      onSubmit={handleSubmit}
    />
  );
};

export default BusinessOnboardingForm;
