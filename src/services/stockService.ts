import { Stock, DataSource } from '../types';
import axios from 'axios';

const AEX_STOCKS = [
  { symbol: 'AD.AS', name: 'Ahold Delhaize', initialPrice: 28.45, conId: '43645865' },
  { symbol: 'ASML.AS', name: 'ASML Holding', initialPrice: 890.20, conId: '5401' },
  { symbol: 'INGA.AS', name: 'ING Groep', initialPrice: 15.12, conId: '14264' },
  { symbol: 'RDSA.AS', name: 'Shell', initialPrice: 32.80, conId: '4271317' },
  { symbol: 'ADYEN.AS', name: 'Adyen', initialPrice: 1450.00, conId: '319694732' },
  { symbol: 'UNA.AS', name: 'Unilever', initialPrice: 48.60, conId: '14107' },
  { symbol: 'PRX.AS', name: 'Prosus', initialPrice: 34.20, conId: '379105436' },
  { symbol: 'HEIA.AS', name: 'Heineken', initialPrice: 92.15, conId: '14013' },
  { symbol: 'DSM.AS', name: 'DSM-Firmenich', initialPrice: 105.40, conId: '596662763' },
  { symbol: 'WKL.AS', name: 'Wolters Kluwer', initialPrice: 142.30, conId: '14319' },
];

export class StockService {
  private static source: DataSource = 'simulated';
  private static ibkrEndpoint: string = '';
  
  private static stocks: Stock[] = AEX_STOCKS.map(s => ({
    symbol: s.symbol,
    name: s.name,
    price: s.initialPrice,
    change: 0,
    changePercent: 0,
    high: s.initialPrice,
    low: s.initialPrice,
    volume: Math.floor(Math.random() * 1000000),
    lastUpdated: new Date().toISOString(),
    history: [s.initialPrice, s.initialPrice, s.initialPrice, s.initialPrice, s.initialPrice],
  }));

  static setSource(source: DataSource, endpoint: string = '') {
    this.source = source;
    this.ibkrEndpoint = endpoint;
  }

  static getStocks(): Stock[] {
    return [...this.stocks];
  }

  static async update(): Promise<Stock[]> {
    if (this.source === 'simulated') {
      return this.simulateUpdate();
    } else if (this.source === 'ibkr') {
      return this.fetchFromIBKR();
    }
    return this.stocks;
  }

  private static simulateUpdate(): Stock[] {
    this.stocks = this.stocks.map(stock => {
      const volatility = 0.002;
      const change = stock.price * (Math.random() * volatility * 2 - volatility);
      const newPrice = Number((stock.price + change).toFixed(2));
      const initial = AEX_STOCKS.find(s => s.symbol === stock.symbol)!.initialPrice;
      const totalDiff = Number((newPrice - initial).toFixed(2));
      const percent = Number(((totalDiff / initial) * 100).toFixed(2));

      return {
        ...stock,
        price: newPrice,
        change: totalDiff,
        changePercent: percent,
        high: Math.max(stock.high, newPrice),
        low: Math.min(stock.low, newPrice),
        lastUpdated: new Date().toISOString(),
        history: [...stock.history.slice(-19), newPrice],
      };
    });
    return [...this.stocks];
  }

  private static async fetchFromIBKR(): Promise<Stock[]> {
    if (!this.ibkrEndpoint) return this.stocks;
    
    try {
      const response = await axios.get(`${this.ibkrEndpoint}/api/v1/market-data`, {
        timeout: 5000,
        headers: {
          'Accept': 'application/json'
        }
      });
      if (response.data) {
        // Transform logic would go here
        return this.stocks; 
      }
    } catch (error: any) {
       let errorMsg = "IBKR Gateway onbereikbaar";
       if (error.code === 'ERR_NETWORK') {
         errorMsg = "Netwerk fout: Check Mixed Content/CORS";
       } else if (error.code === 'ECONNABORTED') {
         errorMsg = "Verbindingstime-out";
       }
       console.error("IBKR Connection Failed:", error);
       throw new Error(errorMsg);
    }
    
    return this.stocks;
  }
}
