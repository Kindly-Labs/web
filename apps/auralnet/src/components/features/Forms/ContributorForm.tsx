import React from 'react';
import MockedForm, { type FormField } from '../../ui/forms/MockedForm';
import { openDoc } from '../../../stores/docsStore';

/**
 * ContributorForm Component
 *
 * Pre-configured contributor application form using MockedForm.
 *
 * Usage:
 * <ContributorForm client:load />
 */

const ContributorForm: React.FC = () => {
  const fields: FormField[] = [
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Jane Doe',
      required: true,
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'jane@example.com',
      required: true,
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      placeholder: '(555) 123-4567',
      required: false,
    },
    {
      name: 'skills',
      label: 'Contribution Type',
      type: 'select',
      required: true,
      options: [
        'Voice Recording (Dialect/Accent)',
        'Data Annotation',
        'Translation / Localization',
        'Field Data Collection',
        'Model Validation',
        'Developer (Protocol)',
        'Other',
      ],
    },
    {
      name: 'availability',
      label: 'Availability (hours per week)',
      type: 'select',
      required: true,
      options: ['1-2 hours', '3-5 hours', '6-10 hours', '10+ hours'],
    },
    {
      name: 'motivation',
      label: 'Why do you want to join the Fair Trade AI Network?',
      type: 'textarea',
      placeholder: 'Tell us about your background and interest in ethical AI...',
      required: true,
    },
    {
      name: 'agreement',
      label: (
        <span>
          I have read and agree to the{' '}
          <button
            type="button"
            onClick={() => openDoc('contributor-agreement')}
            className="text-neon-400 hover:underline focus:outline-none"
          >
            contributor agreement
          </button>
        </span>
      ),
      type: 'checkbox',
      required: true,
    },
  ];

  const handleSubmit = (data: Record<string, any>) => {
    console.log('Contributor application submitted:', data);
    // In production, this would send to backend API
  };

  return (
    <MockedForm
      title="Contributor Application"
      description="Join our network of data artisans. Fill out the form below to start earning."
      fields={fields}
      submitLabel="Submit Application"
      successMessage="Thank you for applying! We'll verify your profile and get back to you within 2-3 business days."
      onSubmit={handleSubmit}
    />
  );
};

export default ContributorForm;
