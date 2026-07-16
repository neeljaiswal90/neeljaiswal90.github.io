export type SourceId =
  | 'src.resume.master'
  | 'src.owner.directives'
  | 'src.jd_power.purchase_2023'
  | 'src.github.snapshot_2026_07_15'
  | 'src.photo.wcg_2007'
  | 'src.photo.weightlifting'
  | 'src.tools.owner_inventory'
  | 'src.iconify'
  | 'src.openai.gpt_oss';

export type SourceKind =
  | 'resume'
  | 'owner-directive'
  | 'external-study'
  | 'github-snapshot'
  | 'owner-photo'
  | 'owner-inventory'
  | 'icon-library'
  | 'official-documentation';

export interface SourceRecord {
  id: SourceId;
  title: string;
  kind: SourceKind;
  publisher: string;
  url?: string;
  localPath?: string;
  asOf: string;
  snapshotAt?: string;
  publicCitationAllowed: boolean;
  assetReuseAllowed: boolean;
  notes?: string;
}

/**
 * Canonical evidence registry. Claims point here by stable ID; components should
 * never carry ad-hoc source URLs or implied evidence provenance.
 */
export const sources: readonly SourceRecord[] = [
  {
    id: 'src.resume.master',
    title: 'Neelesh Jaiswal master resume',
    kind: 'resume',
    publisher: 'Neel Jaiswal',
    localPath: '/Neelesh_Jaiswal_Resume_Master.pdf',
    asOf: '2026-07-15',
    publicCitationAllowed: true,
    assetReuseAllowed: true,
  },
  {
    id: 'src.owner.directives',
    title: 'Portfolio content directives and owner-supplied outcomes',
    kind: 'owner-directive',
    publisher: 'Neel Jaiswal',
    asOf: '2026-07-15',
    publicCitationAllowed: false,
    assetReuseAllowed: false,
    notes: 'Confidential working evidence is intentionally not linked from the public site.',
  },
  {
    id: 'src.jd_power.purchase_2023',
    title: '2023 U.S. Wireless Purchase Experience Study, Volume 1',
    kind: 'external-study',
    publisher: 'J.D. Power',
    url: 'https://www.jdpower.com/business/press-releases/2023-us-wireless-purchase-experience-studies-volume-1',
    asOf: '2023-03-16',
    publicCitationAllowed: true,
    assetReuseAllowed: false,
    notes: 'Facts may be cited with attribution. The supplied ranking chart is restricted and must not ship as a site asset.',
  },
  {
    id: 'src.github.snapshot_2026_07_15',
    title: 'Neel Jaiswal public GitHub profile snapshot',
    kind: 'github-snapshot',
    publisher: 'GitHub',
    url: 'https://github.com/neeljaiswal90',
    asOf: '2026-07-15',
    snapshotAt: '2026-07-15',
    publicCitationAllowed: true,
    assetReuseAllowed: false,
    notes: 'Profile and featured repository READMEs were refreshed through the GitHub API on the snapshot date.',
  },
  {
    id: 'src.photo.wcg_2007',
    title: 'WCG 2007 medal ceremony photograph',
    kind: 'owner-photo',
    publisher: 'Neel Jaiswal',
    asOf: '2007-01-01',
    publicCitationAllowed: false,
    assetReuseAllowed: true,
    notes: 'Owner supplied for portfolio publication.',
  },
  {
    id: 'src.photo.weightlifting',
    title: 'Weightlifting competition and podium photographs',
    kind: 'owner-photo',
    publisher: 'Neel Jaiswal',
    asOf: '2026-07-15',
    publicCitationAllowed: false,
    assetReuseAllowed: true,
    notes: 'Owner supplied for portfolio publication; use real photographs rather than generated substitutes.',
  },
  {
    id: 'src.tools.owner_inventory',
    title: 'Public product and engineering tool inventory',
    kind: 'owner-inventory',
    publisher: 'Neel Jaiswal',
    asOf: '2026-07-15',
    publicCitationAllowed: false,
    assetReuseAllowed: false,
    notes: 'Contains publicly available tools only; Mint and Ultra internal systems are excluded.',
  },
  {
    id: 'src.iconify',
    title: 'Iconify brand and product symbols',
    kind: 'icon-library',
    publisher: 'Iconify',
    url: 'https://iconify.design/',
    asOf: '2026-07-15',
    publicCitationAllowed: true,
    assetReuseAllowed: true,
    notes: 'Product marks are used nominatively and remain the property of their respective owners.',
  },
  {
    id: 'src.openai.gpt_oss',
    title: 'OpenAI open models and gpt-oss documentation',
    kind: 'official-documentation',
    publisher: 'OpenAI',
    url: 'https://openai.com/open-models/',
    asOf: '2026-07-15',
    publicCitationAllowed: true,
    assetReuseAllowed: false,
  },
];

export const sourceById = new Map(sources.map((source) => [source.id, source]));
