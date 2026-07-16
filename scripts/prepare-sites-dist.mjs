import { access, mkdir, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const projectRoot = process.cwd();
const distDir = resolve(projectRoot, 'dist');
const clientDir = join(distDir, 'client');
const serverDir = join(distDir, 'server');
const rootDocument = join(distDir, 'index.html');

try {
  await access(rootDocument);
} catch {
  throw new Error('Missing dist/index.html. Run the Astro production build before staging Sites output.');
}

await rm(clientDir, { recursive: true, force: true });
await rm(serverDir, { recursive: true, force: true });
await mkdir(clientDir, { recursive: true });

for (const entry of await readdir(distDir, { withFileTypes: true })) {
  if (entry.name === 'client' || entry.name === 'server' || entry.name === '.openai') continue;
  await rename(join(distDir, entry.name), join(clientDir, entry.name));
}

await mkdir(serverDir, { recursive: true });
await writeFile(join(serverDir, 'index.js'), `const worker = {
  async fetch(request, env) {
    if (!env?.ASSETS || typeof env.ASSETS.fetch !== 'function') {
      return new Response('Static asset binding unavailable.', { status: 500 });
    }
    return env.ASSETS.fetch(request);
  },
};

export default worker;
`, 'utf8');

await access(join(clientDir, 'index.html'));
await access(join(serverDir, 'index.js'));
console.log('Sites output staged: dist/client static assets + dist/server/index.js Worker.');
