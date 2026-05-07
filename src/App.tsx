/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { Activity, Bell, Cpu, BarChart3, Search, Clock, Zap, Layout, Settings, Link, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { StockService } from './services/stockService';
import { Stock, DataSource } from './types';

export default function App() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [lastTick, setLastTick] = useState<string>(new Date().toLocaleTimeString());
  const [dataSource, setDataSource] = useState<DataSource>('simulated');
  const [ibkrUrl, setIbkrUrl] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setStocks(StockService.getStocks());
    const interval = setInterval(async () => {
      try {
        const updated = await StockService.update();
        setStocks(updated);
        setLastTick(new Date().toLocaleTimeString());
        setIsConnected(true);
        setErrorMessage(null);
        
        if (selectedStock) {
          const found = updated.find(s => s.symbol === selectedStock.symbol);
          if (found) setSelectedStock(found);
        }
      } catch (err: any) {
        setIsConnected(false);
        setErrorMessage(err.message || "Verbinding verbroken");
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedStock, dataSource]);

  const handleSourceChange = (source: DataSource) => {
    setDataSource(source);
    setErrorMessage(null);
    StockService.setSource(source, ibkrUrl);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-brand-bg text-brand-accent font-sans select-none">
      {/* Header: Architectural & Clean */}
      <header className="h-16 border-b border-brand-border px-8 flex items-center justify-between bg-brand-bg/50 backdrop-blur-xl z-50">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] tracking-[0.3em] text-brand-muted uppercase font-semibold">Intelligence Node</span>
            <h1 className="text-xl font-serif italic tracking-tight">Alpha Terminal v1.1</h1>
          </div>
          <div className="h-6 w-[1px] bg-brand-border"></div>
          <div className="flex gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 bg-brand-section border border-brand-border rounded-full`}>
              <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px] ${isConnected ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-rose-500 shadow-rose-500/40'}`}></div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                {dataSource === 'simulated' ? 'AEX Live Stream (SIM)' : 'TWS Interface'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-brand-muted">Amsterdam Market</div>
            <div className="text-sm font-mono text-zinc-300">{lastTick}</div>
          </div>
          <div className="flex items-center gap-2">
             <button className="w-10 h-10 flex items-center justify-center border border-brand-border rounded-lg hover:bg-brand-section transition-colors text-zinc-400 hover:text-white">
                <Search className="w-4 h-4" />
             </button>
             <button className="w-10 h-10 flex items-center justify-center border border-brand-border rounded-lg hover:bg-brand-section transition-colors text-zinc-400 hover:text-white">
                <Bell className="w-4 h-4" />
             </button>
          </div>
        </div>
      </header>

      {/* Main Modular Interface */}
      <main className="flex-1 flex overflow-hidden p-6 gap-6">
        
        {/* Sidebar: Modular Navigation */}
        <nav className="w-16 flex flex-col gap-4 flex-shrink-0">
          <div className="w-16 h-16 bg-brand-section border border-brand-border rounded-xl flex items-center justify-center text-emerald-500 shadow-xl cursor-pointer">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div className="w-16 h-16 border border-brand-border rounded-xl flex items-center justify-center text-brand-dim hover:text-brand-muted transition-colors cursor-pointer group relative">
            <Zap className="w-7 h-7" />
            <span className="absolute left-20 bg-black text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 border border-brand-border text-brand-muted">Agent Triggers</span>
          </div>
          <div className="w-16 h-16 border border-brand-border rounded-xl flex items-center justify-center text-brand-dim hover:text-brand-muted transition-colors cursor-pointer group relative">
            <Layout className="w-7 h-7" />
            <span className="absolute left-20 bg-black text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 border border-brand-border text-brand-muted">Analysis Modules</span>
          </div>
          <div className="mt-auto">
            <div className="w-16 h-16 border border-brand-border rounded-xl flex items-center justify-center text-brand-dim hover:text-brand-muted transition-colors cursor-pointer">
              <Settings className="w-6 h-6" />
            </div>
          </div>
        </nav>

        {/* Primary Content: Live Quotes */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden min-w-0">
          <section className="flex-1 bg-brand-panel border border-brand-border rounded-2xl p-8 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-end mb-10 flex-shrink-0">
              <div>
                <h2 className="text-4xl font-serif italic mb-1 text-white">Amsterdam Exchange</h2>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-2xl text-emerald-400">894.20</span>
                  <div className="flex items-center gap-1 text-emerald-500 font-mono text-xs">
                    <Activity className="w-3 h-3" />
                    <span>+4.12 (0.47%)</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-white text-black text-[10px] font-bold uppercase tracking-tighter rounded">Real-Time Data</span>
                <span className="px-3 py-1 border border-brand-border text-brand-muted text-[10px] uppercase tracking-tighter rounded">INDEX: AEX</span>
              </div>
            </div>

            {/* Modular Table Structure */}
            <div className="flex-1 flex flex-col min-h-0 bg-brand-section border border-brand-border rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 bg-brand-section/80 border-b border-brand-border p-4 text-[11px] uppercase tracking-widest text-brand-muted font-bold">
                <div className="col-span-1">Pos</div>
                <div className="col-span-5">Instrument</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Momentum</div>
                <div className="col-span-2 text-right">Volatility</div>
              </div>
              
              <div className="flex-1 overflow-y-auto overflow-x-hidden divide-y divide-brand-border scrollbar-hide">
                {stocks.map((stock, idx) => (
                  <motion.div 
                    key={stock.symbol}
                    layoutId={stock.symbol}
                    onClick={() => setSelectedStock(stock)}
                    className={`grid grid-cols-12 p-4 items-center hover:bg-brand-section transition-all cursor-pointer border-brand-border ${selectedStock?.symbol === stock.symbol ? 'bg-brand-bg border-l-2 border-l-emerald-500' : ''}`}
                  >
                    <div className="col-span-1 font-mono text-xs text-brand-dim">{(idx + 1).toString().padStart(2, '0')}</div>
                    <div className="col-span-5 flex flex-col">
                      <span className="font-bold text-white text-sm">{stock.name}</span>
                      <span className="text-[10px] text-brand-dim uppercase tracking-wider font-mono">{stock.symbol}</span>
                    </div>
                    <div className="col-span-2 text-right font-mono text-sm tracking-tight">€{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <div className={`col-span-2 text-right font-mono text-xs ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.changePercent}%
                    </div>
                    <div className="col-span-2 flex justify-end gap-1 px-2">
                       <div className="flex items-center gap-0.5">
                         {stock.history.slice(-8).map((h, i) => (
                           <div key={i} className={`w-1 h-3 rounded-full opacity-30 ${stock.change >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ height: `${20 + (i * 10)}%` }} />
                         ))}
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-5 border border-dashed border-brand-border rounded-xl flex items-center justify-between text-brand-dim italic text-xs bg-brand-bg/30">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-brand-dim/50" />
                <span>Future Expansion: Deploy Independent Trading Agents</span>
              </div>
              <div className="flex gap-4 not-italic font-mono uppercase tracking-widest opacity-30 text-[10px]">
                <span>Node: AMS-01</span>
                <span>Thread: 004</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Panel: Agent Triggers Preview */}
        <aside className="w-80 flex flex-col gap-6 flex-shrink-0">
          <div className="h-[45%] bg-brand-panel border border-brand-border rounded-2xl p-6 flex flex-col">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-brand-muted mb-6 font-bold flex justify-between items-center">
              Agent Protocol & Config
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px] ${isConnected ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-rose-500 shadow-rose-500/40'}`} />
            </h3>

            <div className="mb-6 space-y-4">
              <div className="flex bg-brand-bg p-1 rounded-lg border border-brand-border">
                <button 
                  onClick={() => handleSourceChange('simulated')}
                  className={`flex-1 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded transition-all ${dataSource === 'simulated' ? 'bg-brand-section text-white' : 'text-brand-dim hover:text-brand-muted'}`}
                >
                  Simulate
                </button>
                <button 
                  onClick={() => handleSourceChange('ibkr')}
                  className={`flex-1 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded transition-all ${dataSource === 'ibkr' ? 'bg-brand-section text-white' : 'text-brand-dim hover:text-brand-muted'}`}
                >
                  IBKR TWS
                </button>
              </div>
              
              {dataSource === 'ibkr' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[9px] text-brand-dim uppercase tracking-widest mb-1 block italic font-mono">TWS Bridge Endpoint</span>
                    <div className="relative">
                      <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-brand-dim" />
                      <input 
                        type="text" 
                        value={ibkrUrl}
                        onChange={(e) => {
                          setIbkrUrl(e.target.value);
                          StockService.setSource('ibkr', e.target.value);
                        }}
                        placeholder="http://localhost:8080" 
                        className="w-full bg-brand-bg border border-brand-border py-2 pl-8 pr-3 rounded text-[11px] font-mono focus:outline-none focus:border-emerald-500/50 transition-all text-emerald-400 placeholder:text-brand-dim/50"
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg"
                    >
                      <div className="flex items-center gap-2 text-rose-400 mb-1">
                        <Zap className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Connection Error</span>
                      </div>
                      <p className="text-[10px] text-rose-300 leading-tight italic">
                        {errorMessage}. Controleer of je TWS Bridge (bijv. Node-IBKR) draait en CORS toestaat.
                      </p>
                    </motion.div>
                  )}

                  {!errorMessage && isConnected && (
                    <div className="p-3 bg-brand-bg border border-brand-border rounded-lg text-[10px] text-brand-muted leading-tight">
                      <span className="text-emerald-500 font-bold block mb-1">Protocol: READY</span>
                      Gebruik een tunnel (ngrok) of lokale proxy voor directe TWS toegang vanuit de cloud.
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <AnimatePresence mode="wait">
              {selectedStock ? (
                <motion.div 
                  key="detail"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 flex-1 flex flex-col"
                >
                   <div className="flex justify-between items-start">
                     <div>
                       <span className="text-[10px] text-brand-dim uppercase block mb-1">Inspected Identity</span>
                       <h4 className="text-lg font-serif italic text-white">{selectedStock.name}</h4>
                     </div>
                     <div className={`text-right font-mono text-sm ${selectedStock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {selectedStock.changePercent}%
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-2">
                     <div className="p-3 bg-brand-section border border-brand-border rounded-lg">
                       <span className="text-[9px] text-brand-dim uppercase block mb-1">Peak</span>
                       <span className="text-xs font-mono">€{selectedStock.high}</span>
                     </div>
                     <div className="p-3 bg-brand-section border border-brand-border rounded-lg">
                       <span className="text-[9px] text-brand-dim uppercase block mb-1">Floor</span>
                       <span className="text-xs font-mono">€{selectedStock.low}</span>
                     </div>
                   </div>

                   <div className="mt-auto pt-4 border-t border-brand-border space-y-3">
                     <p className="text-[9px] text-brand-dim uppercase tracking-wider font-bold">Heuristic Control</p>
                     <button className="w-full py-3 bg-brand-section hover:bg-brand-border border border-brand-border text-[10px] font-bold tracking-widest uppercase rounded-lg transition-colors flex items-center justify-center gap-2">
                       <Cpu className="w-3 h-3" />
                       Assign Agent
                     </button>
                   </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4 flex-1 flex flex-col justify-center"
                >
                  <div className="flex items-center gap-4 text-brand-dim">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                    <span className="text-[11px] font-mono">Heuristic Engine Standby...</span>
                  </div>
                  <div className="h-[1px] w-full bg-brand-border"></div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-brand-dim uppercase tracking-wider">Active Triggers</span>
                    <div className="p-3 bg-brand-bg border border-brand-border rounded flex justify-between">
                      <span className="text-[11px] font-mono text-brand-muted italic">VOL_SPIKE_AEX</span>
                      <span className="text-[10px] text-brand-dim uppercase">Standby</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 bg-gradient-to-br from-brand-section to-brand-panel border border-brand-border rounded-2xl p-8 flex flex-col justify-end group shadow-inner">
            <div className="mb-auto">
              <div className="w-12 h-12 border border-brand-border rounded-xl mb-6 flex items-center justify-center text-emerald-400/50 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all">
                 <Activity className="w-6 h-6" />
              </div>
              <h4 className="text-2xl font-serif italic text-white leading-tight">Modular Evolution</h4>
              <p className="text-xs text-brand-muted mt-3 leading-relaxed">
                Platform architecture enables real-time heuristic triggers and autonomous analysis agents.
              </p>
            </div>
            <button className="w-full py-4 bg-brand-border hover:bg-zinc-800 text-xs font-bold tracking-[0.2em] uppercase rounded-xl transition-all border border-transparent hover:border-brand-muted">
              Configure Node
            </button>
          </div>
        </aside>
      </main>

      {/* Footer Bar */}
      <footer className="h-10 bg-brand-section border-t border-brand-border px-8 flex items-center justify-between text-[10px] font-mono text-brand-dim z-50">
        <div className="flex gap-8">
          <div className="flex items-center gap-2">
            <span className="text-brand-muted">SYSTEM STATUS:</span>
            <span className="text-emerald-500 font-bold uppercase">Operational</span>
          </div>
          <div>NET LATENCY: <span className="text-brand-muted font-bold">14ms</span></div>
          <div>CORE CLUSTER: <span className="text-brand-muted font-bold">AMS-01-TER</span></div>
        </div>
        <div className="uppercase tracking-widest text-[9px] font-bold text-brand-muted/50">&copy; 2026 NEURON SCALABLE SYSTEMS</div>
      </footer>
    </div>
  );
}
