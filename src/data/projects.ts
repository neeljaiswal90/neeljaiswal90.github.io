export type ProjectAccess = 'public-repo' | 'private-build' | 'live-app';

export interface ProjectRecord {
  id: string;
  claimId: string;
  title: string;
  repository?: string;
  url?: string;
  defaultBranch?: string;
  access: ProjectAccess;
  accessLabel: string;
  summary: string;
  technologies: readonly string[];
  highlights: readonly string[];
  boundary?: string;
}

/**
 * Selected public and private builds. Public links are included only when a
 * visitor can open the destination; private work is labelled without a dead
 * repository link.
 */
export const projects: readonly ProjectRecord[] = [
  {
    id: 'quant-futures-app',
    claimId: 'github.build.quant_futures_app',
    title: 'Quant Futures App',
    repository: 'neeljaiswal90/Quant-Futures-App',
    url: 'https://github.com/neeljaiswal90/Quant-Futures-App',
    defaultBranch: 'main',
    access: 'public-repo',
    accessLabel: 'Public repo',
    summary:
      'A deterministic futures research platform for replay-safe backtesting, held-out strategy validation, data lineage, and paper-market operations.',
    technologies: ['TypeScript', 'Python', 'React', 'Vitest'],
    highlights: ['Deterministic backtesting', 'Held-out validation', 'Operator console'],
    boundary: 'The repository limits its selected strategy to paper validation; live-money execution is out of scope.',
  },
  {
    id: 'habitflow',
    claimId: 'github.build.habitflow',
    title: 'HabitFlow',
    repository: 'neeljaiswal90/habitflow',
    url: 'https://github.com/neeljaiswal90/habitflow',
    defaultBranch: 'main',
    access: 'public-repo',
    accessLabel: 'Public repo',
    summary:
      'A personal habit tracker that brings daily check-ins, streaks, calendar views, heatmaps, journaling, and progress analytics into one focused experience.',
    technologies: ['React', 'TypeScript', 'Supabase', 'Tailwind'],
    highlights: ['Daily check-ins', 'Progress heatmap', 'Journal + CSV export'],
  },
  {
    id: 'orderflow',
    claimId: 'build.orderflow',
    title: 'Orderflow',
    repository: 'neeljaiswal90/mnq-orderflow',
    defaultBranch: 'main',
    access: 'private-build',
    accessLabel: 'Private build',
    summary:
      'A desktop order-flow analytics workspace with live market-data capture, normalized order-book state, WebGPU liquidity heatmaps, and replayable signal detectors.',
    technologies: ['Python', 'React', 'Tauri', 'WebGPU'],
    highlights: ['Live L2 capture', 'Liquidity heatmap', 'Replayable signals'],
    boundary: 'Built for decision support, not automated trading.',
  },
  {
    id: 'stocks-screener',
    claimId: 'build.stocks_screener',
    title: 'Stocks Screener',
    access: 'private-build',
    accessLabel: 'Private build',
    summary:
      'A research-focused stock screener that ranks U.S. equities across momentum, relative strength, trend quality, volume, and risk-quality signals.',
    technologies: ['Python', 'Webull OpenAPI', 'Alpha Vantage', 'Pandas'],
    highlights: ['Composite ranking', 'Momentum filters', 'Risk-aware scoring'],
    boundary: 'Built for research and screening support, not automated trading.',
  },
  {
    id: 'fitness-app',
    claimId: 'build.fitness_app',
    title: 'Fitness App',
    url: 'https://neeltraining.lovable.app/',
    access: 'live-app',
    accessLabel: 'Live app',
    summary:
      'A live fitness and training experience for organizing workouts and supporting a more consistent training routine.',
    technologies: ['Product Design', 'Training UX', 'Responsive Web'],
    highlights: ['Workout planning', 'Mobile-first experience', 'Live product'],
  },
  {
    id: 'gdp-dash',
    claimId: 'github.build.gdp_dash',
    title: 'GDP Dash',
    repository: 'neeljaiswal90/stock-tracker',
    url: 'https://github.com/neeljaiswal90/stock-tracker',
    defaultBranch: 'main',
    access: 'public-repo',
    accessLabel: 'Public repo',
    summary: 'A Streamlit data explorer for comparing historical GDP trends across countries.',
    technologies: ['Python', 'Streamlit', 'Pandas'],
    highlights: ['Country filters', 'Historical trends', 'Deployable dashboard'],
  },
];
