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
