import React from 'react';
import { motion } from 'framer-motion';

/**
 * ServiceCatalog Component
 *
 * A simplified, human-centric service catalog that groups offerings into
 * clear pillars: Foundational (Get Online) and Growth (Get Customers).
 *
 * Focuses strictly on "Done-For-You" services for business owners.
 * Self-service/DIY resources are routed to the Volunteer page.
 *
 * Update: "Card as CTA" minimalist design. The entire card is a button.
 */

interface Tier0Resource {
  title: string;
  url: string;
  type: 'template' | 'guide' | 'video' | 'tool';
}

interface Service {
  title: string;
  problem: string;
  shortDesc: string;
  icon: string;
  category?: string;
  tier0Download?: string;
  tier0Resources?: Tier0Resource[];
  consultationNote?: string;
}

interface Props {
  services: Service[];
}

const ServiceCard: React.FC<{ service: Service }> = ({ service }) => {
  return (
    <motion.a
      href="/contact?type=business"
      layout
      className="group bg-glass-surface/30 hover:bg-glass-surface/40 hover:border-neon-400/30 relative block cursor-pointer overflow-hidden rounded-xl border border-white/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_-10px_rgba(0,255,148,0.2)]"
    >
      <div className="p-6">
        <div className="flex items-start gap-5">
          {/* Icon */}
          <div className="group-hover:border-neon-400/20 group-hover:bg-neon-400/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-3xl transition-colors">
            {service.icon}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-grow">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-text-light group-hover:text-neon-400 mb-1 truncate font-mono text-xl font-bold transition-colors">
                {service.title}
              </h3>
              {/* Arrow CTA */}
              <span className="text-neon-400 flex-shrink-0 transform text-xl opacity-50 transition-all group-hover:translate-x-1 group-hover:opacity-100">
                →
              </span>
            </div>

            <p className="text-text-muted mb-3 line-clamp-2 text-base leading-relaxed">
              {service.problem}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {/* Badge */}
              <div className="inline-flex items-center gap-2">
                <span className="text-neon-400/80 bg-neon-400/10 border-neon-400/20 rounded border px-2 py-1 font-mono text-xs tracking-wider uppercase">
                  {service.shortDesc}
                </span>
              </div>
            </div>

            {service.consultationNote && (
              <p className="text-text-muted/60 mt-3 border-t border-white/5 pt-2 text-xs italic">
                * {service.consultationNote}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.a>
  );
};

const ServiceCatalog: React.FC<Props> = ({ services }) => {
  // Group services
  const foundationalServices = services.filter((s) => s.category === 'Foundational');
  const growthServices = services.filter((s) => s.category === 'Growth');
  const otherServices = services.filter(
    (s) => s.category !== 'Foundational' && s.category !== 'Growth'
  );

  return (
    <div className="space-y-24">
      {/* Section 1: Foundational */}
      <section>
        <div className="mx-auto mb-12 max-w-3xl md:text-center">
          <span className="text-neon-400 mb-2 block font-mono text-sm tracking-widest uppercase">
            Pillar 01
          </span>
          <h2 className="text-text-light mb-4 text-3xl font-bold md:text-4xl">
            Foundational Technology
          </h2>
          <p className="text-text-muted text-lg">
            Essential tools to establish your professional online presence. Perfect for new
            businesses or those just getting started online.
          </p>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2">
          {foundationalServices.map((service) => (
            <ServiceCard key={service.title} service={service} />
          ))}
        </div>
      </section>

      {/* Section 2: Growth */}
      <section>
        <div className="mx-auto mb-12 max-w-3xl md:text-center">
          <span className="mb-2 block font-mono text-sm tracking-widest text-purple-400 uppercase">
            Pillar 02
          </span>
          <h2 className="text-text-light mb-4 text-3xl font-bold md:text-4xl">
            Marketing & Growth
          </h2>
          <p className="text-text-muted text-lg">
            Tools to help you reach more customers and run efficiently. Designed for businesses
            ready to expand their reach.
          </p>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2">
          {growthServices.map((service) => (
            <ServiceCard key={service.title} service={service} />
          ))}
        </div>
      </section>

      {/* Other Services (if any) */}
      {otherServices.length > 0 && (
        <section>
          <div className="mb-8">
            <h2 className="text-text-light mb-2 text-2xl font-bold">Additional Resources</h2>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2">
            {otherServices.map((service) => (
              <ServiceCard key={service.title} service={service} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ServiceCatalog;
