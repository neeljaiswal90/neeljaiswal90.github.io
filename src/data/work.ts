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
  'esim-growth',
  'mint-kids',
  'device-commerce',
  'production-ai',
  'enterprise-integration',
  'retail-self-service',
] as const;

export type WorkCaseSlug = (typeof workCaseSlugs)[number];

export interface WorkCase {
  slug: WorkCaseSlug;
  outcomeId: string;
  sequence: string;
  featured: boolean;
  systemLabel: string;
  company: string;
  indexTitle: string;
  title: string;
  summary: string;
  metricClaimIds: readonly string[];
  evidenceClaimIds?: readonly string[];
  role: string;
  period: string;
  team: string;
  customer: string;
  surface: string;
  mandate: string;
  shipped: readonly string[];
  learning: string;
  measurementNote?: string;
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
    slug: 'growth-system', outcomeId: 'outcome-01', sequence: '01', featured: true, systemLabel: 'Core funnel + cart / checkout', company: 'Mint Mobile',
    indexTitle: 'Conversion, compounded.', title: 'Conversion, compounded.',
    summary: 'Built a repeatable operating loop across the core purchase funnel: diagnose friction, test an intervention, protect conversion and order economics, then scale what works.',
    metricClaimIds: ['growth.core_funnel_conversion_lift_54_7', 'growth.cart_checkout_conversion_lift_77', 'commerce.aov_lift_10'],
    role: 'Senior Product Manager',
    period: 'Jul 2020—Present',
    team: 'Ecommerce product portfolio',
    customer: 'Wireless shoppers',
    surface: 'Core funnel → cart / checkout',
    mandate: 'Set conversion strategy across acquisition, cart, and checkout; align the roadmap to measured friction; and create a repeatable learning loop without trading away quality.',
    shipped: ['A shared measurement spine across the core funnel, cart, and checkout.', 'A sequenced experimentation backlog tied to explicit customer and business hypotheses.', 'Upsell and merchandising interventions with conversion guardrails.', 'A review cadence that moved validated learning into the next roadmap decision.'],
    learning: 'Growth compounds when instrumentation and guardrails are designed before the interface—not added after launch.',
    measurementNote: 'Portfolio-level relative changes over the measured tenure. The AOV result came from a controlled upsell; confidential baselines and windows are retained off-site.',
    flowLabel: 'Conversion operating loop',
    steps: [
      { title: 'Observe', description: 'Instrument core-funnel and cart / checkout drop-off.' },
      { title: 'Test', description: 'Run one controlled hypothesis at a time.' },
      { title: 'Guardrail', description: 'Protect conversion, order value, and quality.' },
      { title: 'Scale', description: 'Ship the winner and compound the learning.' },
    ],
    problem: 'The purchase journey had multiple conversion surfaces, competing hypotheses, and no single operating loop connecting diagnosis to scale.',
    decisions: ['Treat the funnel as a product system, not a queue of page requests.', 'Instrument the decision before designing the intervention.', 'Require a conversion and quality guardrail before scaling a winner.'],
    tradeoffs: ['Incremental tests improve attribution but slow broad redesign.', 'A shared measurement spine adds up-front instrumentation work.'],
    evidenceBoundary: 'Owner-reported portfolio outcomes. The tenure-level conversion changes are not attributed to one experiment or one contributor.',
  },
  {
    slug: 'home-internet', outcomeId: 'outcome-02', sequence: '02', featured: true, systemLabel: 'New-business launch', company: 'Mint Home Internet',
    indexTitle: 'Eligibility to recurring revenue.', title: 'From eligibility to recurring revenue.',
    summary: 'Connected product detail, address eligibility, checkout, hardware, activation, and lifecycle growth into one measurable service journey.',
    metricClaimIds: ['mhi.active_customers_29k_jan_2026', 'mhi.promo_purchase_rate_lift_60', 'mhi.promo_purchase_rate_lift_25'],
    role: 'Senior Product Manager · Ecommerce workstream',
    period: 'Mint tenure',
    team: '30+ cross-functional partners',
    customer: 'Eligible households',
    surface: 'Eligibility → activation',
    mandate: 'Build the digital purchase and activation path for a hardware-plus-service business while coordinating the operational dependencies hidden behind a simple customer promise.',
    shipped: ['Address eligibility as an early confidence and routing decision.', 'A connected product-detail and checkout journey for hardware plus service.', 'Activation instrumentation across digital and operational handoffs.', 'Cohort-based offers and lifecycle experiments tied to purchase behavior.'],
    learning: 'For a new business, the customer journey is only as strong as the least visible handoff between digital product and operations.',
    measurementNote: 'Active-customer count is a January 2026 snapshot. Promotion results are relative purchase-rate lifts from separate measured cohorts; one moved from 0.20 to 0.32.',
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
    evidenceBoundary: 'Owner-reported portfolio outcomes. Cohorts, statistical detail, and internal dashboards remain confidential.',
  },
  {
    slug: 'esim-growth', outcomeId: 'outcome-03', sequence: '03', featured: true, systemLabel: 'Activation growth', company: 'Mint Mobile',
    indexTitle: 'Make the faster path clear.', title: 'Make the faster path clear.',
    summary: 'Made eSIM easier to understand and choose while preserving the right path for customers who still needed a physical SIM.',
    metricClaimIds: ['esim.eligible_purchase_mix_67_77', 'esim.default_selection_lift_7'],
    role: 'Senior Product Manager',
    period: 'Mint tenure',
    team: 'Ecommerce, activation, Care, and analytics',
    customer: 'eSIM-eligible shoppers',
    surface: 'Plan selection → activation',
    mandate: 'Increase adoption of the fastest activation path without creating confusion, dead ends, or a conversion penalty for customers with different device needs.',
    shipped: ['Eligibility-aware choice architecture.', 'Clearer education at the decision point.', 'A default-selection experiment with purchase-quality monitoring.', 'Segment reporting that separated eligible customers from the full purchase mix.'],
    learning: 'Defaults can accelerate a customer decision, but only when eligibility, explanation, and escape paths are designed together.',
    measurementNote: 'Purchase mix reflects recent measured eligible segments, not all orders. The +7% result is selection lift from a default experiment.',
    flowLabel: 'eSIM adoption loop',
    steps: [
      { title: 'Qualify', description: 'Identify device and customer eligibility.' },
      { title: 'Explain', description: 'Make the activation tradeoff legible.' },
      { title: 'Default', description: 'Test the faster path with an escape route.' },
      { title: 'Guardrail', description: 'Track selection and purchase quality.' },
    ],
    problem: 'The faster activation path was available, but customers had to interpret device compatibility and activation tradeoffs during a high-intent purchase decision.',
    decisions: ['Measure eSIM adoption only within eligible populations.', 'Use a reversible default instead of removing customer choice.', 'Keep purchase quality as the primary safety guardrail.'],
    tradeoffs: ['More education can improve confidence while adding decision time.', 'A strong default lifts adoption but can obscure valid exceptions.'],
    evidenceBoundary: 'Owner-reported portfolio outcomes. Segment definitions and experiment windows remain confidential.',
  },
  {
    slug: 'mint-kids', outcomeId: 'outcome-04', sequence: '04', featured: true, systemLabel: '0-to-1 launch', company: 'Mint Mobile',
    indexTitle: 'A COPPA-compliant product tailored to kids.', title: 'A COPPA-compliant product tailored to kids.',
    summary: 'Built the ecommerce path for a parent-led wireless product tailored to kids, with COPPA compliance requirements embedded in the experience.',
    metricClaimIds: ['kids.activations_14k_90_days', 'kids.accidental_selection_rate_0_16'],
    evidenceClaimIds: ['kids.coppa_compliant_launch'],
    role: 'Senior Product Manager · Ecommerce launch',
    period: 'First 90 days measured',
    team: 'Ecommerce, activation, Care, legal, and analytics',
    customer: 'Parents adding a child line',
    surface: 'Discovery → child activation',
    mandate: 'Translate a kids wireless product into a clear parent-led purchase and activation journey with COPPA requirements and early accidental-selection detection built in.',
    shipped: ['Parent-centered product education and choice architecture.', 'A dedicated purchase path with clear plan differentiation.', 'COPPA requirements embedded across the parent-and-child experience.', 'Post-launch monitoring for accidental selection and support signals.'],
    learning: 'A healthy launch metric combines adoption with a measure of customer intent; volume alone cannot show whether the proposition was understood.',
    measurementNote: 'Launch-period owner-reported data: 14,000 activations in 90 days and 22 accidental selections, equal to 0.16% of activations.',
    flowLabel: 'Mint Kids launch loop',
    steps: [
      { title: 'Frame', description: 'Explain the product through a parent’s job.' },
      { title: 'Choose', description: 'Make plan differences and intent explicit.' },
      { title: 'Activate', description: 'Connect purchase to the child-line setup.' },
      { title: 'Monitor', description: 'Track adoption and accidental selection.' },
    ],
    problem: 'A new family proposition needed to feel simple enough to buy while remaining explicit about who the product was for and how activation would work.',
    decisions: ['Design the journey around the parent’s decision, not a generic line add.', 'Track accidental selection as a launch-quality signal.', 'Coordinate education, checkout, activation, and Care as one launch system.'],
    tradeoffs: ['Additional clarity can add friction to a fast checkout.', 'A specialized path improves comprehension but increases operational branching.'],
    evidenceBoundary: 'Owner-reported launch outcomes. The public case omits internal segmentation and operational detail.',
  },
  {
    slug: 'device-commerce', outcomeId: 'outcome-05', sequence: '05', featured: true, systemLabel: '0-to-1 commerce', company: 'Mint Mobile',
    indexTitle: 'A device business.', title: 'A device business, not a product page.',
    summary: 'Helped build a zero-to-one device-commerce operation spanning merchandising, purchase, activation, inventory, fulfillment, support, lifecycle growth, and returns.',
    metricClaimIds: ['device.units_sold_22_752', 'device.offer_configurations_100_plus', 'device.lifecycle_purchases_406', 'device.refund_rate_9_10'],
    evidenceClaimIds: ['commerce.device_business_zero_to_one'],
    role: 'Product Manager · 0-to-1 DTC',
    period: 'Mint tenure',
    team: 'Ecommerce, engineering, finance, fraud, operations, Care, and OEM partners',
    customer: 'Device shoppers and existing subscribers',
    surface: 'Discovery → return',
    mandate: 'Create the product and operating model required to sell hardware directly—then turn partner offers and lifecycle signals into repeatable growth.',
    shipped: ['Catalog, pricing, inventory, and offer-configuration foundations.', 'Checkout, payment-risk, order, and fulfillment integrations.', 'Activation, support, return, and refund journeys.', 'OEM-funded launch and lifecycle programs tied to customer behavior.'],
    learning: 'In physical commerce, the interface is the visible edge of a much larger product: policy, inventory, money movement, operations, and support must all agree.',
    measurementNote: 'Device units are cumulative through November 6, 2023. Lifecycle purchases and seven-day share refer to one measured program. Refund rate is a measured range, not a target.',
    supportingSignals: [{ value: '0→1', label: 'device operation' }, { value: 'Full loop', label: 'discovery to return' }],
    flowLabel: 'Device commerce operating model',
    steps: [
      { title: 'Merchandise', description: 'Unify catalog, pricing, offers, and inventory.' },
      { title: 'Checkout', description: 'Connect payment, risk, and order creation.' },
      { title: 'Fulfill', description: 'Orchestrate delivery and activation.' },
      { title: 'Lifecycle', description: 'Support, grow, return, and learn.' },
    ],
    problem: 'Selling hardware required an operating model spanning merchandising, payment risk, inventory, fulfillment, activation, returns, partner funding, and customer support.',
    decisions: ['Model the device lifecycle end to end.', 'Treat payment and fulfillment integrations as product surfaces.', 'Build configurable offers instead of one-off launch logic.'],
    tradeoffs: ['A broader offer system increases commercial flexibility and governance needs.', 'Faster launches require stronger configuration controls and operational readiness.'],
    evidenceBoundary: 'Owner-reported portfolio outcomes. Commercial terms, partner funding totals, and internal operational definitions remain confidential.',
  },
  {
    slug: 'production-ai', outcomeId: 'outcome-06', sequence: '06', featured: true, systemLabel: 'AI-enabled execution', company: 'Mint Mobile',
    indexTitle: 'Resolve the need.', title: 'Resolve the need, not just the message.',
    summary: 'Shipped a GPT-based sales and support assistant with retrieval, memory, and tool skills—measured on resolution, satisfaction, and safe escalation rather than demo quality.',
    metricClaimIds: ['ai.assistant.contacts_self_served_56', 'ai.assistant.csat_3_1_to_4_44', 'ai.assistant.escalations_reduced_34'],
    evidenceClaimIds: ['ai.assistant.rag_memory_tools'],
    role: 'Senior Product Manager',
    period: 'Mint tenure',
    team: 'Product, Care, engineering, analytics, and operations',
    customer: 'Sales and support customers',
    surface: 'Conversation → resolution',
    mandate: 'Move an assistant from persuasive demo to governed production product, with explicit grounding, actions, escalation, and outcome measurement.',
    shipped: ['Retrieval grounded in approved knowledge.', 'Memory and tool skills treated as governed capabilities.', 'Escalation paths for unsupported or higher-risk needs.', 'An evaluation loop spanning self-service, CSAT, and escalation.'],
    learning: 'AI becomes a product when the team defines what the system may know, do, escalate, and measure—not when the model simply sounds fluent.',
    measurementNote: 'Owner-reported production portfolio outcomes. Definitions, evaluation sets, and internal architecture remain confidential.',
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
    slug: 'enterprise-integration', outcomeId: 'outcome-07', sequence: '07', featured: false, systemLabel: 'Enterprise platform', company: 'Inspire Brands',
    indexTitle: 'Integration is a product.', title: 'Integration is a product.',
    summary: 'Led a Workday rollout as an end-to-end data and workflow experience across HR, payroll, operations, and legacy systems.',
    metricClaimIds: [],
    evidenceClaimIds: ['enterprise.workday_api_program'],
    role: 'Product Manager',
    period: '2019—2020',
    team: 'Enterprise platform and business teams',
    customer: 'Internal operators',
    surface: 'Workflow → system of record',
    mandate: 'Treat the Workday rollout as an operating-model change spanning workflows, ownership, integrations, migration, and adoption.',
    shipped: ['Workflow and owner maps.', 'Integration and data contracts.', 'Migration controls and exception paths.', 'Adoption and operational-readiness support.'],
    learning: 'Enterprise integration succeeds when the contract between people and systems is as explicit as the API contract.',
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
    slug: 'retail-self-service', outcomeId: 'outcome-08', sequence: '08', featured: false, systemLabel: 'Digital self-service', company: 'Best Buy',
    indexTitle: 'Self-service that resolves.', title: 'Help customers help themselves.',
    summary: 'Connected purchase and ownership: online device diagnostics reduced avoidable support demand, while attached installation services completed the customer job.',
    metricClaimIds: ['bestbuy.contact_deflection_10_20', 'bestbuy.services_attach_lift_15'],
    evidenceClaimIds: ['bestbuy.digital_diagnostics'],
    role: 'Product Manager',
    period: '2016—2019',
    team: 'Digital product, services, and support',
    customer: 'Device owners',
    surface: 'Diagnosis → resolution',
    mandate: 'Help customers solve post-purchase problems digitally while connecting the right service when self-resolution was not enough.',
    shipped: ['Online device diagnosis.', 'Contextual troubleshooting guidance.', 'Relevant installation-service offers.', 'A feedback path from unresolved needs into product planning.'],
    learning: 'Deflection is only a healthy metric when the customer’s problem is actually resolved.',
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
