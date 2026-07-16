# Publishing and production operations

This project deploys the exact artifact that passes the quality workflow. The primary production target is the user-site repository `neeljaiswal90/neeljaiswal90.github.io`, so the default public URL is `https://neeljaiswal90.github.io/` and Astro does not need a repository subpath.

## 1. One-time workstation setup

Install the Node version recorded in `.nvmrc`, then clone and install the locked dependency graph:

```powershell
git clone https://github.com/neeljaiswal90/neeljaiswal90.github.io.git
Set-Location neeljaiswal90.github.io
npm ci
```

`npm ci` should be used instead of `npm install` for validation and deployment because it fails if `package.json` and `package-lock.json` disagree.

## 2. Run the site locally

```powershell
npm run dev
```

Open `http://localhost:4321/`. Check the homepage, every theme, the outcome explorer, tool filters, photo dialog, and at least one case study at desktop and mobile widths.

For a production-equivalent local build:

```powershell
npm run build
npm run preview
```

## 3. Validate a release

Run the same gates used by GitHub Actions:

```powershell
npm run check
npm run build
npm run test:e2e
npm run test:lhci
```

Expected browser result: 36 passing tests across desktop, mobile, reduced-motion, no-JavaScript, accessibility, interaction, SEO, and case-study suites.

On some Windows/Chrome 150 combinations, Lighthouse finishes the audit and writes its report but exits with `EPERM` while deleting a temporary Chrome profile. Do not waive the production gate: push the branch and require the Ubuntu `Lighthouse budgets` job to pass.

## 4. Publish a normal update

Create a branch, make the change, and keep content edits in the typed registries:

```powershell
git switch -c portfolio/update-name
git status --short
npm run check
npm run build
npm run test:e2e
git add --all
git diff --cached --check
git commit -m "feat: describe the portfolio update"
git push -u origin portfolio/update-name
```

Open a pull request. GitHub runs three required jobs:

1. `Static checks and production build`
2. `Browser quality matrix`
3. `Lighthouse budgets`

After review, merge into `main`. The `Deploy verified build to GitHub Pages` job downloads the same `dist/` artifact produced by the build job and deploys only after both browser and Lighthouse jobs pass.

Track a release from PowerShell:

```powershell
gh run list --workflow "Quality gates" --limit 5
gh run watch --exit-status
```

Then verify both the homepage and a nested route:

```powershell
Invoke-WebRequest https://neeljaiswal90.github.io/ -Method Head
Invoke-WebRequest https://neeljaiswal90.github.io/work/growth-system/ -Method Head
```

GitHub notes that a Pages update can take several minutes to become visible. The Actions run and the `github-pages` environment URL are the deployment source of truth.

## 5. Roll back

Do not rewrite public history. Revert the release commit and push the new revert commit:

```powershell
git switch main
git pull --ff-only
git revert <bad-commit-sha>
git push origin main
```

The same gates run again and deploy the prior content as a new, auditable release.

## 6. Add a custom domain later

Do this only after the domain is owned and accessible in its DNS provider.

1. In GitHub account settings, open **Pages** and verify the domain with the TXT record GitHub provides. Verification reduces domain-takeover risk.
2. In the repository, open **Settings → Pages → Custom domain**, enter the chosen apex or `www` domain, and save it before changing DNS.
3. For an apex domain, add all four current GitHub Pages `A` records:

   ```text
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```

4. Optionally add GitHub's four `AAAA` records for IPv6. For `www`, add a `CNAME` pointing directly to `neeljaiswal90.github.io`.
5. Do not create wildcard DNS records. Wait for propagation, which may take up to 24 hours.
6. On Windows, verify the records:

   ```powershell
   Resolve-DnsName your-domain.example -Type A
   Resolve-DnsName www.your-domain.example -Type CNAME
   ```

7. Enable **Enforce HTTPS** in GitHub Pages after the certificate becomes available.
8. Change `canonicalOrigin` in `src/data/site.ts` to the final HTTPS domain, run all gates, and deploy. That one value updates canonical URLs, sitemap entries, robots discovery, Open Graph URLs, and JSON-LD.

Current GitHub guidance is maintained in [Managing a custom domain for GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) and [Verifying a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages).

## 7. Publication safety checklist

Before every public release:

- Confirm new metrics have an approved record and evidence boundary.
- Confirm new photos are owner-approved and represented in `src/data/media.ts`.
- Keep restricted charts, raw source assets, `.env` files, and credentials out of Git.
- Run `git diff --cached --check` and inspect `git status --short` before committing.
- Verify resume, email, LinkedIn, GitHub, and case-study links.
- Confirm the social card and canonical origin are correct for the target domain.
- Require all three quality jobs before deploying.

## 8. Optional OpenAI Sites package

The normal GitHub Pages build remains `npm run build`. For a Sites-compatible package:

```powershell
npm run build:sites
```

This keeps the static site under `dist/client/` and writes a minimal `dist/server/index.js` worker that delegates requests to the platform `ASSETS` binding. Hosting metadata and deployment credentials must never be hard-coded into source files.
