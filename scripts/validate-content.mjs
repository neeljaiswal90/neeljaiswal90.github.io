import { access, readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { sources } from '../src/data/sources.ts';
import { claims } from '../src/data/claims.ts';
import { media } from '../src/data/media.ts';
import { productionSections } from '../src/data/site.ts';
import { publicTools as tools } from '../src/data/tools.ts';
import { projects } from '../src/data/projects.ts';
import { workCases } from '../src/data/work.ts';
import { roles } from '../src/data/experience.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];

const fail = (message) => errors.push(message);
const warn = (message) => warnings.push(message);

function indexUnique(records, kind) {
  const index = new Map();
  for (const record of records) {
    if (!record.id || typeof record.id !== 'string') {
      fail(`${kind} record is missing a stable string ID.`);
      continue;
    }
    if (index.has(record.id)) {
      fail(`Duplicate ${kind} ID: ${record.id}`);
      continue;
    }
    index.set(record.id, record);
  }
  return index;
}

function isIsoDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function normalizeDisplayLiteral(value) {
  return value.normalize('NFKC').toLocaleLowerCase('en-US').replace(/\s+/g, ' ').trim();
}

async function listProductionSourceFiles(directory) {
  const files = [];
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error?.code === 'ENOENT') return files;
    throw error;
  }
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listProductionSourceFiles(absolutePath)));
    } else if (/\.(?:astro|html|md|mdx|js|jsx|ts|tsx)$/i.test(entry.name)) {
      files.push(absolutePath);
    }
  }
  return files;
}

const sourceById = indexUnique(sources, 'source');
const claimById = indexUnique(claims, 'claim');
const mediaById = indexUnique(media, 'media');
const toolById = indexUnique(tools, 'tool');
const projectById = indexUnique(projects, 'project');

const nowValue = process.env.CONTENT_VALIDATION_NOW ?? new Date().toISOString();
const now = new Date(nowValue);
if (Number.isNaN(now.valueOf())) {
  fail(`CONTENT_VALIDATION_NOW is not a valid date: ${nowValue}`);
}

for (const source of sources) {
  if (!isIsoDate(source.asOf)) {
    fail(`Source ${source.id} has an invalid asOf date: ${source.asOf}`);
  }

  if (source.kind === 'github-snapshot') {
    if (!isIsoDate(source.snapshotAt)) {
      fail(`GitHub snapshot source ${source.id} requires a YYYY-MM-DD snapshotAt value.`);
      continue;
    }
    const snapshot = new Date(`${source.snapshotAt}T00:00:00Z`);
    const ageDays = Math.floor((now - snapshot) / 86_400_000);
    if (ageDays < 0) {
      fail(`GitHub snapshot ${source.id} is dated ${Math.abs(ageDays)} day(s) in the future.`);
    } else if (ageDays > 30) {
      fail(`GitHub snapshot ${source.id} is ${ageDays} days old; refresh it before publishing (maximum 30 days).`);
    }
  }
}

for (const claim of claims) {
  if (!Array.isArray(claim.sourceIds) || claim.sourceIds.length === 0) {
    if (claim.publishingStatus === 'published' || claim.publishingStatus === 'reference-only') {
      fail(`Publishable claim ${claim.id} has no source.`);
    } else {
      warn(`Inventory claim ${claim.id} has no source.`);
    }
  }

  for (const sourceId of claim.sourceIds ?? []) {
    if (!sourceById.has(sourceId)) {
      fail(`Claim ${claim.id} references missing source ${sourceId}.`);
    }
  }

  if (claim.assertionKind === 'owner-asserted') {
    if (!isIsoDate(claim.approvedAt)) {
      fail(`Owner-asserted claim ${claim.id} requires a valid approvedAt date.`);
    } else if (new Date(`${claim.approvedAt}T00:00:00Z`) > now) {
      fail(`Owner-asserted claim ${claim.id} has a future approvedAt date (${claim.approvedAt}).`);
    }
  }

  if (claim.publishingStatus === 'reference-only' && !claim.displayLabel?.trim()) {
    fail(`Reference-only claim ${claim.id} requires an explicit displayLabel.`);
  }
}

for (const item of media) {
  for (const sourceId of item.sourceIds ?? []) {
    if (!sourceById.has(sourceId)) {
      fail(`Media ${item.id} references missing source ${sourceId}.`);
    }
  }

  if (item.publishingStatus === 'public') {
    if (!item.publicAllowed) {
      fail(`Public media ${item.id} must set publicAllowed: true.`);
    }
    if (!item.assetPath?.startsWith('/')) {
      fail(`Public media ${item.id} requires an absolute site assetPath.`);
    }
  } else {
    if (item.publicAllowed) {
      fail(`Non-public media ${item.id} cannot set publicAllowed: true.`);
    }
    if (item.assetPath) {
      fail(`Restricted/blocked media ${item.id} must not expose an assetPath.`);
    }
  }
}

const productionSourceFiles = [
  ...(await listProductionSourceFiles(path.join(repoRoot, 'src', 'pages'))),
  ...(await listProductionSourceFiles(path.join(repoRoot, 'src', 'components'))),
  ...(await listProductionSourceFiles(path.join(repoRoot, 'src', 'layouts'))),
];
for (const item of media) {
  for (const forbiddenPath of item.forbiddenPublicPaths ?? []) {
    const publicDiskPath = path.join(repoRoot, 'public', forbiddenPath.replace(/^\//, ''));
    try {
      await access(publicDiskPath);
      fail(`Restricted media ${item.id} exists under public: ${path.relative(repoRoot, publicDiskPath)}.`);
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }

    const referenceForms = new Set([forbiddenPath, forbiddenPath.replace(/^\//, '')]);
    for (const sourceFile of productionSourceFiles) {
      const sourceText = await readFile(sourceFile, 'utf8');
      if (Array.from(referenceForms).some((reference) => sourceText.includes(reference))) {
        fail(
          `Production source ${path.relative(repoRoot, sourceFile)} references restricted media ${item.id} (${forbiddenPath}).`,
        );
      }
    }
  }
}

const productionClaimLocations = new Map();
const productionMediaLocations = new Map();
const sectionIds = new Set();
const sectionHashes = new Set();

for (const section of productionSections) {
  if (sectionIds.has(section.id)) fail(`Duplicate production section ID: ${section.id}`);
  sectionIds.add(section.id);
  if (sectionHashes.has(section.hash)) fail(`Duplicate production section hash: ${section.hash}`);
  sectionHashes.add(section.hash);

  for (const claimId of section.claimIds) {
    const claim = claimById.get(claimId);
    if (!claim) {
      fail(`Production section ${section.id} references missing claim ${claimId}.`);
      continue;
    }
    if (claim.publishingStatus !== 'published' && claim.publishingStatus !== 'reference-only') {
      fail(`Production section ${section.id} references ${claim.publishingStatus} claim ${claimId}.`);
    }
    const locations = productionClaimLocations.get(claimId) ?? [];
    locations.push(section.id);
    productionClaimLocations.set(claimId, locations);
  }

  for (const mediaId of section.mediaIds) {
    const item = mediaById.get(mediaId);
    if (!item) {
      fail(`Production section ${section.id} references missing media ${mediaId}.`);
      continue;
    }
    if (!item.publicAllowed || item.publishingStatus !== 'public') {
      fail(`Production section ${section.id} references non-public media ${mediaId}.`);
    }
    const locations = productionMediaLocations.get(mediaId) ?? [];
    locations.push(section.id);
    productionMediaLocations.set(mediaId, locations);
  }
}

for (const tool of tools) {
  const item = mediaById.get(tool.mediaId);
  if (!item) {
    fail(`Tool ${tool.id} references missing media ${tool.mediaId}.`);
  } else if (!item.publicAllowed || item.publishingStatus !== 'public') {
    fail(`Tool ${tool.id} references non-public media ${tool.mediaId}.`);
  }
  if (!Array.isArray(tool.groups) || tool.groups.length === 0) {
    fail(`Tool ${tool.id} must belong to at least one filter group.`);
  }
}

const buildsSection = productionSections.find((section) => section.id === 'builds');
for (const project of projects) {
  const claim = claimById.get(project.claimId);
  if (!claim) {
    fail(`Project ${project.id} references missing claim ${project.claimId}.`);
  } else if (claim.publishingStatus !== 'published') {
    fail(`Project ${project.id} references non-published claim ${project.claimId}.`);
  }
  if (!buildsSection?.claimIds.includes(project.claimId)) {
    fail(`Project ${project.id} claim ${project.claimId} is not registered in the builds production section.`);
  }
  if (!['public-repo', 'private-build', 'live-app'].includes(project.access) || !project.accessLabel) {
    fail(`Project ${project.id} has invalid or missing access metadata.`);
  }
  if (project.access === 'public-repo') {
    if (!/^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/.test(project.url ?? '')) {
      fail(`Public project ${project.id} requires a canonical GitHub repository URL.`);
    }
    if (!project.repository || !project.defaultBranch) {
      fail(`Public project ${project.id} requires repository and default-branch metadata.`);
    }
  }
  if (project.access === 'live-app' && !/^https:\/\//.test(project.url ?? '')) {
    fail(`Live project ${project.id} requires an HTTPS destination.`);
  }
  if (project.access === 'private-build' && project.url) {
    fail(`Private project ${project.id} must not expose an inaccessible destination.`);
  }
  if (project.technologies.length === 0 || project.highlights.length === 0) {
    fail(`Project ${project.id} is missing technologies or highlights.`);
  }
}

const toolCountClaim = claims.find((claim) => claim.metricId === 'stack.public_tool_count');
if (!toolCountClaim) {
  fail('Missing stack.public_tool_inventory metric claim.');
} else {
  const claimedToolCount = Number.parseInt(toolCountClaim.displayValue ?? '', 10);
  if (!Number.isFinite(claimedToolCount) || claimedToolCount !== tools.length) {
    fail(`Tool inventory count drift: claim says ${toolCountClaim.displayValue ?? 'nothing'} but tools.ts contains ${tools.length}.`);
  }
}

const selectedWorkSection = productionSections.find((section) => section.id === 'selected-work');
const expectedWorkCaseSlugs = [
  'growth-system',
  'home-internet',
  'esim-growth',
  'mint-kids',
  'device-commerce',
  'production-ai',
  'enterprise-integration',
  'retail-self-service',
];
const expectedWorkCaseSlugSet = new Set(expectedWorkCaseSlugs);
const workSlugIndex = new Set();
const workClaimLocations = new Map();
for (const workCase of workCases) {
  if (workSlugIndex.has(workCase.slug)) fail(`Duplicate work case slug: ${workCase.slug}`);
  workSlugIndex.add(workCase.slug);

  if (typeof workCase.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(workCase.slug)) {
    fail(`Work case slug is not URL-safe lowercase kebab-case: ${workCase.slug}`);
  }

  if (!Array.isArray(workCase.steps) || workCase.steps.length !== 4) {
    fail(`Work case ${workCase.slug} must define exactly four process steps.`);
  }
  for (const [index, step] of (workCase.steps ?? []).entries()) {
    if (!step || typeof step.title !== 'string' || !step.title.trim()
      || typeof step.description !== 'string' || !step.description.trim()) {
      fail(`Work case ${workCase.slug} step ${index + 1} requires a nonempty title and description.`);
    }
  }

  if (!Array.isArray(workCase.metricClaimIds)) {
    fail(`Work case ${workCase.slug} requires a metricClaimIds array.`);
  }
  if (workCase.evidenceClaimIds !== undefined && !Array.isArray(workCase.evidenceClaimIds)) {
    fail(`Work case ${workCase.slug} evidenceClaimIds must be an array when provided.`);
  }
  const metricClaimIds = Array.isArray(workCase.metricClaimIds) ? workCase.metricClaimIds : [];
  const evidenceClaimIds = Array.isArray(workCase.evidenceClaimIds) ? workCase.evidenceClaimIds : [];
  const referencedClaimIds = [...metricClaimIds, ...evidenceClaimIds];
  const localClaimIds = new Set();

  for (const claimId of referencedClaimIds) {
    if (typeof claimId !== 'string' || !claimId.trim()) {
      fail(`Work case ${workCase.slug} contains an empty or non-string claim reference.`);
      continue;
    }
    if (localClaimIds.has(claimId)) {
      fail(`Work case ${workCase.slug} repeats claim reference ${claimId}.`);
      continue;
    }
    localClaimIds.add(claimId);

    const previousWorkCase = workClaimLocations.get(claimId);
    if (previousWorkCase) {
      fail(`Work claim ${claimId} is reused by ${previousWorkCase} and ${workCase.slug}; work-case claim IDs must be unique.`);
    } else {
      workClaimLocations.set(claimId, workCase.slug);
    }

    const claim = claimById.get(claimId);
    if (!claim || (claim.publishingStatus !== 'published' && claim.publishingStatus !== 'reference-only')) {
      fail(`Work case ${workCase.slug} references a missing or non-publishable claim: ${claimId}`);
      continue;
    }
    if (metricClaimIds.includes(claimId)) {
      if (claim.publishingStatus !== 'published') {
        fail(`Work case ${workCase.slug} metric ${claimId} must be published, not reference-only.`);
      }
      if (typeof claim.displayValue !== 'string' || !claim.displayValue.trim()
        || typeof claim.displayLabel !== 'string' || !claim.displayLabel.trim()) {
        fail(`Work case ${workCase.slug} metric ${claimId} requires nonempty displayValue and displayLabel fields.`);
      }
    }
    if (!selectedWorkSection?.claimIds.includes(claimId)) {
      fail(`Work case ${workCase.slug} claim ${claimId} is not registered in the selected-work production section.`);
    }
  }
}

if (workCases.length !== expectedWorkCaseSlugs.length || workSlugIndex.size !== expectedWorkCaseSlugs.length) {
  fail(`Work registry must contain exactly ${expectedWorkCaseSlugs.length} unique cases; found ${workCases.length} records and ${workSlugIndex.size} unique slugs.`);
}
for (const expectedSlug of expectedWorkCaseSlugs) {
  if (!workSlugIndex.has(expectedSlug)) fail(`Work registry is missing expected slug: ${expectedSlug}`);
}
for (const actualSlug of workSlugIndex) {
  if (!expectedWorkCaseSlugSet.has(actualSlug)) fail(`Work registry contains unexpected slug: ${actualSlug}`);
}

const experienceSection = productionSections.find((section) => section.id === 'experience');
for (const role of roles) {
  for (const claimId of [role.periodClaimId, role.summaryClaimId]) {
    const claim = claimById.get(claimId);
    if (!claim || claim.publishingStatus !== 'published') {
      fail(`Experience role ${role.id} references a missing or non-published claim: ${claimId}`);
    }
    if (!experienceSection?.claimIds.includes(claimId)) {
      fail(`Experience role ${role.id} claim ${claimId} is not registered in the experience production section.`);
    }
  }
}

const displayLiterals = new Map();
const metricIds = new Map();
for (const claimId of productionClaimLocations.keys()) {
  const claim = claimById.get(claimId);
  if (claim?.displayValue) {
    const literal = normalizeDisplayLiteral(claim.displayValue);
    const existing = displayLiterals.get(literal);
    if (existing) {
      fail(`Duplicate production display literal “${claim.displayValue}” in ${existing} and ${claim.id}.`);
    } else {
      displayLiterals.set(literal, claim.id);
    }
  }
  if (claim?.metricId) {
    const existing = metricIds.get(claim.metricId);
    if (existing) {
      fail(`Duplicate production metric ${claim.metricId} in ${existing} and ${claim.id}.`);
    } else {
      metricIds.set(claim.metricId, claim.id);
    }
  }
}

const productionSourceText = new Map(
  await Promise.all(
    productionSourceFiles.map(async (sourceFile) => [sourceFile, await readFile(sourceFile, 'utf8')]),
  ),
);
for (const claimId of productionClaimLocations.keys()) {
  const claim = claimById.get(claimId);
  if (!claim?.displayValue) continue;
  const escaped = claim.displayValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const hardCodedLiteral = new RegExp(`(?<![A-Za-z0-9_.-])${escaped}(?![A-Za-z0-9_.-])`, 'u');
  for (const [sourceFile, sourceText] of productionSourceText) {
    if (hardCodedLiteral.test(sourceText)) {
      fail(
        `Production source ${path.relative(repoRoot, sourceFile)} hard-codes display value “${claim.displayValue}” from ${claim.id}; render it from the claim registry instead.`,
      );
    }
  }
}

const publicMediaToCheck = new Set([
  ...productionMediaLocations.keys(),
  ...Array.from(toolById.values(), (tool) => tool.mediaId),
]);
for (const mediaId of publicMediaToCheck) {
  const item = mediaById.get(mediaId);
  if (!item?.assetPath) continue;
  const diskPath = path.join(repoRoot, 'public', item.assetPath.replace(/^\//, ''));
  try {
    await access(diskPath);
  } catch {
    fail(`Referenced public media ${mediaId} is missing on disk: ${path.relative(repoRoot, diskPath)}`);
  }
}

if (warnings.length > 0) {
  console.warn(`Content validation warnings (${warnings.length}):`);
  for (const message of warnings) console.warn(`  - ${message}`);
}

if (errors.length > 0) {
  console.error(`Content validation failed (${errors.length} error${errors.length === 1 ? '' : 's'}):`);
  for (const message of errors) console.error(`  - ${message}`);
  process.exitCode = 1;
} else {
  console.log(
    `Content validation passed: ${sources.length} sources, ${claims.length} claims, ${media.length} media records, ${productionSections.length} production sections, ${tools.length} public tools, ${projectById.size} featured projects.`,
  );
}
