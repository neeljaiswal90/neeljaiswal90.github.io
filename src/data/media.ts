import type { SourceId } from './sources';

export type MediaPublishingStatus = 'public' | 'restricted' | 'blocked' | 'unused';
export type MediaKind = 'photo' | 'study-chart' | 'tool-mark' | 'brand-mark' | 'illustration';

export interface MediaRendition {
  src: string;
  width: number;
}

export interface ResponsiveMediaSet {
  avif: readonly MediaRendition[];
  webp: readonly MediaRendition[];
  sizes: string;
}

export interface MediaRecord {
  id: string;
  title: string;
  kind: MediaKind;
  publishingStatus: MediaPublishingStatus;
  publicAllowed: boolean;
  sourceIds: readonly SourceId[];
  assetPath?: string;
  responsive?: ResponsiveMediaSet;
  forbiddenPublicPaths?: readonly string[];
  alt?: string;
  rightsBasis: 'owner-supplied' | 'nominative-brand-mark' | 'restricted-source' | 'original-code-native' | 'generated-unused';
  notes?: string;
}

const toolMedia = (
  id: string,
  title: string,
  filename: string,
  rightsBasis: MediaRecord['rightsBasis'] = 'nominative-brand-mark',
  sourceIds: readonly SourceId[] = ['src.iconify', 'src.tools.owner_inventory'],
): MediaRecord => ({
  id,
  title,
  kind: 'tool-mark',
  publishingStatus: 'public',
  publicAllowed: true,
  sourceIds,
  assetPath: `/assets/tools/${filename}`,
  alt: '',
  rightsBasis,
  notes: 'Decorative nominative mark; the adjacent text supplies the accessible tool name.',
});

/**
 * Media rights and publication registry. Restricted and blocked records carry no
 * public asset path. Production sections may reference only `publicAllowed`
 * records with `publishingStatus: public`.
 */
export const media: readonly MediaRecord[] = [
  {
    id: 'media.profile.headshot',
    title: 'Neel Jaiswal profile headshot',
    kind: 'photo',
    publishingStatus: 'public',
    publicAllowed: true,
    sourceIds: ['src.owner.directives'],
    assetPath: '/assets/headshot-870.webp',
    responsive: {
      avif: [160, 320, 640, 870].map((width) => ({ src: `/assets/headshot-${width}.avif`, width })),
      webp: [160, 320, 640, 870].map((width) => ({ src: `/assets/headshot-${width}.webp`, width })),
      sizes: '(max-width: 680px) 250px, (max-width: 1390px) 23vw, 320px',
    },
    alt: 'Portrait of Neel Jaiswal wearing a navy jacket.',
    rightsBasis: 'owner-supplied',
  },
  {
    id: 'media.evidence.jd_power_purchase_2023',
    title: 'J.D. Power 2023 purchase-experience ranking chart',
    kind: 'study-chart',
    publishingStatus: 'restricted',
    publicAllowed: false,
    sourceIds: ['src.jd_power.purchase_2023'],
    forbiddenPublicPaths: ['/assets/jd-power-2023-purchase-study.png'],
    rightsBasis: 'restricted-source',
    notes: 'Inventory record only. Do not add an assetPath or reference this chart from production content; cite the public study textually.',
  },
  {
    id: 'media.evidence.jd_power_award_graphic_2023',
    title: 'Mint Mobile 2023 J.D. Power purchase-experience award graphic',
    kind: 'illustration',
    publishingStatus: 'public',
    publicAllowed: true,
    sourceIds: ['src.owner.directives', 'src.jd_power.purchase_2023'],
    assetPath: '/assets/jd-power-2023-purchase-experience-award.webp',
    alt: 'Illustrated 2023 J.D. Power U.S. Wireless Purchase Experience award presented to Mint Mobile.',
    rightsBasis: 'owner-supplied',
    notes: 'Owner-supplied recognition graphic. The official study link provides the source of record for the ranking.',
  },
  {
    id: 'media.achievement.wcg_2007',
    title: 'WCG 2007 medal ceremony',
    kind: 'photo',
    publishingStatus: 'public',
    publicAllowed: true,
    sourceIds: ['src.photo.wcg_2007'],
    assetPath: '/assets/wcg-archive-real-500.webp',
    responsive: {
      avif: [320, 500].map((width) => ({ src: `/assets/wcg-archive-real-${width}.avif`, width })),
      webp: [320, 500].map((width) => ({ src: `/assets/wcg-archive-real-${width}.webp`, width })),
      sizes: '(max-width: 760px) calc(100vw - 60px), 32vw',
    },
    alt: 'Neel Jaiswal receiving a certificate and medal at WCG 2007.',
    rightsBasis: 'owner-supplied',
  },
  {
    id: 'media.achievement.weightlifting_podium',
    title: 'Weightlifting podium group photograph',
    kind: 'photo',
    publishingStatus: 'public',
    publicAllowed: true,
    sourceIds: ['src.photo.weightlifting'],
    assetPath: '/assets/weightlifting-podium-real-1134.webp',
    responsive: {
      avif: [480, 768, 1134].map((width) => ({ src: `/assets/weightlifting-podium-real-${width}.avif`, width })),
      webp: [480, 768, 1134].map((width) => ({ src: `/assets/weightlifting-podium-real-${width}.webp`, width })),
      sizes: '(max-width: 760px) calc(50vw - 30px), 34vw',
    },
    alt: 'Neel Jaiswal and two competitors wearing medals after a weightlifting competition.',
    rightsBasis: 'owner-supplied',
  },
  {
    id: 'media.achievement.weightlifting_silver',
    title: 'Weightlifting silver-medal podium photograph',
    kind: 'photo',
    publishingStatus: 'public',
    publicAllowed: true,
    sourceIds: ['src.photo.weightlifting'],
    assetPath: '/assets/weightlifting-silver-podium-real-1200.webp',
    responsive: {
      avif: [480, 768, 1200].map((width) => ({ src: `/assets/weightlifting-silver-podium-real-${width}.avif`, width })),
      webp: [480, 768, 1200].map((width) => ({ src: `/assets/weightlifting-silver-podium-real-${width}.webp`, width })),
      sizes: '(max-width: 760px) calc(100vw - 60px), 28vw',
    },
    alt: 'Neel Jaiswal wearing a silver medal beside a gold-medal competitor on a podium.',
    rightsBasis: 'owner-supplied',
  },
  {
    id: 'media.achievement.meet_medal_tshirt_edit',
    title: 'Weightlifting meet medal photograph with T-shirt edit',
    kind: 'photo',
    publishingStatus: 'public',
    publicAllowed: true,
    sourceIds: ['src.photo.weightlifting'],
    assetPath: '/assets/weightlifting-medal-tshirt-edited-1122.webp',
    responsive: {
      avif: [480, 768, 1122].map((width) => ({ src: `/assets/weightlifting-medal-tshirt-edited-${width}.avif`, width })),
      webp: [480, 768, 1122].map((width) => ({ src: `/assets/weightlifting-medal-tshirt-edited-${width}.webp`, width })),
      sizes: '(max-width: 760px) calc(100vw - 60px), 21vw',
    },
    alt: 'Neel Jaiswal wearing a medal and athletic T-shirt with two competition officials.',
    rightsBasis: 'owner-supplied',
    notes: 'Owner requested the T-shirt presentation; retain the real-event context.',
  },
  {
    id: 'media.history.generated_medal_collection',
    title: 'Generated medal collection concept',
    kind: 'illustration',
    publishingStatus: 'unused',
    publicAllowed: false,
    sourceIds: ['src.owner.directives'],
    rightsBasis: 'generated-unused',
    notes: 'Rejected concept. Keep out of public assets and production content.',
  },
  {
    id: 'media.history.generated_podium_medals',
    title: 'Generated podium medals concept',
    kind: 'illustration',
    publishingStatus: 'unused',
    publicAllowed: false,
    sourceIds: ['src.owner.directives'],
    rightsBasis: 'generated-unused',
    notes: 'Rejected concept. Keep out of public assets and production content.',
  },
  {
    id: 'media.history.generated_wcg_medal',
    title: 'Generated WCG medal concept',
    kind: 'illustration',
    publishingStatus: 'blocked',
    publicAllowed: false,
    sourceIds: ['src.owner.directives'],
    rightsBasis: 'generated-unused',
    notes: 'Rejected concept. It could imply event-specific authenticity; never publish.',
  },
  {
    id: 'media.history.generated_usaw_finals',
    title: 'Generated USA Weightlifting finals concept',
    kind: 'illustration',
    publishingStatus: 'blocked',
    publicAllowed: false,
    sourceIds: ['src.owner.directives'],
    rightsBasis: 'generated-unused',
    notes: 'Rejected concept. It could imply event-specific authenticity; never publish.',
  },
  {
    id: 'media.history.generated_wcg_2006',
    title: 'Generated WCG 2006 event concept',
    kind: 'illustration',
    publishingStatus: 'blocked',
    publicAllowed: false,
    sourceIds: ['src.owner.directives'],
    rightsBasis: 'generated-unused',
    notes: 'Rejected and year-conflicting concept; never publish.',
  },
  {
    id: 'media.brand.mint_mobile',
    title: 'Mint Mobile fox mark',
    kind: 'brand-mark',
    publishingStatus: 'public',
    publicAllowed: true,
    sourceIds: ['src.dashboard_icons'],
    assetPath: '/assets/brands/mint-mobile.svg',
    alt: '',
    rightsBasis: 'nominative-brand-mark',
    notes: 'Decorative nominative mark; the adjacent company name supplies the accessible label.',
  },
  {
    id: 'media.brand.inspire_brands',
    title: 'Inspire Brands portfolio mark',
    kind: 'brand-mark',
    publishingStatus: 'public',
    publicAllowed: true,
    sourceIds: ['src.wikimedia_commons'],
    assetPath: '/assets/brands/inspire-brands.png',
    alt: '',
    rightsBasis: 'nominative-brand-mark',
    notes: 'Decorative nominative mark; the adjacent company name supplies the accessible label.',
  },
  {
    id: 'media.brand.best_buy',
    title: 'Best Buy logo',
    kind: 'brand-mark',
    publishingStatus: 'public',
    publicAllowed: true,
    sourceIds: ['src.wikimedia_commons'],
    assetPath: '/assets/brands/best-buy.svg',
    alt: '',
    rightsBasis: 'nominative-brand-mark',
    notes: 'Decorative nominative mark; the adjacent company name supplies the accessible label.',
  },
  {
    id: 'media.brand.target',
    title: 'Target bullseye',
    kind: 'brand-mark',
    publishingStatus: 'public',
    publicAllowed: true,
    sourceIds: ['src.wikimedia_commons'],
    assetPath: '/assets/brands/target.svg',
    alt: '',
    rightsBasis: 'nominative-brand-mark',
    notes: 'Decorative nominative mark; the adjacent company name supplies the accessible label.',
  },
  {
    id: 'media.brand.allianz',
    title: 'Allianz logo',
    kind: 'brand-mark',
    publishingStatus: 'public',
    publicAllowed: true,
    sourceIds: ['src.wikimedia_commons'],
    assetPath: '/assets/brands/allianz.svg',
    alt: '',
    rightsBasis: 'nominative-brand-mark',
    notes: 'Decorative nominative mark; the adjacent company name supplies the accessible label.',
  },
  toolMedia('media.tool.linear', 'Linear', 'linear.svg'),
  toolMedia('media.tool.codex', 'OpenAI Codex', 'openai-codex.svg'),
  toolMedia('media.tool.cursor', 'Cursor', 'cursor.svg'),
  toolMedia('media.tool.claude_code', 'Claude Code', 'claude-code.svg'),
  toolMedia(
    'media.pattern.ontology_graphs',
    'Ontology and knowledge graphs',
    'ontology.svg',
    'original-code-native',
    ['src.tools.owner_inventory'],
  ),
  toolMedia('media.tool.snowflake', 'Snowflake', 'snowflake.svg'),
  toolMedia('media.tool.github', 'GitHub', 'github.svg'),
  toolMedia('media.tool.postman', 'Postman', 'postman.svg'),
  toolMedia('media.tool.amplitude', 'Amplitude', 'amplitude.svg'),
  toolMedia('media.tool.optimizely', 'Optimizely', 'optimizely.svg'),
  toolMedia('media.tool.figma', 'Figma', 'figma.svg'),
  toolMedia('media.tool.lucidchart', 'Lucidchart', 'lucidchart.svg'),
  toolMedia('media.tool.jira', 'Jira', 'jira.svg'),
  toolMedia('media.tool.confluence', 'Confluence', 'confluence.svg'),
  toolMedia('media.tool.slack', 'Slack', 'slack.svg'),
  toolMedia('media.tool.datadog', 'Datadog', 'datadog.svg'),
  toolMedia('media.tool.elastic_stack', 'Elastic Stack', 'elastic-stack.svg'),
  toolMedia('media.tool.looker', 'Looker', 'looker.svg'),
  toolMedia('media.tool.bigquery', 'BigQuery', 'bigquery.svg'),
  toolMedia('media.tool.aws', 'AWS', 'aws.svg'),
  toolMedia('media.tool.woocommerce', 'WooCommerce', 'woocommerce.svg'),
  toolMedia('media.tool.shopify', 'Shopify', 'shopify.svg'),
  toolMedia(
    'media.capability.payment_gateways',
    'Payment gateways',
    'payment-gateways.svg',
    'original-code-native',
    ['src.tools.owner_inventory'],
  ),
  toolMedia('media.tool.wordpress', 'WordPress', 'wordpress.svg'),
  toolMedia('media.tool.python', 'Python', 'python.svg'),
  toolMedia('media.tool.typescript', 'TypeScript', 'typescript.svg'),
  toolMedia('media.tool.react', 'React', 'react.svg'),
];

export const mediaById = new Map(media.map((item) => [item.id, item]));

export function getPublishableMedia(id: string): MediaRecord & { assetPath: string } {
  const item = mediaById.get(id);
  if (!item?.assetPath || !item.publicAllowed || item.publishingStatus !== 'public') {
    throw new Error(`Media is not approved for production: ${id}`);
  }
  return item as MediaRecord & { assetPath: string };
}
