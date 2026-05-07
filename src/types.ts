export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  lastUpdated: string;
  history: number[];
}

export interface Company {
  symbol: string;
  name: string;
  isin: string;
  market: string;
  sector?: string;
}

export type ViewMode = 'markets' | 'analysis' | 'agents';

export type DataSource = 'simulated' | 'ibkr' | 'external_api';

export interface AppState {
  dataSource: DataSource;
  isConnected: boolean;
  lastError: string | null;
}

export interface AgentTrigger {
  id: string;
  stockSymbol: string;
  condition: 'above' | 'below' | 'change_percent';
  threshold: number;
  status: 'active' | 'triggered' | 'disabled';
  action: string;
}

export interface FundamentalAnalysis {
  companyHistory: string;
  businessModel: string;
  financialHealth: {
    score: number; // 0-100
    strengths: string[];
    weaknesses: string[];
    keyMetrics: { label: string; value: string }[];
  };
  marketPosition: string;
  moatType: string;
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  riskRating: 'Low' | 'Medium' | 'High';
  recommendation: string;
  summary: string;
  lastUpdated: string;
}

export interface SentimentAnalysis {
  score: number; // -100 to 100
  label: 'Zeer Negatief' | 'Negatief' | 'Neutraal' | 'Positief' | 'Zeer Positief';
  summary: string;
  recentNews: {
    title: string;
    source: string;
    date: string;
    sentiment: 'Positive' | 'Negative' | 'Neutral';
    impact: string;
  }[];
  socialMediaBuzz: {
    platform: string;
    trend: 'Rising' | 'Falling' | 'Stable';
    volume: string;
  }[];
  lastUpdated: string;
}
