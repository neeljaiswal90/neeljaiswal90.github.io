import { media } from './media.ts';

export type ToolGroup = 'discover' | 'plan' | 'build' | 'ai' | 'data' | 'commerce';

export interface PublicToolRecord {
  id: string;
  name: string;
  groups: readonly ToolGroup[];
  mediaId: string;
  detail: string;
}

export const publicTools: readonly PublicToolRecord[] = [
  { id: 'linear', name: 'Linear', groups: ['plan', 'build'], mediaId: 'media.tool.linear', detail: 'Product planning' },
  { id: 'codex', name: 'Codex', groups: ['build', 'ai'], mediaId: 'media.tool.codex', detail: 'Agentic coding' },
  { id: 'cursor', name: 'Cursor', groups: ['build', 'ai'], mediaId: 'media.tool.cursor', detail: 'AI-assisted IDE' },
  { id: 'claude-code', name: 'Claude Code', groups: ['build', 'ai'], mediaId: 'media.tool.claude_code', detail: 'Terminal coding agent' },
  { id: 'ontology', name: 'Ontology + graphs', groups: ['ai', 'data'], mediaId: 'media.pattern.ontology_graphs', detail: 'Architecture pattern' },
  { id: 'snowflake', name: 'Snowflake', groups: ['data'], mediaId: 'media.tool.snowflake', detail: 'Cloud data platform' },
  { id: 'github', name: 'GitHub', groups: ['plan', 'build'], mediaId: 'media.tool.github', detail: 'Source + delivery' },
  { id: 'postman', name: 'Postman', groups: ['build'], mediaId: 'media.tool.postman', detail: 'API development' },
  { id: 'amplitude', name: 'Amplitude', groups: ['discover', 'plan', 'data'], mediaId: 'media.tool.amplitude', detail: 'Product analytics' },
  { id: 'optimizely', name: 'Optimizely', groups: ['discover', 'plan', 'data'], mediaId: 'media.tool.optimizely', detail: 'Experimentation' },
  { id: 'figma', name: 'Figma', groups: ['discover', 'plan', 'build'], mediaId: 'media.tool.figma', detail: 'Interface design' },
  { id: 'lucidchart', name: 'Lucidchart', groups: ['discover', 'plan'], mediaId: 'media.tool.lucidchart', detail: 'Mapping + systems' },
  { id: 'jira', name: 'Jira', groups: ['plan', 'build'], mediaId: 'media.tool.jira', detail: 'Delivery workflow' },
  { id: 'confluence', name: 'Confluence', groups: ['plan'], mediaId: 'media.tool.confluence', detail: 'Shared knowledge' },
  { id: 'slack', name: 'Slack', groups: ['plan'], mediaId: 'media.tool.slack', detail: 'Team coordination' },
  { id: 'datadog', name: 'Datadog', groups: ['build', 'data'], mediaId: 'media.tool.datadog', detail: 'Telemetry + monitoring' },
  { id: 'elastic-stack', name: 'Elastic Stack', groups: ['data'], mediaId: 'media.tool.elastic_stack', detail: 'Search + observability' },
  { id: 'looker', name: 'Looker', groups: ['data'], mediaId: 'media.tool.looker', detail: 'Business intelligence' },
  { id: 'bigquery', name: 'BigQuery', groups: ['data'], mediaId: 'media.tool.bigquery', detail: 'Analytics warehouse' },
  { id: 'aws', name: 'AWS', groups: ['build', 'data'], mediaId: 'media.tool.aws', detail: 'Cloud platform' },
  { id: 'woocommerce', name: 'WooCommerce', groups: ['commerce'], mediaId: 'media.tool.woocommerce', detail: 'WordPress commerce' },
  { id: 'shopify', name: 'Shopify', groups: ['commerce'], mediaId: 'media.tool.shopify', detail: 'Commerce platform' },
  { id: 'payment-gateways', name: 'Payment gateways', groups: ['commerce', 'build'], mediaId: 'media.capability.payment_gateways', detail: 'Integration capability' },
  { id: 'wordpress', name: 'WordPress', groups: ['commerce', 'build'], mediaId: 'media.tool.wordpress', detail: 'Content platforms' },
  { id: 'python', name: 'Python', groups: ['build', 'data', 'ai'], mediaId: 'media.tool.python', detail: 'Data + ML tooling' },
  { id: 'typescript', name: 'TypeScript', groups: ['build'], mediaId: 'media.tool.typescript', detail: 'Product systems' },
  { id: 'react', name: 'React', groups: ['build'], mediaId: 'media.tool.react', detail: 'Interface engineering' },
];

const mediaById = new Map(media.map((item) => [item.id, item]));

export const toolProfiles = publicTools.map((tool) => {
  const asset = mediaById.get(tool.mediaId);
  if (!asset?.assetPath || !asset.publicAllowed) throw new Error(`Tool ${tool.id} has no publishable media asset.`);
  return { ...tool, assetPath: asset.assetPath };
});

export const toolFilters = [
  { id: 'all', label: 'All tools' },
  { id: 'discover', label: 'Product' },
  { id: 'plan', label: 'Delivery' },
  { id: 'ai', label: 'AI + agents' },
  { id: 'data', label: 'Data + APIs' },
  { id: 'commerce', label: 'Commerce' },
  { id: 'build', label: 'Build' },
] as const;
