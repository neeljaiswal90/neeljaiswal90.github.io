export interface ProjectRecord {
  id: string;
  claimId: string;
  title: string;
  repository: string;
  url: string;
  defaultBranch: string;
  summary: string;
  technologies: readonly string[];
  highlights: readonly string[];
  boundary?: string;
}

/**
 * Public project summaries are intentionally narrower than the underlying
 * repositories. Each card is backed by the GitHub snapshot source and the
 * repository's default-branch README/package manifests.
 */
export const projects: readonly ProjectRecord[] = [
  {
    id: 'quant-futures-app',
    claimId: 'github.build.quant_futures_app',
    title: 'Quant Futures App',
    repository: 'neeljaiswal90/Quant-Futures-App',
    url: 'https://github.com/neeljaiswal90/Quant-Futures-App',
    defaultBranch: 'main',
    summary:
      'A deterministic MNQ research platform for replay-safe backtesting, held-out strategy validation, data lineage, and paper-market operations.',
    technologies: ['TypeScript', 'Python', 'React', 'Vitest'],
    highlights: ['Deterministic backtesting', 'Held-out validation', 'Operator console'],
    boundary: 'The repository limits its selected strategy to paper validation; live-money execution is out of scope.',
  },
  {
    id: 'tradingview-mcp-nq',
    claimId: 'github.build.tradingview_mcp_nq',
    title: 'TradingView MCP + NQ',
    repository: 'neeljaiswal90/tradingview-mcp-nq',
    url: 'https://github.com/neeljaiswal90/tradingview-mcp-nq',
    defaultBranch: 'master',
    summary:
      'A full-stack TradingView MCP workspace connecting chart tooling, NQ/MNQ workflows, an operator dashboard, and Python market-data and ML services.',
    technologies: ['TypeScript', 'React', 'Python', 'MCP'],
    highlights: ['MCP server + CLI', 'Operator dashboard', 'Data + ML sidecars'],
  },
  {
    id: 'gdp-dash',
    claimId: 'github.build.gdp_dash',
    title: 'GDP Dash',
    repository: 'neeljaiswal90/stock-tracker',
    url: 'https://github.com/neeljaiswal90/stock-tracker',
    defaultBranch: 'main',
    summary: 'A Streamlit data explorer for comparing historical GDP trends across countries.',
    technologies: ['Python', 'Streamlit', 'Pandas'],
    highlights: ['Country filters', 'Historical trends', 'Deployable dashboard'],
  },
];
