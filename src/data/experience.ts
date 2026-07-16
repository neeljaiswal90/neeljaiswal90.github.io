export interface RoleRecord {
  id: string;
  periodClaimId: string;
  summaryClaimId: string;
  company: string;
  title: string;
  signal: string;
  achievements: readonly { title: string; description: string; href?: string }[];
  tags: readonly string[];
}

export const roles: readonly RoleRecord[] = [
  {
    id: 'mint', periodClaimId: 'career.mint.role_dates', summaryClaimId: 'career.mint.scope', company: 'Mint Mobile', title: 'Senior Product Manager · T-Mobile company', signal: 'AI + commerce at scale',
    achievements: [
      { title: 'Growth system', description: 'Built a repeatable funnel operating loop across homepage, plans, checkout, and lifecycle.', href: '/work/growth-system/' },
      { title: 'New businesses', description: 'Connected eligibility, purchase, activation, hardware, and operations for Home Internet and device commerce.', href: '/work/home-internet/' },
      { title: 'Production AI', description: 'Shipped a grounded assistant measured on resolution, customer satisfaction, and safe escalation.', href: '/work/production-ai/' },
    ],
    tags: ['Experimentation', 'GenAI', 'Home Internet', 'Device commerce', 'Payments', 'People leadership'],
  },
  {
    id: 'inspire', periodClaimId: 'career.inspire.role_dates', summaryClaimId: 'enterprise.workday_api_program', company: 'Inspire Brands', title: 'Product Manager', signal: 'Enterprise integration',
    achievements: [
      { title: 'Integration contracts', description: 'Mapped workflows, ownership, data contracts, migrations, and exceptions as one product surface.', href: '/work/enterprise-integration/' },
      { title: 'Operational adoption', description: 'Connected implementation choices to training, workflow change, and measurable uptake.' },
    ],
    tags: ['Workday', 'APIs', 'ERP', 'Workflow automation', 'Change leadership'],
  },
  {
    id: 'best-buy', periodClaimId: 'career.bestbuy.role_dates', summaryClaimId: 'bestbuy.digital_diagnostics', company: 'Best Buy', title: 'Product Manager', signal: 'Retail self-service',
    achievements: [
      { title: 'Digital diagnostics', description: 'Launched online device self-diagnosis and troubleshooting around the customer’s actual problem.', href: '/work/retail-self-service/' },
      { title: 'Ownership services', description: 'Connected device selection to contextual installation and post-purchase support.' },
    ],
    tags: ['Self-service', 'Diagnostics', 'Retail', 'Services attach', 'Customer journey'],
  },
  {
    id: 'target', periodClaimId: 'career.target.role_dates', summaryClaimId: 'target.discovery_dashboards', company: 'Target', title: 'Product Manager', signal: 'Discovery + measurement',
    achievements: [],
    tags: ['Product discovery', 'KPI systems', 'Analytics', 'Experiment design', 'Decision systems'],
  },
  {
    id: 'allianz', periodClaimId: 'career.allianz.role_dates', summaryClaimId: 'allianz.backlog_regulated_delivery', company: 'Allianz', title: 'Product Owner', signal: 'Regulated delivery',
    achievements: [],
    tags: ['Product ownership', 'Regulated systems', 'Backlog strategy', 'Stakeholder alignment'],
  },
];
