import { defineCollection, z } from 'astro:content';

/**
 * Transparency Collection
 * Stores financial reports, legal documents, and process documentation
 * Following the 5-point Blueprint schema: Programs, Operations, Staffing, Fundraising, Technology
 */
const transparency = defineCollection({
  type: 'data', // JSON/YAML files
  schema: z.object({
    title: z.string(),
    year: z.number(),
    category: z.enum(['Financial', 'Legal', 'Process']),

    // Financial breakdown following the 5-point Blueprint schema
    financials: z
      .object({
        programs: z.number().describe('Direct program delivery costs'),
        operations: z.number().describe('Administrative and operational overhead'),
        staffing: z.number().describe('Personnel costs (salaries, benefits)'),
        fundraising: z.number().describe('Development and donor relations costs'),
        technology: z.number().describe('Technology & infrastructure (mission critical)'),
      })
      .optional(),

    // Metadata
    fileUrl: z.string().url().optional(),
    description: z.string().optional(),
    lastUpdated: z.string().transform((str) => new Date(str)),
  }),
});

/**
 * Services Collection
 * Defines service offerings with Tier 0 solutions and consultation gating
 */
const services = defineCollection({
  type: 'content', // Markdown files with frontmatter
  schema: z.object({
    title: z.string(),
    icon: z.string().describe('Lucide icon name (e.g., "Laptop", "Users", "Zap")'),
    shortDesc: z.string().describe('Brief description (1-2 sentences)'),
    problem: z.string().describe('User problem this service solves'),
    category: z.string().optional().default('Other'),

    // Tier 0 Gate - Self-service resources before human consultation
    tier0_download: z
      .string()
      .url()
      .optional()
      .describe('URL for downloadable MVP template/resource'),
    tier0_resources: z
      .array(
        z.object({
          title: z.string(),
          url: z.string().url(),
          type: z.enum(['template', 'guide', 'video', 'tool']),
        })
      )
      .optional(),

    // Consultation booking
    consultation_enabled: z.boolean().default(false),
    consultation_note: z.string().optional().describe('Message shown with consultation booking'),

    // Additional metadata
    featured: z.boolean().default(false),
    order: z.number().default(999),
  }),
});

export const collections = {
  transparency,
  services,
};
