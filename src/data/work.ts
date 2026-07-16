import { getPublishableClaim, type ClaimRecord } from './claims.ts';

export interface WorkStep {
  title: string;
  description: string;
}

export interface WorkContextCue {
  /** Qualitative scope marker only; never treat this value as a measured claim. */
  value: string;
  label: string;
}

export const workCaseSlugs = [
  'growth-system',
  'home-internet',
  'production-ai',
  'device-commerce',
  'enterprise-integration',
  'retail-self-service',
] as const;

export type WorkCaseSlug = (typeof workCaseSlugs)[number];

export interface WorkCase {
  slug: WorkCaseSlug;
  outcomeId: string;
  sequence: string;
  systemLabel: string;
  company: string;
  indexTitle: string;
  title: string;
  summary: string;
  metricClaimIds: readonly string[];
  evidenceClaimIds?: readonly string[];
  /** Compatibility name for qualitative context cues; values are not metrics. */
  supportingSignals?: readonly WorkContextCue[];
  flowLabel: string;
  steps: readonly WorkStep[];
  problem: string;
  decisions: readonly string[];
  tradeoffs: readonly string[];
  evidenceBoundary: string;
}

export function getPublishedClaim(id: string): ClaimRecord {
  return getPublishableClaim(id);
}

export interface WorkCaseClaimView {
  metrics: readonly ClaimRecord[];
  evidence: readonly ClaimRecord[];
}

export interface AdjacentWorkCases {
  previous: WorkCase | null;
  next: WorkCase | null;
}

export interface WorkCaseViewModel {
  workCase: WorkCase;
  claims: WorkCaseClaimView;
  contextCues: readonly WorkContextCue[];
  adjacent: AdjacentWorkCases;
}

export const workCases: readonly WorkCase[] = [
  {
    slug: 'growth-system', outcomeId: 'outcome-01', sequence: '01', systemLabel: 'Growth system', company: 'Mint Mobile',
    indexTitle: 'Conversion, compounded.', title: 'Conversion, compounded.',
    summary: 'Turned the purchase funnel into a disciplined operating system: diagnose the leak, intervene with a controlled test, protect conversion, then scale the winner.',
    metricClaimIds: ['growth.homepage_conversion_lift_54_7', 'growth.plans_conversion_lift_77', 'commerce.aov_lift_10_flat_conversion'],
    flowLabel: 'Conversion operating loop',
    steps: [
      { title: 'Observe', description: 'Instrument homepage and plans-page drop-off.' },
      { title: 'Test', description: 'Run one controlled hypothesis at a time.' },
      { title: 'Guardrail', description: 'Protect conversion, order value, and quality.' },
      { title: 'Scale', description: 'Ship the winner and compound the learning.' },
    ],
    problem: 'The purchase journey had multiple conversion surfaces, competing hypotheses, and no single operating loop connecting diagnosis to scale.',
    decisions: ['Treat the funnel as a product system, not a queue of page requests.', 'Instrument the decision before designing the intervention.', 'Require a conversion and quality guardrail before scaling a winner.'],
    tradeoffs: ['Incremental tests improve attribution but slow broad redesign.', 'A shared measurement spine adds up-front instrumentation work.'],
    evidenceBoundary: 'The displayed results are owner-supplied portfolio outcomes and describe measured changes over the stated tenure; they do not attribute every point of lift to one experiment.',
  },
  {
    slug: 'home-internet', outcomeId: 'outcome-02', sequence: '02', systemLabel: 'New business', company: 'Mint Home Internet',
    indexTitle: 'Eligibility to recurring revenue.', title: 'From eligibility to recurring revenue.',
    summary: 'Owned product detail, eligibility, activation, and lifecycle experimentation for a hardware-plus-service journey, then instrumented the full funnel.',
    metricClaimIds: ['mhi.customers_33_4k_to_64k_five_months', 'mhi.promo_purchase_rate_lift_60', 'mhi.conversion_test_lift_9_3'],
    flowLabel: 'Home internet customer journey',
    steps: [
      { title: 'Qualify', description: 'Confirm service and address eligibility.' },
      { title: 'Purchase', description: 'Connect the offer to a clear checkout.' },
      { title: 'Activate', description: 'Coordinate hardware and service activation.' },
      { title: 'Retain', description: 'Use lifecycle signals to grow retention.' },
    ],
    problem: 'A new recurring-revenue product had to make service eligibility, hardware fulfillment, activation, and lifecycle value feel like one customer journey.',
    decisions: ['Make eligibility the first confidence-building moment.', 'Instrument the complete path from offer view through activation.', 'Use lifecycle signals as product inputs, not only marketing triggers.'],
    tradeoffs: ['Earlier eligibility checks reduce dead-end checkout but add friction.', 'Hardware and service ownership creates more operational dependencies than a pure digital plan.'],
    evidenceBoundary: 'Customer and test results are owner-supplied portfolio outcomes. The derived growth rate is stored separately and is not repeated here.',
  },
  {
    slug: 'production-ai', outcomeId: 'outcome-03', sequence: '03', systemLabel: 'Conversational AI', company: 'Mint Mobile',
    indexTitle: 'Resolve the need.', title: 'Resolve the need, not just the message.',
    summary: 'Shipped a GPT-based sales and support assistant with retrieval, memory, and tool skills, measured on resolution, customer satisfaction, and escalation — not demo quality.',
    metricClaimIds: ['ai.assistant.contacts_self_served_56', 'ai.assistant.csat_3_1_to_4_44', 'ai.assistant.escalations_reduced_34'],
    evidenceClaimIds: ['ai.assistant.rag_memory_tools'],
    flowLabel: 'Conversational AI resolution loop',
    steps: [
      { title: 'Intent', description: 'Classify the customer need and urgency.' },
      { title: 'Retrieve', description: 'Ground the response in approved context.' },
      { title: 'Act', description: 'Invoke approved tools or route to a person.' },
      { title: 'Evaluate', description: 'Measure resolution, CSAT, and escalation.' },
    ],
    problem: 'A production assistant needed to resolve real customer needs without turning a persuasive demo into an uncontrolled support surface.',
    decisions: ['Separate intent, retrieval, action, and evaluation.', 'Treat memory and tools as governed capabilities.', 'Optimize for resolution and safe escalation rather than response fluency.'],
    tradeoffs: ['Tighter grounding reduces creative flexibility.', 'Human escalation protects quality but limits full automation.'],
    evidenceBoundary: 'AI performance metrics are owner-supplied portfolio outcomes. Architecture references describe the system pattern without disclosing internal domains or implementation details.',
  },
  {
    slug: 'device-commerce', outcomeId: 'outcome-04', sequence: '04', systemLabel: '0-to-1 commerce', company: 'Mint Mobile',
    indexTitle: 'A device business.', title: 'A device business, not a product page.',
    summary: 'Helped build a zero-to-one device-commerce operation spanning purchase, activation, inventory, fulfillment, support, and returns.',
    metricClaimIds: ['commerce.esim_purchase_mix_75'],
    evidenceClaimIds: ['commerce.device_business_zero_to_one'],
    supportingSignals: [{ value: '0→1', label: 'device operation' }, { value: 'Full loop', label: 'purchase to return' }],
    flowLabel: 'Device commerce operating model',
    steps: [
      { title: 'Merchandise', description: 'Unify catalog, pricing, and inventory.' },
      { title: 'Checkout', description: 'Connect pricing, payment, and order creation.' },
      { title: 'Fulfill', description: 'Orchestrate the order and delivery path.' },
      { title: 'Support', description: 'Close the loop through customer support and returns.' },
    ],
    problem: 'Selling hardware required an operating model spanning merchandising, payment risk, inventory, fulfillment, activation, returns, and customer support.',
    decisions: ['Model the device lifecycle end to end.', 'Treat payment and fulfillment integrations as product surfaces.', 'Prefer instant digital activation where customer and device eligibility allow it.'],
    tradeoffs: ['A broader catalog increases choice and operational complexity.', 'Faster activation requires more eligibility and exception handling.'],
    evidenceBoundary: 'Only the published eSIM result is quantified. Payment-rail and system-count claims remain under review and are intentionally omitted.',
  },
  {
    slug: 'enterprise-integration', outcomeId: 'outcome-05', sequence: '05', systemLabel: 'Enterprise platform', company: 'Inspire Brands',
    indexTitle: 'Integration is a product.', title: 'Integration is a product.',
    summary: 'Led a Workday rollout as an end-to-end data and workflow experience across HR, payroll, operations, and legacy systems.',
    metricClaimIds: [],
    evidenceClaimIds: ['enterprise.workday_api_program'],
    supportingSignals: [{ value: 'Workday', label: 'enterprise core' }, { value: 'APIs', label: 'integration contracts' }, { value: 'Adoption', label: 'operating outcome' }],
    flowLabel: 'Enterprise integration delivery loop',
    steps: [
      { title: 'Map', description: 'Discover workflows, owners, and systems.' },
      { title: 'Integrate', description: 'Connect legacy systems and data contracts.' },
      { title: 'Migrate', description: 'Validate transfer, controls, and exceptions.' },
      { title: 'Adopt', description: 'Train teams and measure operational uptake.' },
    ],
    problem: 'A platform rollout could not succeed as a software installation; it had to align data contracts, workflows, controls, owners, and adoption.',
    decisions: ['Map the operating workflow before the integration.', 'Make contracts and exceptions visible to business owners.', 'Measure adoption as part of delivery.'],
    tradeoffs: ['A reusable contract layer adds design work before migration.', 'Standardization can expose legitimate local process differences.'],
    evidenceBoundary: 'The Workday and API program is resume-supported. Numeric system-count and efficiency claims remain under review and are not published.',
  },
  {
    slug: 'retail-self-service', outcomeId: 'outcome-06', sequence: '06', systemLabel: 'Digital self-service', company: 'Best Buy',
    indexTitle: 'Self-service that resolves.', title: 'Help customers help themselves.',
    summary: 'Connected purchase and ownership: online device diagnostics reduced avoidable support demand, while attached installation services completed the customer job.',
    metricClaimIds: ['bestbuy.contact_deflection_10_20', 'bestbuy.services_attach_lift_15'],
    evidenceClaimIds: ['bestbuy.digital_diagnostics'],
    supportingSignals: [{ value: 'Resolve', label: 'first-contact intent' }],
    flowLabel: 'Digital self-service resolution loop',
    steps: [
      { title: 'Diagnose', description: 'Identify the customer problem precisely.' },
      { title: 'Guide', description: 'Offer contextual steps and service options.' },
      { title: 'Resolve', description: 'Confirm that the customer outcome landed.' },
      { title: 'Learn', description: 'Feed recurring issues back into product.' },
    ],
    problem: 'Customers needed help after purchase, but generic support paths created avoidable contacts and missed service opportunities.',
    decisions: ['Start with diagnosis rather than channel selection.', 'Connect self-service guidance to relevant service options.', 'Feed unresolved patterns back into the product roadmap.'],
    tradeoffs: ['Deflection is useful only when resolution quality holds.', 'Service attachment must remain contextual rather than interruptive.'],
    evidenceBoundary: 'Results are owner-supplied portfolio outcomes; the diagnostic product itself is resume-supported.',
  },
];

const workCaseBySlug = new Map<WorkCaseSlug, WorkCase>(
  workCases.map((workCase) => [workCase.slug, workCase]),
);

/** Non-throwing lookup for routing and link guards. */
export function findWorkCaseBySlug(slug: string): WorkCase | undefined {
  return workCaseBySlug.get(slug as WorkCaseSlug);
}

/** Strict lookup for statically generated routes and authored internal links. */
export function getWorkCaseBySlug(slug: string): WorkCase {
  const workCase = findWorkCaseBySlug(slug);
  if (!workCase) throw new Error(`Unknown work case slug: ${slug}`);
  return workCase;
}

/** Resolve authoritative claim records without copying display values or labels. */
export function resolveWorkCaseClaims(workCase: WorkCase): WorkCaseClaimView {
  return {
    metrics: workCase.metricClaimIds.map(getPublishableClaim),
    evidence: (workCase.evidenceClaimIds ?? []).map(getPublishableClaim),
  };
}

/** Adjacent route records are intentionally bounded rather than circular. */
export function getAdjacentWorkCases(slug: string): AdjacentWorkCases {
  const workCase = getWorkCaseBySlug(slug);
  const index = workCases.indexOf(workCase);
  return {
    previous: index > 0 ? workCases[index - 1] ?? null : null,
    next: index < workCases.length - 1 ? workCases[index + 1] ?? null : null,
  };
}

/** Complete, claim-backed view model used by detail routes. */
export function getWorkCaseViewModel(slug: string): WorkCaseViewModel {
  const workCase = getWorkCaseBySlug(slug);
  return {
    workCase,
    claims: resolveWorkCaseClaims(workCase),
    contextCues: workCase.supportingSignals ?? [],
    adjacent: getAdjacentWorkCases(workCase.slug),
  };
}

/** Enumerate all route-safe view models for static generation. */
export function getWorkCaseViewModels(): readonly WorkCaseViewModel[] {
  return workCases.map((workCase) => getWorkCaseViewModel(workCase.slug));
}
