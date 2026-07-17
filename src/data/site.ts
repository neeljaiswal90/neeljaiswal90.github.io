export interface ProductionSectionRecord {
  id: string;
  hash: string;
  sequence: string;
  navLabel: string;
  eyebrow: string;
  claimIds: readonly string[];
  mediaIds: readonly string[];
}

const canonicalOrigin = 'https://neeljaiswal.com';

export const site = {
  name: 'Neel Jaiswal',
  canonicalOrigin,
  title: 'Neel Jaiswal — Senior Product Manager, Mint Mobile',
  description:
    'Senior Product Manager leading ecommerce growth, product teams, and AI-enabled operating systems. Explore evidence-qualified outcomes and selected work.',
  language: 'en-US',
  openGraphLocale: 'en_US',
  jobTitle: 'Senior Product Manager',
  worksFor: 'Mint Mobile',
  expertise: ['eCommerce product leadership', 'Growth', 'New-business launches', 'Artificial intelligence', 'Experimentation'],
  sitemapPath: '/sitemap-index.xml',
  profileImage: {
    path: '/assets/headshot.jpg',
    width: 870,
    height: 827,
    type: 'image/jpeg',
    alt: 'Portrait of Neel Jaiswal wearing a navy jacket',
  },
  socialImage: {
    path: '/assets/social-card-v2.png',
    width: 1200,
    height: 630,
    type: 'image/png',
    alt: 'Neel Jaiswal with the headline I turn complexity into adoption on a warm editorial background',
  },
  themeStorageKey: 'neel-portfolio-theme',
  themes: ['studio', 'cinema', 'navy'] as const,
  contact: {
    email: 'neeljaiswal90@gmail.com',
    github: 'https://github.com/neeljaiswal90',
    linkedin: 'https://www.linkedin.com/in/neelesh-jaiswal/',
  },
} as const;

/** Build a query-free, hash-free canonical URL with directory-style slashes. */
export function canonicalUrl(pathname: string | URL = '/'): string {
  const url = new URL(pathname, `${canonicalOrigin}/`);
  url.search = '';
  url.hash = '';
  if (!url.pathname.endsWith('/') && !url.pathname.split('/').at(-1)?.includes('.')) {
    url.pathname = `${url.pathname}/`;
  }
  return url.href;
}

/**
 * These records are the only claims and media approved to render on production
 * routes. A review/blocked ID added here will fail content validation.
 */
export const productionSections: readonly ProductionSectionRecord[] = [
  {
    id: 'intro',
    hash: '#intro',
    sequence: '01',
    navLabel: 'Intro',
    eyebrow: 'Product leadership, systems thinking, measurable outcomes',
    claimIds: [
      'profile.experience.years_10_plus',
      'profile.location.greater_san_diego',
      'career.mint.role_dates',
      'career.mint.scope',
      'career.mint.product_leadership_team_of_pms',
      'growth.core_funnel_conversion_lift_54_7',
      'growth.cart_checkout_conversion_lift_77',
      'commerce.aov_lift_10_flat_conversion',
      'jd_power.purchase_rank_1_value_mvno_2023',
      'jd_power.purchase_score_862_1000',
      'jd_power.above_segment_average_51',
    ],
    mediaIds: ['media.profile.headshot'],
  },
  {
    id: 'experience',
    hash: '#experience',
    sequence: '02',
    navLabel: 'Experience',
    eyebrow: 'Career arc',
    claimIds: [
      'career.mint.role_dates',
      'career.mint.scope',
      'career.mint.product_leadership_team_of_pms',
      'career.inspire.role_dates',
      'career.bestbuy.role_dates',
      'career.target.role_dates',
      'career.allianz.role_dates',
      'enterprise.workday_api_program',
      'bestbuy.digital_diagnostics',
      'target.discovery_dashboards',
      'allianz.backlog_regulated_delivery',
    ],
    mediaIds: [],
  },
  {
    id: 'ai-system',
    hash: '#ai-system',
    sequence: '03',
    navLabel: 'AI system',
    eyebrow: 'AI product systems',
    claimIds: [
      'ai.assistant.rag_memory_tools',
      'toolkit.production_solo_build',
      'toolkit.evidence_to_release_human_gate',
      'toolkit.delivery_week_to_hour',
      'toolkit.delivery_acceleration_100x',
      'toolkit.planning_accuracy_gain_30',
      'toolkit.research_cycle_speed_10x',
      'ai.gpt_oss.reference_architecture',
    ],
    mediaIds: [],
  },
  {
    id: 'selected-work',
    hash: '#selected-work',
    sequence: '04',
    navLabel: 'Work',
    eyebrow: 'Selected outcomes',
    claimIds: [
      'growth.core_funnel_conversion_lift_54_7',
      'growth.cart_checkout_conversion_lift_77',
      'commerce.aov_lift_10_flat_conversion',
      'mhi.active_customers_29k_jan_2026',
      'mhi.promo_purchase_rate_lift_60',
      'mhi.promo_purchase_rate_lift_25',
      'esim.eligible_purchase_mix_67_77',
      'esim.default_selection_lift_7_flat_conversion',
      'kids.activations_14k_90_days',
      'kids.accidental_selection_rate_0_16',
      'device.pixel_units_22_752',
      'device.offer_configurations_100_plus',
      'device.lifecycle_purchases_406',
      'device.refund_rate_9_10',
      'ai.assistant.contacts_self_served_56',
      'ai.assistant.csat_3_1_to_4_44',
      'ai.assistant.escalations_reduced_34',
      'ai.assistant.rag_memory_tools',
      'commerce.device_business_zero_to_one',
      'enterprise.workday_api_program',
      'bestbuy.digital_diagnostics',
      'bestbuy.contact_deflection_10_20',
      'bestbuy.services_attach_lift_15',
    ],
    mediaIds: [],
  },
  {
    id: 'stack',
    hash: '#stack',
    sequence: '05',
    navLabel: 'Stack',
    eyebrow: 'My stack',
    claimIds: ['stack.public_tool_inventory_27', 'stack.public_tool_familiarity'],
    mediaIds: [],
  },
  {
    id: 'builds',
    hash: '#builds',
    sequence: '06',
    navLabel: 'Builds',
    eyebrow: 'Technical builds',
    claimIds: [
      'github.public_repository_count_5',
      'github.build.quant_futures_app',
      'github.build.tradingview_mcp_nq',
      'github.build.gdp_dash',
      'education.computer_science_degree',
    ],
    mediaIds: [],
  },
  {
    id: 'beyond',
    hash: '#beyond',
    sequence: '07',
    navLabel: 'Beyond',
    eyebrow: 'Beyond the roadmap',
    claimIds: [
      'athletics.wcg_year_2007',
      'athletics.weightlifting_medals_10_plus',
      'athletics.american_open_placing_4',
      'athletics.american_open_appearances_2021_2022',
    ],
    mediaIds: [
      'media.achievement.wcg_2007',
      'media.achievement.weightlifting_podium',
      'media.achievement.weightlifting_silver',
      'media.achievement.meet_medal_tshirt_edit',
    ],
  },
  {
    id: 'contact',
    hash: '#contact',
    sequence: '08',
    navLabel: 'Contact',
    eyebrow: 'Let’s talk',
    claimIds: ['profile.location.greater_san_diego'],
    mediaIds: [],
  },
];

export function getProductionSection(id: string): ProductionSectionRecord {
  const section = productionSections.find((item) => item.id === id);
  if (!section) throw new Error(`Unknown production section: ${id}`);
  return section;
}
